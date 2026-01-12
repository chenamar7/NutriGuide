"""
######################################################################
# NUTRI-GUIDE ETL SCRIPT (SR LEGACY VERSION)
# Purpose: Load USDA SR Legacy Foods into MySQL
# Authors: Omri Nahum & Chen Amar
# 
# DATA SOURCE: USDA FoodData Central - SR Legacy
#   - 7,793 curated generic foods
#   - 28 food categories
#   - ~30 nutrients per food (rich data)
#
# REQUIREMENTS:
#   pip install pandas pymysql
######################################################################
"""

import pandas as pd
import pymysql
import os
from datetime import datetime

# =====================================================================
# CONFIGURATION
# =====================================================================

DATA_DIR = r"C:\Users\User\NutriGuide\usda_data_sr_legacy"

DB_USER = "root"
DB_PASSWORD = "root"
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "nutri_guide_db"

# 34 selected nutrients (macros, vitamins, minerals)
SELECTED_NUTRIENT_IDS = [
    1003, 1004, 1005, 1008, 1079, 2000,  # Macros: Protein, Fat, Carbs, Energy, Fiber, Sugars
    1257, 1258, 1292, 1293, 1253,         # Fats: Trans, Saturated, Mono, Poly, Cholesterol
    1087, 1089, 1090, 1091, 1092, 1093, 1095, 1098, 1101, 1103,  # Minerals
    1106, 1109, 1114, 1162, 1165, 1166, 1167, 1170, 1175, 1177, 1178, 1180, 1185  # Vitamins
]

# Unit normalization: standardize unit names
UNIT_MAP = {'UG': 'mcg', 'MG': 'mg', 'G': 'g', 'KCAL': 'kcal', 'IU': 'IU'}

# =====================================================================
# HELPER FUNCTIONS
# =====================================================================

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

def get_connection():
    return pymysql.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER,
        password=DB_PASSWORD, database=DB_NAME, charset='utf8mb4'
    )

def load_csv(filename, usecols=None):
    path = os.path.join(DATA_DIR, filename)
    log(f"Loading {filename}...")
    df = pd.read_csv(path, usecols=usecols, low_memory=False)
    log(f"  -> {len(df):,} rows")
    return df

def insert_df(cursor, table, df, cols, ignore=False):
    if len(df) == 0:
        return 0
    placeholders = ', '.join(['%s'] * len(cols))
    cmd = "INSERT IGNORE" if ignore else "INSERT"
    sql = f"{cmd} INTO {table} ({', '.join(cols)}) VALUES ({placeholders})"
    data = [tuple(row) for row in df[cols].values]
    cursor.executemany(sql, data)
    return len(data)

# =====================================================================
# ETL STEPS
# =====================================================================

def etl_categories(cursor):
    log("=" * 50)
    log("STEP 1: Food Categories")
    log("=" * 50)
    
    df = load_csv("food_category.csv", ["id", "description"])
    df.columns = ["category_id", "category_name"]
    
    count = insert_df(cursor, "Food_Categories", df, ["category_id", "category_name"])
    log(f"  [OK] Loaded {count} categories")
    return set(df["category_id"])

def etl_nutrients(cursor):
    log("=" * 50)
    log("STEP 2: Nutrients (with unit normalization)")
    log("=" * 50)
    
    df = load_csv("nutrient.csv", ["id", "name", "unit_name"])
    df = df[df["id"].isin(SELECTED_NUTRIENT_IDS)]
    df.columns = ["nutrient_id", "nutrient_name", "unit_name"]
    
    # Unit normalization: UG -> mcg, etc.
    df["unit_name"] = df["unit_name"].str.upper().map(lambda u: UNIT_MAP.get(u, u.lower()))
    
    count = insert_df(cursor, "Nutrients", df, ["nutrient_id", "nutrient_name", "unit_name"])
    log(f"  [OK] Loaded {count} nutrients")
    return set(df["nutrient_id"])

def etl_foods(cursor, valid_categories):
    log("=" * 50)
    log("STEP 3: Foods")
    log("=" * 50)
    
    df = load_csv("food.csv", ["fdc_id", "description", "food_category_id"])
    df.columns = ["food_id", "name", "food_category_id"]
    df = df[df["food_category_id"].isin(valid_categories)]
    df["name"] = df["name"].str.strip().str[:255]
    
    count = insert_df(cursor, "Foods", df, ["food_id", "name", "food_category_id"])
    log(f"  [OK] Loaded {count:,} foods")
    return set(df["food_id"])

def etl_food_nutrients(cursor, conn, valid_foods, valid_nutrients):
    log("=" * 50)
    log("STEP 4: Food_Nutrients")
    log("=" * 50)
    
    df = load_csv("food_nutrient.csv", ["fdc_id", "nutrient_id", "amount"])
    
    # Filter and clean
    df = df[df["fdc_id"].isin(valid_foods) & df["nutrient_id"].isin(valid_nutrients)]
    df = df[df["amount"].notna() & (df["amount"] >= 0)]
    df = df.drop_duplicates(subset=["fdc_id", "nutrient_id"])
    df.columns = ["food_id", "nutrient_id", "amount_per_100g"]
    
    log(f"  -> {len(df):,} records after cleaning")
    
    # Insert in batches
    total = 0
    for i in range(0, len(df), 50000):
        batch = df.iloc[i:i+50000]
        total += insert_df(cursor, "Food_Nutrients", batch, 
                          ["food_id", "nutrient_id", "amount_per_100g"], ignore=True)
        conn.commit()
    
    log(f"  [OK] Loaded {total:,} records")
    return total

def etl_seed_content(cursor):
    log("=" * 50)
    log("STEP 5: Educational Content")
    log("=" * 50)
    
    facts = [
        ("Iron deficiency is the most common nutritional deficiency worldwide.", "Iron"),
        ("Vitamin C helps your body absorb iron from plant-based foods.", "Vitamins"),
        ("Your body can produce Vitamin D when exposed to sunlight.", "Vitamins"),
        ("Protein is essential for muscle repair and growth.", "Protein"),
        ("Fiber helps maintain healthy digestion and can lower cholesterol.", "Fiber"),
    ]
    cursor.executemany("INSERT INTO Daily_Facts (fact_text, category) VALUES (%s, %s)", facts)
    log(f"  [OK] Loaded {len(facts)} daily facts")

# =====================================================================
# MAIN
# =====================================================================

def run_etl():
    start = datetime.now()
    
    print("\n" + "=" * 50)
    print("  NUTRI-GUIDE ETL (SR LEGACY)")
    print("=" * 50 + "\n")
    
    conn = get_connection()
    cursor = conn.cursor()
    log("Connected to MySQL")
    
    try:
        categories = etl_categories(cursor)
        conn.commit()
        
        nutrients = etl_nutrients(cursor)
        conn.commit()
        
        foods = etl_foods(cursor, categories)
        conn.commit()
        
        fn_count = etl_food_nutrients(cursor, conn, foods, nutrients)
        
        etl_seed_content(cursor)
        conn.commit()
        
        # Summary
        print("\n" + "=" * 50)
        print("  ETL COMPLETE!")
        print("=" * 50)
        print(f"  Categories:     {len(categories):,}")
        print(f"  Nutrients:      {len(nutrients):,}")
        print(f"  Foods:          {len(foods):,}")
        print(f"  Food_Nutrients: {fn_count:,}")
        print(f"  Time:           {datetime.now() - start}")
        print("=" * 50)
        
        if fn_count >= 100000:
            print("\n[OK] SUCCESS: Exceeded 100K record requirement!")
    
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_etl()
