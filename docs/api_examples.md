# NutriGuide API Reference

Base URL: `http://localhost:3000`

---

## 🔐 Auth Endpoints

### Register
```
POST /api/auth/register
Content-Type: application/json

{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
    "email": "test@example.com",
    "password": "password123"
}

Response: { "token": "eyJhbG...", "user": {...} }
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer YOUR_TOKEN
```

### Delete User (Admin Only)
```
DELETE /api/auth/:userId
Authorization: Bearer ADMIN_TOKEN
```

---

## 👤 Profile Endpoints

### Get Profile
```
GET /api/profile
Authorization: Bearer YOUR_TOKEN
```

### Update Profile
```
PUT /api/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
    "birth_date": "1995-05-15",
    "gender": "Male",
    "height_cm": 175,
    "weight_kg": 70,
    "activity_level": "Moderate",
    "goal": "Maintain"
}
```

### Calculate Macro Targets
```
POST /api/profile/calculate
Authorization: Bearer YOUR_TOKEN

Response: { target_calories, target_protein_g, target_carbs_g, target_fat_g }
```

---

## 🍎 Food Endpoints

### Get All Categories
```
GET /api/foods/categories

Response: { "categories": [{ "category_id": 1, "category_name": "Dairy..." }] }
```

### Search Foods
```
GET /api/foods/search?q=chicken&limit=10&page=1&category_id=5&min_cal=100&max_cal=300

Query params (all optional except q):
- q: Search term (required)
- limit: Results per page (default 20)
- page: Page number (default 1)
- category_id: Filter by category
- min_cal, max_cal: Calorie range filter
```

### Get Food Details
```
GET /api/foods/:food_id

Response: { "food": { "food_id", "name", "category_name", "nutrients": [...] } }
```

---

## 📝 Food Log Endpoints

### Log a Food
```
POST /api/log
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
    "food_id": 167512,
    "serving_size_grams": 150,
    "date_eaten": "2025-12-22"  // optional, defaults to now
}
```

### Get Today's Log
```
GET /api/log/today
Authorization: Bearer YOUR_TOKEN
```

### Get Log by Date
```
GET /api/log?date=2025-12-22
Authorization: Bearer YOUR_TOKEN
```

### Get Log History
```
GET /api/log/history?days=7
Authorization: Bearer YOUR_TOKEN
```

### Update Log Entry
```
PUT /api/log/:log_id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
    "serving_size_grams": 200
}
```

### Delete Log Entry
```
DELETE /api/log/:log_id
Authorization: Bearer YOUR_TOKEN
```

---

## 📊 Analysis Endpoints

### Gap Analysis - Today
```
GET /api/analysis/gap
Authorization: Bearer YOUR_TOKEN

Response: { "gaps": [{ "macro_name", "consumed", "target", "deficit", "percent_met" }] }
```

### Gap Analysis - By Date
```
GET /api/analysis/gap?date=2025-12-22
Authorization: Bearer YOUR_TOKEN
```

### Food Recommendations
```
GET /api/analysis/recommendations
Authorization: Bearer YOUR_TOKEN

Response: { "recommendations": [{ "food_id", "name", "efficiency_score", "gaps_addressed" }] }
```

### Weekly Trends
```
GET /api/analysis/trends
Authorization: Bearer YOUR_TOKEN

Response: { "trends": [{ "nutrient_name", "current_week_avg", "previous_week_avg", "trend" }] }
```

### Logging Streak
```
GET /api/analysis/streak
Authorization: Bearer YOUR_TOKEN

Response: { "current_streak", "longest_streak_ever", "last_logged_date", "streak_status" }
```

### Effective Foods
```
GET /api/analysis/effective?nutrient_id=1003&days=30
Authorization: Bearer YOUR_TOKEN

Response: { "foods": [{ "food_name", "times_eaten", "total_contributed", "percent_of_total" }] }
```

---

## 💡 Facts Endpoints (Public)

### Get Random Fact
```
GET /api/facts/random
GET /api/facts/random?category=Vitamins

Response: { "fact": { "fact_id", "fact_text", "category" } }
```

### Get All Facts
```
GET /api/facts
GET /api/facts?category=Minerals

Response: { "facts": [...], "count": 104 }
```

