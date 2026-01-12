# 🥗 NutriGuide - Comprehensive Execution Plan

> **Team:** Omri Nahum & Chen Amar  
> **Stack:** Node.js (Express) + MySQL + React  
> **Academic Focus:** Complex SQL queries demonstrating advanced database concepts

---

# 📊 Project Status Overview

| Phase | Description | Status | Notes |
|-------|-------------|--------|-------|
| Phase 0 | Database & SQL Validation | ✅ COMPLETE | 244K+ records loaded |
| Phase 1 | Backend Foundation | ✅ COMPLETE | Auth, Profile, Middleware |
| Phase 2 | Food System | ✅ COMPLETE | Search, Log, CRUD |
| Phase 3 | Gap Analysis Core | ✅ COMPLETE | The flagship feature |
| Phase 4 | Trends & Insights | ✅ COMPLETE | Streak, Weekly comparison |
| Phase 5 | Admin Analytics | ✅ COMPLETE | Dashboard, Reports |
| Phase 6 | Educational Content | ✅ COMPLETE | Facts & Challenges |
| Phase 7 | Frontend Development | 🔴 NOT STARTED | React + Tailwind |

---

# 📅 PHASE 0: Database & SQL Validation ✅ COMPLETE

## Data Loading Summary

| Table | Description | Record Count |
|-------|-------------|--------------|
| `Foods` | Individual food items from USDA SR Legacy | **7,793** |
| `Nutrients` | Tracked nutrients (vitamins, minerals, macros) | **34** |
| `Food_Nutrients` | Nutritional values per 100g for each food | **236,077** |
| `Food_Categories` | Food groupings (Dairy, Vegetables, etc.) | **28** |
| `Daily_Facts` | Educational nutrition facts | **104** |
| `Challenges` | Quiz questions with categories | **64** |
| `Challenge_Options` | Multiple choice answers (4 per challenge) | **256** |

**Total Records: ~244,000** (exceeds 100K academic requirement ✅)

## Critical Nutrient IDs (Used Throughout App)

These IDs are from USDA data - we use them for macro calculations:

| Nutrient ID | Name | Unit | Used For |
|-------------|------|------|----------|
| `1008` | Energy | KCAL | Calorie tracking, food filtering |
| `1003` | Protein | G | Macro breakdown, targets |
| `1004` | Total lipid (fat) | G | Macro breakdown, targets |
| `1005` | Carbohydrate | G | Macro breakdown, targets |

## Complex SQL Queries Implemented

Each query demonstrates specific SQL concepts for academic evaluation:

| Query | File | SQL Concepts |
|-------|------|--------------|
| Gap Analysis | `gapAnalysis.sql` | CTE, UNION ALL, COALESCE, Aggregation |
| Food Optimizer | `foodOptimizer.sql` | 4 CTEs, Window Functions, ROW_NUMBER, RANK |
| Weekly Trends | `weeklyTrends.sql` | YEARWEEK(), Date Functions, CASE |
| Streak Tracker | `streakTracker.sql` | Gap-and-Island, ROW_NUMBER, DATE_SUB |
| Effective Foods | `effectiveFoods.sql` | Nested Subquery, Percentage Calculation |
| Admin Dashboard | `adminDashboard.sql` | UNION ALL, NOT EXISTS, Multiple Aggregates |
| Deficiency Report | `adminDeficiencies.sql` | 3-level Nesting, RANK() Window Function |
| Category by Goal | `adminCategories.sql` | Pivot Pattern, Conditional Aggregation |

---

# 📅 PHASE 1: Backend Foundation ✅ COMPLETE

