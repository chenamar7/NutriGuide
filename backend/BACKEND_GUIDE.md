# 🛠️ NutriGuide Backend Development Guide

> **Status:** ✅ Backend Complete - All features implemented  
> **Architecture:** Plain functions (not classes) for services

---

## 📁 Project Structure (Current)

```
backend/src/
├── app.js                 ✅ Express entry point
├── config/
│   ├── db.js              ✅ Database connection pool
│   └── foodFilters.js     ✅ Recommendation filter config
├── middleware/
│   └── auth.js            ✅ authenticate + requireAdmin
├── routes/
│   ├── authRoutes.js      ✅ /api/auth/*
│   ├── profileRoutes.js   ✅ /api/profile/*
│   ├── foodRoutes.js      ✅ /api/foods/*
│   ├── logRoutes.js       ✅ /api/log/*
│   ├── analysisRoutes.js  ✅ /api/analysis/*
│   ├── adminRoutes.js     ✅ /api/admin/*
│   ├── factsRoutes.js     ✅ /api/facts/*
│   └── challengesRoutes.js ✅ /api/challenges/*
├── repositories/          ✅ Database access layer (NEW)
│   ├── baseRepository.js  ✅ Query execution helpers
│   ├── userRepository.js  ✅ User queries
│   ├── profileRepository.js ✅ Profile queries
│   ├── foodRepository.js  ✅ Food queries
│   ├── logRepository.js   ✅ Food log queries
│   ├── analysisRepository.js ✅ Gap analysis queries
│   ├── factsRepository.js ✅ Facts queries
│   ├── challengesRepository.js ✅ Challenges queries
│   └── adminRepository.js ✅ Admin queries
├── services/
│   ├── authService.js     ✅ Business logic
│   ├── profileService.js  ✅ Business logic
│   ├── foodService.js     ✅ Business logic
│   ├── logService.js      ✅ Business logic
│   ├── analysisService.js ✅ Business logic
│   ├── adminService.js    ✅ Business logic
│   ├── factsService.js    ✅ Business logic
│   └── challengesService.js ✅ Business logic
└── queries/               ✅ Complex SQL files
    ├── gapAnalysis.sql
    ├── foodOptimizer.sql
    ├── weeklyTrends.sql
    ├── streakTracker.sql
    ├── effectiveFoods.sql
    ├── adminDashboard.sql
    ├── adminDeficiencies.sql
    └── adminCategories.sql
```

---

## 🔄 Request Flow (Architecture Pattern)

```
CLIENT REQUEST
      ↓
   app.js (Express)
      ↓
   routes/*.js        ← Handles HTTP (req/res), calls service
      ↓
   services/*.js      ← Business logic, validation, orchestration
      ↓
   repositories/*.js  ← Database queries (SQL)
      ↓
   config/db.js       ← Connection pool, query execution
      ↓
   MySQL Database
```

### Separation of Concerns:
| Layer | Responsibility | Should NOT do |
|-------|---------------|---------------|
| **Routes** | Parse request, call service, send response | SQL queries, business logic |
| **Services** | Business logic, validation, orchestration | SQL queries, HTTP handling |
| **Repositories** | Database queries, data access | Business logic, HTTP handling |
| **DB Config** | Connection pool, execute queries | Business logic, query building |

### Why This Architecture?

**✅ Easy Database Switching:**
- Only repositories need changes when switching databases
- Services remain unchanged (they just call repository methods)
- SQL dialect differences isolated in one layer

**✅ Better Testability:**
- Can mock repositories in service tests
- Can test repositories independently
- Clear boundaries between layers

**✅ Maintainability:**
- Each layer has a single responsibility
- Easy to find where queries are defined
- Changes in one layer don't affect others

---

## 📝 Code Style (What We Actually Use)

### Repository Pattern (Plain Functions)

```javascript
const base = require('./baseRepository');

/**
 * Get all food categories
 */
const findAllCategories = async () => {
    return await base.findAll(`
        SELECT category_id, category_name 
        FROM Food_Categories 
        ORDER BY category_name`
    );
};

module.exports = {
    findAllCategories
};
```

### Service Pattern (Plain Functions)

```javascript
const foodRepository = require('../repositories/foodRepository');

/**
 * Get all food categories
 */
const getCategories = async () => {
    return await foodRepository.findAllCategories();
};

module.exports = {
    getCategories
};
```

### Route Pattern

```javascript
const express = require('express');
const router = express.Router();
const foodService = require('../services/foodService');

/**
 * GET /api/foods/categories
 * Get all food categories
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await foodService.getCategories();
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

---

## 🔐 Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            isAdmin: decoded.isAdmin
        };
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { authenticate, requireAdmin };
```

### Using Middleware:

```javascript
const { authenticate, requireAdmin } = require('../middleware/auth');

// Protected route (any logged-in user)
router.get('/profile', authenticate, async (req, res) => {
    // req.user.userId is available!
});

// Admin-only route
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
    // Only admins get here
});
```

---

## 📋 All Endpoints (Implemented ✅)

### Auth Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | ❌ | Create user account |
| POST | `/login` | ❌ | Get JWT token |
| GET | `/me` | ✅ | Get current user info |
| DELETE | `/:userId` | Admin | Delete user |

### Profile Routes (`/api/profile`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | ✅ | Get user's profile |
| PUT | `/` | ✅ | Update profile fields |
| POST | `/calculate` | ✅ | Calculate & save macro targets |

### Food Routes (`/api/foods`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | ❌ | List all categories |
| GET | `/search` | ❌ | Search with filters + pagination |
| GET | `/:food_id` | ❌ | Get food with all nutrients |