### Get Fact Categories
```
GET /api/facts/categories

Response: { "categories": [{ "category": "Vitamins", "count": 17 }] }
```

### Get Fact by ID
```
GET /api/facts/:fact_id
```

---

## 🎮 Challenge Endpoints

### Get Random Challenge
```
GET /api/challenges/random
GET /api/challenges/random?category=Vitamins&exclude=1,2,3

Query params:
- category: Filter by category (Vitamins, Minerals, Macros, Food Sources, General)
- exclude: Comma-separated IDs to exclude (for "no repeat in session")

Response: {
    "challenge": {
        "challenge_id": 1,
        "title": "Sunshine Vitamin",
        "question": "Which vitamin can your body produce when exposed to sunlight?",
        "category": "Vitamins",
        "options": [
            { "option_id": 1, "option_text": "Vitamin A" },
            { "option_id": 2, "option_text": "Vitamin C" },
            { "option_id": 3, "option_text": "Vitamin D" },
            { "option_id": 4, "option_text": "Vitamin K" }
        ]
    }
}
```

### Get Challenge Categories
```
GET /api/challenges/categories

Response: { "categories": [{ "category": "Vitamins", "count": 11 }] }
```

### Get Challenge Count
```
GET /api/challenges/count
GET /api/challenges/count?category=Minerals

Response: { "total": 64, "category": "all" }
```

### Get User Challenge Stats (Requires Auth)
```
GET /api/challenges/stats
Authorization: Bearer YOUR_TOKEN

Response: { "stats": { "score": 15, "current_streak": 3, "best_streak": 7, "total_challenges": 64 } }
```

### Get Challenge by ID
```
GET /api/challenges/:challenge_id
```

### Submit Answer
```
POST /api/challenges/:challenge_id/answer
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN  (optional - for score tracking)

{
    "option_id": 3
}

Response: {
    "correct": true,
    "correct_answer_id": 3,
    "correct_answer_text": "Vitamin D"
}
```

---

## 🔧 Admin Endpoints (Admin Only)

### Platform Dashboard
```
GET /api/admin/dashboard
Authorization: Bearer ADMIN_TOKEN

Response: Platform-wide statistics (users, activity, content)
```

### Nutrient Deficiencies Report
```
GET /api/admin/deficiencies
Authorization: Bearer ADMIN_TOKEN

Response: Which nutrients users struggle with most
```

### Category Popularity by Goal
```
GET /api/admin/popular-categories
Authorization: Bearer ADMIN_TOKEN

Response: Which food categories are popular for Loss/Maintain/Gain goals
```

---

## 📌 Nutrient IDs Reference

| ID   | Nutrient    | Unit |
|------|-------------|------|
| 1003 | Protein     | g    |
| 1004 | Total Fat   | g    |
| 1005 | Carbs       | g    |
| 1008 | Calories    | kcal |
| 1079 | Fiber       | g    |
| 1087 | Calcium     | mg   |
| 1089 | Iron        | mg   |
| 1090 | Magnesium   | mg   |
| 1092 | Potassium   | mg   |
| 1093 | Sodium      | mg   |
| 1095 | Zinc        | mg   |
| 1106 | Vitamin A   | µg   |
| 1162 | Vitamin C   | mg   |
| 1114 | Vitamin D   | µg   |
| 1109 | Vitamin E   | mg   |
| 1183 | Vitamin K   | µg   |
| 1165 | Vitamin B1  | mg   |
| 1166 | Vitamin B2  | mg   |
| 1167 | Vitamin B3  | mg   |
| 1175 | Vitamin B6  | mg   |
| 1177 | Folate      | µg   |
| 1178 | Vitamin B12 | µg   |

---

## 🎯 Quick Test Flow

1. **Register** → POST /api/auth/register
2. **Login** → POST /api/auth/login (save token)
3. **Update Profile** → PUT /api/profile
4. **Calculate Targets** → POST /api/profile/calculate
5. **Search Food** → GET /api/foods/search?q=chicken
6. **Log Food** → POST /api/log
7. **View Gap Analysis** → GET /api/analysis/gap
8. **Get Recommendations** → GET /api/analysis/recommendations
9. **Play Challenge** → GET /api/challenges/random → POST /api/challenges/:id/answer