## Implemented Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express entry, middleware setup, route mounting
│   ├── config/
│   │   ├── db.js                 # MySQL pool with query() helper
│   │   └── foodFilters.js        # Configurable recommendation filters
│   ├── middleware/
│   │   └── auth.js               # authenticate + requireAdmin functions
│   ├── routes/
│   │   ├── authRoutes.js         # POST /register, /login, GET /me, DELETE /:userId
│   │   ├── profileRoutes.js      # GET/PUT /, POST /calculate
│   │   ├── foodRoutes.js         # GET /categories, /search, /:food_id
│   │   ├── logRoutes.js          # CRUD for food logging
│   │   ├── analysisRoutes.js     # Gap, recommendations, trends, streak, effective
│   │   ├── adminRoutes.js        # Dashboard, deficiencies, popular-categories
│   │   ├── factsRoutes.js        # Random, categories, all, by ID
│   │   └── challengesRoutes.js   # Random, categories, count, stats, answer
│   ├── services/
│   │   ├── authService.js        # register, login, getCurrentUser, deleteUser
│   │   ├── profileService.js     # getProfile, updateProfile, calculateTargets
│   │   ├── foodService.js        # getCategories, searchFoods, getFoodById
│   │   ├── logService.js         # logFood, getFoodLog, updateLogEntry, etc.
│   │   ├── analysisService.js    # All gap/recommendation logic
│   │   ├── adminService.js       # Admin-only analytics
│   │   ├── factsService.js       # Fact retrieval
│   │   └── challengesService.js  # Challenge logic + score tracking
│   └── queries/                  # Complex SQL stored as .sql files
│       ├── gapAnalysis.sql
│       ├── foodOptimizer.sql
│       ├── weeklyTrends.sql
│       ├── streakTracker.sql
│       ├── effectiveFoods.sql
│       ├── adminDashboard.sql
│       ├── adminDeficiencies.sql
│       └── adminCategories.sql
├── package.json
└── server.js                     # Starts on PORT 3000
```

## Authentication System

### Endpoints Implemented

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | ❌ | Creates user + empty profile |
| `/api/auth/login` | POST | ❌ | Returns JWT token (24h expiry) |
| `/api/auth/me` | GET | ✅ | Returns current user info |
| `/api/auth/:userId` | DELETE | Admin | Cascading delete of user data |

### JWT Token Structure
```javascript
{
  userId: 1,
  username: "testuser",
  isAdmin: false,
  iat: 1734888000,  // issued at
  exp: 1734974400   // expires (24h later)
}
```

### Password Handling
- Hashed with bcryptjs (10 salt rounds)
- Never stored or returned in plain text

## Profile System

### Endpoints Implemented

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/profile` | GET | ✅ | Get user's profile data |
| `/api/profile` | PUT | ✅ | Update any profile fields |
| `/api/profile/calculate` | POST | ✅ | Calculate & save macro targets |

### Macro Calculation Formula (calculateTargets)