### Log Routes (`/api/log`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | ✅ | Log a food entry |
| GET | `/today` | ✅ | Today's log |
| GET | `/?date=` | ✅ | Log for specific date |
| GET | `/history?days=` | ✅ | Past X days |
| PUT | `/:log_id` | ✅ | Update serving size |
| DELETE | `/:log_id` | ✅ | Delete entry |

### Analysis Routes (`/api/analysis`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gap` | ✅ | Gap analysis (today or by date) |
| GET | `/recommendations` | ✅ | Smart food suggestions |
| GET | `/trends` | ✅ | Weekly comparison |
| GET | `/streak` | ✅ | Logging streak |
| GET | `/effective` | ✅ | Best nutrient contributors |

### Facts Routes (`/api/facts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/random` | ❌ | Random fact |
| GET | `/categories` | ❌ | List categories |
| GET | `/` | ❌ | All facts |
| GET | `/:fact_id` | ❌ | Specific fact |

### Challenges Routes (`/api/challenges`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/random` | ❌ | Random challenge (with filters) |
| GET | `/categories` | ❌ | List categories |
| GET | `/count` | ❌ | Total count |
| GET | `/stats` | ✅ | User's score/streak |
| GET | `/:id` | ❌ | Specific challenge |
| POST | `/:id/answer` | Optional | Submit answer |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | Admin | Platform stats |
| GET | `/deficiencies` | Admin | Common nutrient struggles |
| GET | `/popular-categories` | Admin | Category by goal |

---

## 🎯 SQL Queries Reference

### Simple Pattern (Dynamic Filters)

```javascript
const searchFoods = async (searchTerm, category_id, min_cal, max_cal) => {
    // Build filters first
    let conditions = ['f.name LIKE ?'];
    let params = [`%${searchTerm}%`];

    if (category_id) {
        conditions.push('f.food_category_id = ?');
        params.push(category_id);
    }
    if (min_cal) {
        conditions.push('fn_cal.amount_per_100g >= ?');
        params.push(min_cal);
    }

    // Build query at the end
    const whereClause = conditions.join(' AND ');
    const sql = `
        SELECT f.food_id, f.name
        FROM Foods f
        WHERE ${whereClause}`;

    return await query(sql, params);
};
```

### Complex SQL (Loaded from Files)

```javascript
// queries/index.js
const fs = require('fs');
const path = require('path');

const loadQuery = (queryName) => {
    const queryPath = path.join(__dirname, `${queryName}.sql`);
    return fs.readFileSync(queryPath, 'utf8');
};

// Usage in service:
const gapSql = loadQuery('gapAnalysis');
const results = await query(gapSql, [userId, targetDate, userId, userId, userId, userId]);
```

---

## 💡 Tips

1. **Always use try/catch** in route handlers
2. **Use parameterized queries** (?) - never concatenate strings into SQL
3. **req.user** is available after `authenticate` middleware runs
4. **COALESCE** in SQL handles null values gracefully
5. **Dynamic error codes**: Check `error.message.includes('not found')` for 404 vs 400
6. **SQL formatting**: Use multi-line template strings for readability

---

## 🧪 Testing with Postman

Import `NutriGuide.postman_collection.json` from project root.

**Auto-token saving:**
- Login saves token automatically
- All protected requests use `{{token}}` variable

**Test Flow:**
1. Register → Login
2. Update Profile → Calculate Targets
3. Search Food → Log Food
4. View Gap Analysis → Get Recommendations
5. Play Challenge → Check Stats

---

## 🔄 Database Switching Guide

### How to Switch from MySQL to PostgreSQL

**Step 1:** Install PostgreSQL driver
```bash
npm install pg
npm uninstall mysql2
```

**Step 2:** Update `config/db.js`
```javascript
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 10
});

// PostgreSQL uses $1, $2 instead of ?
const query = async (sql, params) => {
    let pgSql = sql;
    let paramIndex = 1;
    // Convert ? placeholders to $1, $2, etc.
    pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);
    
    const result = await pool.query(pgSql, params);
    return result.rows;
};

module.exports = { pool, query };
```

**Step 3:** Update SQL dialect differences (if any)
Most standard SQL works unchanged:
- `LIMIT`, `OFFSET` - same
- `NOW()` - same
- `COALESCE()` - same
- `DATE()` - same

Only database-specific functions need updates (e.g., `RAND()` → `RANDOM()`)

**Step 4:** No changes needed in:
- ✅ Routes
- ✅ Services
- ✅ Repositories (they use parameterized queries)

**That's it!** The repository pattern makes database switching straightforward.

---

## 🏗️ Repository Pattern Benefits

### 1. Easy Database Switching
- Change only `config/db.js` and dialect-specific SQL
- Services and routes remain unchanged
- Clear boundary between business logic and data access

### 2. Better Testing
```javascript
// Mock repositories in tests
const mockUserRepo = {
    findByEmail: jest.fn().mockResolvedValue({ user_id: 1 })
};
```

### 3. Reusable Query Patterns
```javascript
// baseRepository.js provides common patterns
base.findOne()   // Get single record
base.findAll()   // Get multiple records
base.insert()    // Insert and return ID
base.modify()    // Update/Delete and return affected rows
```

### 4. Centralized Data Access
- All SQL queries in one place (repositories/)
- Easy to audit database access
- Consistent query patterns across the app

---

## 📚 Additional Resources

- **Project Rules:** See root `.cursorrules` file
- **API Documentation:** `api_examples.md`
- **Database Schema:** `scripts/create_schema.sql`
- **Complex Queries:** `backend/src/queries/*.sql`
