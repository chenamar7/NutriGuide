-- Food Optimizer Query
-- Finds foods that efficiently fill multiple macro gaps
-- Uses dynamic placeholders that get replaced from config/foodFilters.js
-- Placeholders: BLACKLIST, CATEGORIES, CAL_MIN, CAL_MAX, MAX_NAME_LEN, MIN_GAPS, LIMIT
-- Parameters: proteinDeficit, fatDeficit, carbsDeficit, userId

WITH GapNutrients AS (
    -- Define the gaps to fill (passed from gap analysis results)
    SELECT 1003 AS nutrient_id, ? AS deficit  -- Protein
    UNION ALL SELECT 1004, ?                   -- Fat
    UNION ALL SELECT 1005, ?                   -- Carbs
),
TodaysFoods AS (
    -- Exclude foods already eaten today
    SELECT DISTINCT food_id
    FROM User_Food_Log
    WHERE user_id = ? AND DATE(date_eaten) = CURDATE()
),
FoodCalories AS (
    -- Get calories per 100g for each food
    SELECT food_id, amount_per_100g AS calories_per_100g
    FROM Food_Nutrients
    WHERE nutrient_id = 1008
),
FoodScores AS (
    SELECT 
        f.food_id,
        f.name,
        fc.category_name,
        fc.category_id,
        fcal.calories_per_100g,
        -- Efficiency score: how much of each gap does 100g fill (capped at 1.0)
        SUM(LEAST(fn.amount_per_100g / NULLIF(gn.deficit, 0), 1.0)) AS efficiency_score,
        -- Count how many different gaps this food addresses
        COUNT(DISTINCT fn.nutrient_id) AS gaps_addressed,
        -- Detail string showing macro content
        GROUP_CONCAT(
            CONCAT(n.nutrient_name, ': ', ROUND(fn.amount_per_100g, 1), n.unit_name)
            SEPARATOR ' | '
        ) AS macros_detail
    FROM Foods f
    JOIN Food_Nutrients fn ON f.food_id = fn.food_id
    JOIN GapNutrients gn ON fn.nutrient_id = gn.nutrient_id
    JOIN Nutrients n ON fn.nutrient_id = n.nutrient_id
    JOIN Food_Categories fc ON f.food_category_id = fc.category_id
    JOIN FoodCalories fcal ON f.food_id = fcal.food_id
    WHERE f.food_id NOT IN (SELECT food_id FROM TodaysFoods)
      AND fn.amount_per_100g > 0
      -- Dynamic filters from config (replaced at runtime)
      AND fc.category_name IN ({{CATEGORIES}})
      AND fcal.calories_per_100g BETWEEN {{CAL_MIN}} AND {{CAL_MAX}}
      AND LENGTH(f.name) < {{MAX_NAME_LEN}}
      {{BLACKLIST}}
    GROUP BY f.food_id, f.name, fc.category_name, fc.category_id, fcal.calories_per_100g
    HAVING gaps_addressed >= {{MIN_GAPS}}
),
RankedByCategory AS (
    -- Rank foods within each category for variety
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY efficiency_score DESC) AS rank_in_category
    FROM FoodScores
)
SELECT 
    food_id,
    name,
    category_name,
    ROUND(calories_per_100g, 0) AS calories_per_100g,
    ROUND(efficiency_score, 3) AS efficiency_score,
    gaps_addressed,
    macros_detail
FROM RankedByCategory
WHERE rank_in_category = 1
ORDER BY efficiency_score DESC
LIMIT {{LIMIT}};