1. **BMR (Basal Metabolic Rate)** using Mifflin-St Jeor:
   - Male: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5`
   - Female: `(10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161`

2. **TDEE (Total Daily Energy Expenditure):**
   - Light activity: BMR × 1.375
   - Moderate activity: BMR × 1.55
   - Heavy activity: BMR × 1.725

3. **Goal Adjustment:**
   - Loss: TDEE − 500 calories
   - Gain: TDEE + 400 calories
   - Maintain: TDEE unchanged

4. **Macro Split (percentages of calories):**
   - Protein: 25% → grams = (calories × 0.25) ÷ 4
   - Fat: 25% → grams = (calories × 0.25) ÷ 9
   - Carbs: Remaining calories ÷ 4

---

# 📅 PHASE 2: Food System ✅ COMPLETE

## Food Search

### Endpoint: `GET /api/foods/search`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | ✅ | Search term (min 2 chars) |
| `category_id` | int | ❌ | Filter by food category |
| `min_cal` | int | ❌ | Minimum calories per 100g |
| `max_cal` | int | ❌ | Maximum calories per 100g |
| `page` | int | ❌ | Page number (default: 1) |
| `limit` | int | ❌ | Results per page (default: 20, max: 100) |

### Response Structure
```json
{
  "foods": [
    {
      "food_id": 167512,
      "name": "Chicken, breast, grilled",
      "category_name": "Poultry Products",
      "calories_per_100g": 165
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Search Logic
- Prefix matches rank higher (e.g., "chicken breast" before "fried chicken")
- Shorter names rank higher (more specific foods)
- Uses SQL `LIKE` with `%term%` pattern

## Food Categories

28 categories from USDA SR Legacy:
- Dairy and Egg Products
- Spices and Herbs
- Baby Foods
- Fats and Oils
- Poultry Products
- Soups, Sauces, and Gravies
- Sausages and Luncheon Meats
- Breakfast Cereals
- Fruits and Fruit Juices
- Pork Products
- Vegetables and Vegetable Products
- Nut and Seed Products
- Beef Products
- Beverages
- Finfish and Shellfish Products
- Legumes and Legume Products
- Lamb, Veal, and Game Products
- Baked Products
- Sweets
- Cereal Grains and Pasta
- Fast Foods
- Meals, Entrees, and Side Dishes
- Snacks
- American Indian/Alaska Native Foods
- Restaurant Foods
- Alcoholic Beverages
- Other

## Food Logging

### Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `POST /api/log` | POST | ✅ | Log a food with serving size |
| `GET /api/log/today` | GET | ✅ | Get today's log entries |
| `GET /api/log?date=YYYY-MM-DD` | GET | ✅ | Get log for specific date |
| `GET /api/log/history?days=N` | GET | ✅ | Get past N days of logs |
| `PUT /api/log/:log_id` | PUT | ✅ | Update serving size |
| `DELETE /api/log/:log_id` | DELETE | ✅ | Remove log entry |

### Log Entry Structure (with calculated macros)
```json
{
  "log_id": 15,
  "food_id": 167512,
  "food_name": "Chicken, breast, grilled",
  "serving_size_grams": 150,
  "date_eaten": "2024-12-22",
  "calories": 247.5,     // (165 ÷ 100) × 150
  "protein_g": 46.5,     // calculated from Food_Nutrients
  "carbs_g": 0,
  "fat_g": 5.25
}
```

---

# 📅 PHASE 3: Gap Analysis Core ✅ COMPLETE

## The Flagship Feature

This is the main differentiator of NutriGuide - real-time nutrient gap identification.

### Endpoint: `GET /api/analysis/gap`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `date` | string | ❌ | YYYY-MM-DD format (default: today) |

### Response Structure
```json
{
  "gaps": [
    {
      "nutrient_name": "Vitamin C",
      "unit": "MG",
      "target": 90,
      "consumed": 25.5,
      "gap_amount": 64.5,
      "percentage_met": 28.33
    }
  ],
  "macros": {
    "calories": { "target": 2000, "consumed": 1450, "percentage": 72.5 },
    "protein": { "target": 150, "consumed": 95, "percentage": 63.3 },
    "carbs": { "target": 225, "consumed": 180, "percentage": 80 },
    "fat": { "target": 67, "consumed": 45, "percentage": 67.2 }
  }
}
```

### SQL Complexity (gapAnalysis.sql)
```sql
-- Uses CTE to calculate consumed nutrients
WITH DailyIntake AS (
    SELECT 
        fn.nutrient_id,
        SUM(fn.amount_per_100g * (ufl.serving_size_grams / 100)) as consumed
    FROM User_Food_Log ufl
    JOIN Food_Nutrients fn ON ufl.food_id = fn.food_id
    WHERE ufl.user_id = ? AND ufl.date_eaten = ?
    GROUP BY fn.nutrient_id
)
-- Joins with RDI values to calculate gaps
SELECT 
    n.nutrient_name,
    n.unit,
    COALESCE(rdi.rdi_value, n.default_rdi) as target,
    COALESCE(di.consumed, 0) as consumed,
    -- Calculate gap and percentage...
```

## Food Optimizer (Smart Recommendations)

### Endpoint: `GET /api/analysis/recommendations`

Returns foods that address multiple nutrient gaps simultaneously.

### Configurable Filters (`config/foodFilters.js`)
```javascript
module.exports = {
    blacklistKeywords: [
        'raw', 'unprepared', 'dry mix', 'powder',
        'infant', 'baby', 'formula', 'dehydrated'
    ],
    allowedCategories: [1, 5, 9, 11, 12, 15, 16, 18, 20],  // Healthy categories
    calorieRange: { min: 80, max: 330 },  // Per 100g
    maxNameLength: 60,       // Exclude overly specific items
    minGapsAddressed: 2,     // Must help with at least 2 nutrients
    maxRecommendations: 10   // Return top 10
};
```

### Response Structure
```json
{
  "recommendations": [
    {
      "food_id": 167512,
      "name": "Spinach, cooked",
      "category_name": "Vegetables",
      "calories_per_100g": 23,
      "gaps_addressed": 5,
      "gap_nutrients": "Vitamin A, Vitamin C, Iron, Folate, Magnesium",
      "composite_score": 87.5
    }
  ]
}
```

### SQL Complexity (foodOptimizer.sql)
Uses 4 CTEs:
1. `UserGaps` - Identifies nutrients below 80%
2. `TodayFoods` - Foods already eaten (to exclude)
3. `GoodFoods` - Filters to quality food items
4. `FoodScores` - Ranks by gaps addressed

---

# 📅 PHASE 4: Trends & Insights ✅ COMPLETE

## Weekly Trends

### Endpoint: `GET /api/analysis/trends`

Compares current week vs previous week intake.

### Response Structure
```json
{
  "trends": [
    {
      "nutrient_name": "Protein",
      "unit": "G",
      "current_week_avg": 145.5,
      "previous_week_avg": 120.3,
      "change_percentage": 20.9,
      "trend": "improving"  // or "declining" or "stable"
    }
  ]
}
```

## Streak Tracker

### Endpoint: `GET /api/analysis/streak`

Uses gap-and-island SQL technique to find consecutive logging days.

### Response
```json
{
  "current_streak": 7,
  "longest_streak": 14,
  "last_log_date": "2024-12-22",
  "total_log_days": 45
}
```

## Most Effective Foods

### Endpoint: `GET /api/analysis/effective`

Shows which foods contributed most to meeting targets.

### Response
```json
{
  "effective_foods": [
    {
      "food_name": "Salmon, Atlantic",
      "times_logged": 8,
      "avg_serving": 150,
      "top_nutrient": "Omega-3",
      "contribution_percentage": 45.2
    }
  ]
}
```

---

# 📅 PHASE 5: Admin Analytics ✅ COMPLETE

All admin routes require `authenticate` + `requireAdmin` middleware.

## Admin Dashboard

### Endpoint: `GET /api/admin/dashboard`

### Response
```json
{
  "stats": {
    "total_users": 150,
    "active_today": 45,
    "active_this_week": 89,
    "total_logs": 12500,
    "avg_logs_per_user": 83.3,
    "users_with_profiles": 142,
    "users_without_profiles": 8
  }
}
```

## Common Deficiencies Report

### Endpoint: `GET /api/admin/deficiencies`

Shows nutrients that users struggle with most.

### Response
```json
{
  "deficiencies": [
    {
      "nutrient_name": "Vitamin D",
      "users_deficient": 89,
      "percentage_of_users": 59.3,
      "avg_percentage_met": 42.1,
      "severity_rank": 1
    }
  ]
}
```

## Category Popularity by Goal

### Endpoint: `GET /api/admin/popular-categories`

### Response
```json
{
  "categories": [
    {
      "category_name": "Vegetables",
      "loss_users": 45,
      "maintain_users": 30,
      "gain_users": 12,
      "total_logs": 2500
    }
  ]
}
```

---

# 📅 PHASE 6: Educational Content ✅ COMPLETE

## Daily Facts

104 curated nutrition facts across 10 categories:
- Vitamins, Minerals, Protein, Hydration, Fiber
- General Nutrition, Metabolism, Digestion, Energy, Food Sources

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/facts/random` | GET | One random fact |
| `GET /api/facts/categories` | GET | List of categories |
| `GET /api/facts?category=X` | GET | All facts in category |
| `GET /api/facts/:fact_id` | GET | Specific fact |

## Challenges (Quiz System)

64 multiple-choice questions with gamification.

### Categories
- Vitamins, Minerals, Macros, Food Sources, General

### Gamification Fields (in User_Profiles)
- `challenge_score`: Total correct answers
- `challenge_streak`: Current consecutive correct
- `best_streak`: Highest streak achieved

### Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `GET /api/challenges/random` | GET | ❌ | Random challenge |
| `GET /api/challenges/random?category=X` | GET | ❌ | Random from category |
| `GET /api/challenges/random?exclude=1,2,3` | GET | ❌ | Exclude IDs (no repeats) |
| `GET /api/challenges/categories` | GET | ❌ | List categories |
| `GET /api/challenges/count` | GET | ❌ | Total count |
| `GET /api/challenges/count?category=X` | GET | ❌ | Count in category |
| `GET /api/challenges/stats` | GET | ✅ | User's score/streak |
| `GET /api/challenges/:id` | GET | ❌ | Specific challenge |
| `POST /api/challenges/:id/answer` | POST | Optional | Submit answer |

### Answer Response
```json
{
  "correct": true,
  "correct_answer_id": 3,
  "correct_answer_text": "Vitamin D"
}
```

If user is authenticated, their score/streak is automatically updated.

---

# 📅 PHASE 7: Frontend Development 🔴 NOT STARTED

## Recommended Tech Stack

```bash
# Create React app with Vite
npm create vite@latest frontend -- --template react

# Install dependencies
cd frontend
npm install axios react-router-dom recharts
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Why these choices:**
- **Vite**: Fast dev server, instant HMR
- **axios**: Cleaner API than fetch, interceptors for auth
- **react-router-dom**: Client-side routing
- **recharts**: Simple React charting library
- **tailwindcss**: Utility-first CSS, rapid development

---

## 🗂️ Recommended Frontend Structure

```
frontend/
├── src/
│   ├── main.jsx              # React entry point
│   ├── App.jsx               # Router setup, auth provider
│   ├── api/
│   │   ├── client.js         # Axios instance with interceptors
│   │   ├── auth.js           # login, register, getMe
│   │   ├── profile.js        # getProfile, updateProfile, calculate
│   │   ├── foods.js          # search, getById, getCategories
│   │   ├── log.js            # log, getToday, update, delete
│   │   ├── analysis.js       # gap, recommendations, trends, etc.
│   │   ├── facts.js          # getRandom, getAll
│   │   └── challenges.js     # getRandom, submitAnswer, getStats
│   ├── context/
│   │   └── AuthContext.jsx   # JWT storage, user state
│   ├── hooks/
│   │   ├── useAuth.js        # Custom hook for auth context
│   │   └── useDebounce.js    # For search input
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx     # Main page after login
│   │   ├── FoodLog.jsx       # Search + log + today's entries
│   │   ├── Profile.jsx       # Stats form + calculate
│   │   ├── Trends.jsx        # Weekly comparison charts
│   │   ├── Challenges.jsx    # Quiz interface
│   │   └── Admin.jsx         # Admin dashboard (if admin)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── dashboard/
│   │   │   ├── GapAnalysisCard.jsx
│   │   │   ├── MacroCircles.jsx
│   │   │   ├── RecommendationList.jsx
│   │   │   ├── DailyFact.jsx
│   │   │   └── StreakBadge.jsx
│   │   ├── food/
│   │   │   ├── FoodSearch.jsx
│   │   │   ├── FoodCard.jsx
│   │   │   ├── LogEntry.jsx
│   │   │   └── QuickAddButton.jsx
│   │   ├── charts/
│   │   │   ├── TrendChart.jsx
│   │   │   └── NutrientBar.jsx
│   │   └── challenges/
│   │       ├── ChallengeCard.jsx
│   │       ├── OptionButton.jsx
│   │       ├── ScoreDisplay.jsx
│   │       └── CategorySelect.jsx
│   └── styles/
│       └── index.css         # Tailwind imports + custom styles
```

---

## 📱 Page Specifications

### 1. Login Page (`/login`)

**Components:**
- Email/username input
- Password input
- Submit button
- "Don't have account?" link to register
- Error message display

**Logic:**
1. Call `POST /api/auth/login`
2. On success: Store token in localStorage, redirect to `/dashboard`
3. On error: Show "Invalid credentials"

**API Integration:**
```javascript
const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', res.data.token);
    return res.data.user;
};
```

---

### 2. Register Page (`/register`)

**Fields:**
- Username (3-50 chars, alphanumeric)
- Email (valid format)
- Password (min 6 chars)
- Confirm password

**Backend Validation Notes:**
- Username must be unique (returns error if exists)
- Email must be unique
- Password is hashed before storage

---

### 3. Dashboard Page (`/dashboard`) - MAIN PAGE

**Layout (suggested):**
```
┌─────────────────────────────────────────────────┐
│  Navbar (logo, user menu, logout)               │
├──────────┬──────────────────────────────────────┤
│          │  Daily Fact Card                      │
│          ├───────────────────┬──────────────────┤
│  Sidebar │  Macro Circles    │  Streak Badge    │
│          ├───────────────────┴──────────────────┤
│  - Dash  │  Gap Analysis (Nutrient Bars)        │
│  - Log   ├──────────────────────────────────────┤
│  - Trend │  Recommendations                      │
│  - Quiz  │  (Food cards with "Add" button)       │
│          │                                       │
└──────────┴───────────────────────────────────────┘
```

**Components:**

**a) DailyFact Card**
- Fetch `GET /api/facts/random` on mount
- Display fact text with category badge
- "New fact" button to refresh

**b) Macro Circles**
- Four circular progress indicators
- Calories, Protein, Carbs, Fat
- Color: Green (>80%), Yellow (50-80%), Red (<50%)

**c) Streak Badge**
- Show current streak with flame 🔥 icon
- "X days" text

**d) Gap Analysis Bars**
- Horizontal progress bars for each nutrient
- Sorted by percentage_met (lowest first)
- Color coding same as macros
- Show "25.5 / 90 mg" format

**e) Recommendations**
- Cards for each recommended food
- Show: name, calories, gaps_addressed count
- "Quick Add" button → opens serving size modal → logs food

**API Calls on Mount:**
```javascript
useEffect(() => {
    Promise.all([
        api.get('/facts/random'),
        api.get('/analysis/gap'),
        api.get('/analysis/recommendations'),
        api.get('/analysis/streak')
    ]).then(([fact, gap, recs, streak]) => {
        setFact(fact.data);
        setGaps(gap.data.gaps);
        setMacros(gap.data.macros);
        setRecommendations(recs.data.recommendations);
        setStreak(streak.data.current_streak);
    });
}, []);
```

---

### 4. Food Log Page (`/log`)

**Sections:**

**a) Search Bar (top)**
- Debounced input (300ms delay)
- Min 2 characters to search
- Dropdown with results
- Click result → open "Add Food" modal

**b) Today's Log (main)**
- List of logged foods
- Each entry shows: food name, serving size, calories
- Edit button (change serving) 
- Delete button (with confirmation)
- Total calories at bottom

**c) Quick Add History (sidebar)**
- Recently logged foods
- One-click to add again

**Search Implementation:**
```javascript
const useDebounce = (value, delay) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
};

// In component:
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
    if (debouncedSearch.length >= 2) {
        api.get(`/foods/search?q=${debouncedSearch}`)
           .then(res => setResults(res.data.foods));
    }
}, [debouncedSearch]);
```

---

### 5. Profile Page (`/profile`)

**Form Fields:**
- Birth date (date picker)
- Gender (dropdown: Male/Female/Other)
- Height (cm, number input)
- Weight (kg, number input)
- Activity Level (dropdown: Light/Moderate/Heavy)
- Goal (dropdown: Maintain/Loss/Gain)

**Display (readonly after calculate):**
- Target Calories
- Target Protein
- Target Carbs
- Target Fat

**"Calculate Targets" Button:**
1. Validate required fields (birth_date, gender, height, weight, activity_level, goal)
2. Call `POST /api/profile/calculate`
3. Display calculated values
4. Show success message

---

### 6. Trends Page (`/trends`)

**Charts:**

**a) Weekly Comparison (Line Chart)**
- X-axis: Nutrient names
- Two lines: Current week vs Previous week
- Uses recharts `LineChart`

**b) Streak History (optional)**
- Calendar heatmap or simple list

**API:**
```javascript
const { data } = await api.get('/analysis/trends');
// data.trends = [{ nutrient_name, current_week_avg, previous_week_avg, change_percentage }]
```

---

### 7. Challenges Page (`/challenges`)

**State Machine:**
1. **Category Select** → Choose category or "All"
2. **Question Display** → Show question + 4 options
3. **Answer Feedback** → Show correct/incorrect
4. **Next/Finish** → Load next or show summary

**Components:**

**a) Category Buttons**
```jsx
const categories = await api.get('/challenges/categories');
// ["Vitamins", "Minerals", "Macros", "Food Sources", "General"]
```

**b) Challenge Card**
- Question text (description)
- 4 option buttons
- Disable after selection

**c) Score/Streak Display**
- Current score
- Current streak
- Best streak

**No Repeat Logic (Frontend):**
```javascript
const [excludeIds, setExcludeIds] = useState([]);

const fetchChallenge = async (category) => {
    const exclude = excludeIds.join(',');
    const url = category 
        ? `/challenges/random?category=${category}&exclude=${exclude}`
        : `/challenges/random?exclude=${exclude}`;
    const { data } = await api.get(url);
    setExcludeIds(prev => [...prev, data.challenge_id]);
    setCurrentChallenge(data);
};
```

---

### 8. Admin Page (`/admin`) - Admin Only

**Access Control:**
```jsx
// In ProtectedRoute or Admin page
if (!user.isAdmin) {
    return <Navigate to="/dashboard" />;
}
```

**Sections:**
1. **Stats Cards**: Total users, active today, total logs
2. **Deficiency Table**: Nutrients users struggle with
3. **Category Chart**: Popular categories by goal

---

## 🔌 API Client Setup

```javascript
// src/api/client.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 errors (token expired)
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
```

---

## 🎨 UI/UX Guidelines

### Color Scheme (Suggested)
```css
:root {
    --primary: #10B981;      /* Green - healthy/success */
    --secondary: #3B82F6;    /* Blue - info/actions */
    --warning: #F59E0B;      /* Amber - partial progress */
    --danger: #EF4444;       /* Red - low/urgent */
    --background: #F9FAFB;   /* Light gray */
    --card: #FFFFFF;
    --text: #111827;
    --text-muted: #6B7280;
}
```

### Gap Analysis Colors
```javascript
const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
};
```

### Loading States
- Show skeleton loaders while fetching
- Disable buttons during API calls
- Show spinner on submit buttons

### Error Handling
```jsx
const [error, setError] = useState(null);

try {
    await api.post('/log', { food_id, serving_size_grams });
    setError(null);
} catch (err) {
    setError(err.response?.data?.error || 'Something went wrong');
}

// In JSX:
{error && <div className="text-red-500">{error}</div>}
```

---

## 🔑 Important Backend Integration Notes

### 1. Date Format
All dates use `YYYY-MM-DD` format:
```javascript
const today = new Date().toISOString().split('T')[0]; // "2024-12-22"
```

### 2. Authentication Header
```javascript
headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

### 3. Error Response Format
All errors return:
```json
{
    "error": "Error message here"
}
```

Status codes:
- `400` - Bad request (validation error)
- `401` - Unauthorized (no/invalid token)
- `403` - Forbidden (not admin)
- `404` - Not found
- `500` - Server error

### 4. Pagination Pattern
```json
{
    "data": [...],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "totalPages": 5
    }
}
```

### 5. Empty States
- Empty food log: `[]`
- No gaps (all met): empty `gaps` array
- No recommendations: empty array

### 6. Profile Required for Analysis
Gap analysis requires a profile with targets set. Check:
```javascript
if (!profile.target_calories) {
    return <ProfileSetupPrompt />;
}
```

### 7. Challenge Answer - Optional Auth
The POST answer endpoint works with or without token:
- With token: Updates score/streak
- Without token: Just returns correct answer

---

## ✅ Frontend Testing Checklist

### Authentication
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Token persists across page refresh
- [ ] Logout clears token and redirects
- [ ] 401 errors redirect to login

### Profile
- [ ] Shows empty state for new users
- [ ] Can fill and save profile
- [ ] Calculate button works
- [ ] Shows calculated targets

### Food Logging
- [ ] Search returns results
- [ ] Debounce prevents excessive calls
- [ ] Can add food with serving size
- [ ] Today's log updates immediately
- [ ] Can edit serving size
- [ ] Can delete entry

### Gap Analysis
- [ ] Shows all nutrient gaps
- [ ] Colors are correct (red/yellow/green)
- [ ] Recommendations show
- [ ] Quick-add from recommendations works

### Challenges
- [ ] Random challenge loads
- [ ] Category filter works
- [ ] No repeat in session
- [ ] Answer updates score (if logged in)
- [ ] Stats display correctly

---

## 🚀 Deployment Checklist (Later)

1. [ ] Set production environment variables
2. [ ] Build frontend (`npm run build`)
3. [ ] Configure CORS for production domain
4. [ ] Set up HTTPS
5. [ ] Database connection pooling tuned
6. [ ] Error logging configured

---

# 📚 SQL Queries Reference

For academic documentation, here are the complex queries:

## Q1: Gap Analysis
```sql
-- File: queries/gapAnalysis.sql
-- Concepts: CTE, UNION ALL, COALESCE, LEFT JOIN, Aggregation
WITH DailyIntake AS (
    SELECT fn.nutrient_id,
           SUM(fn.amount_per_100g * (ufl.serving_size_grams / 100)) as consumed
    FROM User_Food_Log ufl
    JOIN Food_Nutrients fn ON ufl.food_id = fn.food_id
    WHERE ufl.user_id = ? AND ufl.date_eaten = ?
    GROUP BY fn.nutrient_id
)
SELECT 
    n.nutrient_name,
    n.unit,
    COALESCE(t.target_value, n.default_rdi) as target,
    COALESCE(di.consumed, 0) as consumed,
    GREATEST(0, COALESCE(t.target_value, n.default_rdi) - COALESCE(di.consumed, 0)) as gap_amount,
    ROUND(COALESCE(di.consumed, 0) / COALESCE(t.target_value, n.default_rdi) * 100, 2) as percentage_met
FROM Nutrients n
LEFT JOIN DailyIntake di ON n.nutrient_id = di.nutrient_id
LEFT JOIN User_Targets t ON t.user_id = ? AND t.nutrient_id = n.nutrient_id
WHERE n.nutrient_id NOT IN (1008, 1003, 1004, 1005)  -- Exclude macros
ORDER BY percentage_met ASC;
```

## Q2: Food Optimizer (Multi-Gap)
```sql
-- File: queries/foodOptimizer.sql
-- Concepts: 4 CTEs, Window Functions, ROW_NUMBER, Dynamic Filtering
WITH UserGaps AS (
    -- Nutrients below 80% of target
    SELECT nutrient_id, gap_amount
    FROM (/* gap analysis subquery */) gaps
    WHERE percentage_met < 80
),
TodayFoods AS (
    -- Foods already eaten today
    SELECT DISTINCT food_id
    FROM User_Food_Log
    WHERE user_id = ? AND date_eaten = CURDATE()
),
GoodFoods AS (
    -- Quality-filtered foods
    SELECT f.food_id, f.name, fc.category_name
    FROM Foods f
    JOIN Food_Categories fc ON f.food_category_id = fc.category_id
    WHERE f.food_id NOT IN (SELECT food_id FROM TodayFoods)
      AND fc.category_id IN ({{CATEGORIES}})
      AND LENGTH(f.name) <= {{MAX_NAME_LENGTH}}
      {{BLACKLIST}}
),
FoodScores AS (
    -- Rank by gaps addressed
    SELECT gf.food_id, gf.name, gf.category_name,
           COUNT(DISTINCT ug.nutrient_id) as gaps_addressed,
           GROUP_CONCAT(n.nutrient_name) as gap_nutrients
    FROM GoodFoods gf
    JOIN Food_Nutrients fn ON gf.food_id = fn.food_id
    JOIN UserGaps ug ON fn.nutrient_id = ug.nutrient_id
    JOIN Nutrients n ON ug.nutrient_id = n.nutrient_id
    WHERE fn.amount_per_100g > 0
    GROUP BY gf.food_id
    HAVING gaps_addressed >= {{MIN_GAPS}}
)
SELECT *, RANK() OVER (ORDER BY gaps_addressed DESC) as rank
FROM FoodScores
ORDER BY gaps_addressed DESC, name
LIMIT {{MAX_RECS}};
```

## Q3: Streak Tracker (Gap-and-Island)
```sql
-- File: queries/streakTracker.sql
-- Concepts: Gap-and-Island, ROW_NUMBER, DATE_SUB, Subquery
WITH LogDates AS (
    SELECT DISTINCT date_eaten,
           ROW_NUMBER() OVER (ORDER BY date_eaten) as rn
    FROM User_Food_Log
    WHERE user_id = ?
),
Islands AS (
    SELECT date_eaten,
           DATE_SUB(date_eaten, INTERVAL rn DAY) as island_id
    FROM LogDates
),
Streaks AS (
    SELECT island_id,
           COUNT(*) as streak_length,
           MAX(date_eaten) as end_date
    FROM Islands
    GROUP BY island_id
)
SELECT 
    (SELECT streak_length FROM Streaks WHERE end_date = CURDATE()) as current_streak,
    (SELECT MAX(streak_length) FROM Streaks) as longest_streak;
```

---

# 🎯 Next Steps

1. **Initialize Frontend Project**
   ```bash
   cd C:\Users\User\NutriGuide
   npm create vite@latest frontend -- --template react
   cd frontend
   npm install axios react-router-dom recharts
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Set Up API Client** with axios interceptors

3. **Build Authentication** (Login, Register, AuthContext)

4. **Build Dashboard** (the main showcase page)

5. **Build Food Log** (search + logging)

6. **Build Profile** with calculate

7. **Build Challenges** quiz interface

8. **Style & Polish**
