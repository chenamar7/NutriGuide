# 🌿 NutriGuide Frontend Architecture Plan

> **Project:** NutriGuide - Personal Nutrition Management System  
> **Team:** Omri Nahum & Chen Amar  
> **Purpose:** Frontend SPA for Database Course Capstone Project

---

## 1. Architecture Overview

### Framework Choice: React + Vite + Tailwind CSS

| Choice | Justification |
|--------|---------------|
| **Vite** | Fast dev server, instant HMR, simple setup, matches backend simplicity |
| **React** | Already planned in EXECUTION_PLAN.md, widely known, good for SPAs |
| **Tailwind CSS** | Utility-first, rapid development, easy to add brown accents |
| **Axios** | Clean API, interceptors for auth tokens, better than raw fetch |
| **React Router DOM** | Standard SPA routing, simple protected routes |
| **Recharts** | Simple React charting, minimal setup for trends/analysis |

**Why NOT heavier frameworks:**
- No Redux/Zustand: Simple Context API is enough for auth + user state
- No TypeScript: Academic project, plain JS is clearer and faster
- No UI library (MUI, Ant): Tailwind gives full control for custom styling

---

## 2. Folder Structure

```
frontend/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── src/
│   ├── main.jsx                    # React entry point
│   ├── App.jsx                     # Router + AuthProvider wrapper
│   │
│   ├── api/                        # API layer (matches backend services)
│   │   ├── client.js               # Axios instance + interceptors
│   │   ├── auth.js                 # login, register, getMe
│   │   ├── profile.js              # getProfile, updateProfile, calculate
│   │   ├── foods.js                # search, getById, getCategories
│   │   ├── log.js                  # logFood, getToday, update, delete
│   │   ├── analysis.js             # gap, recommendations, trends, streak
│   │   ├── facts.js                # getRandom, getByCategory
│   │   └── challenges.js           # getRandom, submitAnswer, getStats
│   │
│   ├── context/                    # React Context for global state
│   │   └── AuthContext.jsx         # User state, token management
│   │
│   ├── hooks/                      # Custom hooks (only what's needed)
│   │   ├── useAuth.js              # Access auth context
│   │   └── useDebounce.js          # For food search input
│   │
│   ├── pages/                      # Top-level route components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx           # Main page (gap analysis, macros, etc.)
│   │   ├── FoodLog.jsx             # Search + log + today's entries
│   │   ├── Profile.jsx             # User stats + calculate targets
│   │   ├── Trends.jsx              # Weekly comparison charts
│   │   ├── Challenges.jsx          # Quiz interface
│   │   └── Admin.jsx               # Admin dashboard (if isAdmin)
│   │
│   ├── components/                 # Reusable UI pieces
│   │   ├── layout/
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   ├── Sidebar.jsx         # Side navigation
│   │   │   └── ProtectedRoute.jsx  # Auth guard wrapper
│   │   │
│   │   ├── common/                 # Truly reusable (used 3+ times)
│   │   │   ├── Button.jsx          # Primary/secondary variants
│   │   │   ├── Input.jsx           # Form input with label
│   │   │   ├── Card.jsx            # Container with shadow/border
│   │   │   ├── Loading.jsx         # Spinner component
│   │   │   └── ErrorMessage.jsx    # Error display
│   │   │
│   │   ├── dashboard/              # Dashboard-specific components
│   │   │   ├── MacroCircle.jsx     # Circular progress for one macro
│   │   │   ├── NutrientBar.jsx     # Horizontal progress bar
│   │   │   ├── RecommendationCard.jsx
│   │   │   ├── DailyFactCard.jsx
│   │   │   └── StreakBadge.jsx
│   │   │
│   │   ├── food/                   # Food logging components
│   │   │   ├── FoodSearch.jsx      # Search input + results dropdown
│   │   │   ├── FoodLogEntry.jsx    # Single log item (edit/delete)
│   │   │   └── AddFoodModal.jsx    # Serving size input modal
│   │   │
│   │   └── challenges/             # Challenge/quiz components
│   │       ├── ChallengeCard.jsx   # Question + options
│   │       ├── OptionButton.jsx    # Single answer option
│   │       └── ScoreDisplay.jsx    # Score/streak display
│   │
│   └── styles/
│       └── index.css               # Tailwind imports + CSS variables
```

### Key Principles:
1. **Pages = Routes**: Each file in `pages/` is a full route
2. **Components = Reusable**: Only extract if used 2+ times
3. **API = Backend Mirror**: One file per backend service domain
4. **Hooks = Minimal**: Only `useAuth` and `useDebounce`

---

## 3. Component vs Page Responsibilities

| Type | Responsibility | Examples |
|------|----------------|----------|
| **Page** | Route-level component, fetches data, manages page state, composes components | `Dashboard.jsx`, `FoodLog.jsx` |
| **Component** | Displays data passed via props, emits events, no direct API calls | `MacroCircle.jsx`, `FoodLogEntry.jsx` |
| **Layout** | Structural wrappers, navigation, auth guards | `Navbar.jsx`, `ProtectedRoute.jsx` |
| **Context** | Global state that crosses pages | `AuthContext.jsx` (user, token) |

### Data Flow Example (Dashboard):
```
Dashboard.jsx (Page)
  ├── useEffect → api.gap(), api.recommendations(), etc.
  ├── useState → gaps, macros, recommendations
  └── Renders:
      ├── MacroCircle (props: target, consumed, label)
      ├── NutrientBar (props: nutrient, percentage)
      └── RecommendationCard (props: food, onClick)
```

---

## 4. API Layer Design

### client.js - Axios Setup
```javascript
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' }
});

// Add token to every request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle 401 (expired token)
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

### API Module Example (analysis.js)
```javascript
import api from './client';

/**
 * Get gap analysis for a date
 * @param {string} date - YYYY-MM-DD format (optional, defaults to today)
 */
export const getGapAnalysis = async (date) => {
    const url = date ? `/analysis/gap?date=${date}` : '/analysis/gap';
    const { data } = await api.get(url);
    return data;
};

export const getRecommendations = async () => {
    const { data } = await api.get('/analysis/recommendations');
    return data.recommendations;
};

// ... etc
```

### Where API Calls Live:
| Location | When to Use |
|----------|-------------|
| `api/*.js` | Define the actual fetch logic |
| `pages/*.jsx` | Call API functions in `useEffect` or event handlers |
| `components/*.jsx` | **Never** - receive data via props |

---

## 5. State Management

### Simple Approach: Context API + Local State

**Global State (Context):**
- User info (userId, username, isAdmin)
- Authentication status (isAuthenticated)
- Token management

**Local State (useState in pages):**
- Page data (gaps, recommendations, food log, etc.)
- Loading states
- Error messages
- Form inputs

### AuthContext.jsx
```javascript
import { createContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('token');
        if (token) {
            authApi.getMe()
                .then(data => setUser(data.user))
                .catch(() => localStorage.removeItem('token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const { token, user } = await authApi.login(username, password);
        localStorage.setItem('token', token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
```

---

## 6. Routing Strategy

### Route Structure
```javascript
// App.jsx
<BrowserRouter>
    <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/log" element={<FoodLog />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/challenges" element={<Challenges />} />
        </Route>
        
        {/* Admin Route */}
        <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/admin" element={<Admin />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
    </Routes>
</BrowserRouter>
```

### ProtectedRoute.jsx
```javascript
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ requireAdmin = false }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <Loading />;
    
    if (!user) return <Navigate to="/login" />;
    
    if (requireAdmin && !user.isAdmin) {
        return <Navigate to="/dashboard" />;
    }
    
    return <Outlet />;
};
```

### Loading & Error States
Every page follows this pattern:
```javascript
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    fetchData()
        .then(setData)
        .catch(err => setError(err.response?.data?.error || 'Failed to load'))
        .finally(() => setLoading(false));
}, []);

if (loading) return <Loading />;
if (error) return <ErrorMessage message={error} />;
return <div>...</div>;
```

---

## 7. UI & Styling Guidelines

### Color Palette (With Brown Accents)

Based on the reference image (to be provided), we'll add brown tones as accent colors:

```css
/* src/styles/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
    /* Primary - Green (healthy/success) */
    --color-primary: #10B981;
    --color-primary-light: #34D399;
    --color-primary-dark: #059669;
    
    /* Brown Accents (warm, natural feel) */
    --color-brown: #8B5A2B;
    --color-brown-light: #A67C52;
    --color-brown-dark: #5D3A1A;
    --color-brown-subtle: #F5E6D3;
    
    /* Secondary */
    --color-secondary: #3B82F6;
    
    /* Status Colors */
    --color-warning: #F59E0B;
    --color-danger: #EF4444;
    
    /* Neutrals */
    --color-background: #FAFAF9;
    --color-surface: #FFFFFF;
    --color-text: #1F2937;
    --color-text-muted: #6B7280;
    --color-border: #E5E7EB;
}
```

### Tailwind Config Extension
```javascript
// tailwind.config.js
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#10B981',
                    light: '#34D399',
                    dark: '#059669',
                },
                brown: {
                    DEFAULT: '#8B5A2B',
                    light: '#A67C52',
                    dark: '#5D3A1A',
                    subtle: '#F5E6D3',
                },
            },
        },
    },
    plugins: [],
}
```

### Where to Use Brown:
| Element | Color | Example Class |
|---------|-------|---------------|
| Navbar background | Brown dark | `bg-brown-dark` |
| Active nav item | Brown default | `text-brown` |
| Card borders (accent) | Brown subtle | `border-brown-subtle` |
| Streak flame/badge | Brown | `text-brown` |
| "Natural food" icons | Brown light | `fill-brown-light` |

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│  Navbar (brown-dark bg, white text)                 │
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│  Sidebar │  Main Content Area                       │
│  (white) │  (gray-50 background)                    │
│          │                                          │
│  - Dash  │  ┌─────────────────────────────────┐    │
│  - Log   │  │  Page Header                     │    │
│  - etc   │  └─────────────────────────────────┘    │
│          │  ┌────────┐ ┌────────┐ ┌────────┐       │
│          │  │ Card 1 │ │ Card 2 │ │ Card 3 │       │
│          │  └────────┘ └────────┘ └────────┘       │
│          │                                          │
└──────────┴──────────────────────────────────────────┘
```

### Typography
- Use system fonts or simple Google Font (Inter, Nunito)
- Headers: Bold, larger sizes
- Body: Regular, readable size (16px base)
- Muted text: `text-gray-500`

### Accessibility Basics
- Color contrast: Ensure text is readable (especially on brown backgrounds)
- Focus states: Visible outlines on interactive elements
- Button states: Clear hover/active/disabled styles
- Form labels: Always present, associated with inputs

---

## 8. Best Practices Checklist

### Performance
- [ ] Debounce search input (300ms)
- [ ] Lazy load charts page (Recharts is heavy)
- [ ] Don't fetch on every render (use dependency arrays)
- [ ] Use `key` props correctly in lists

### Accessibility
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have readable text (not just icons)
- [ ] Color is not the only indicator (use text too)

### Maintainability
- [ ] Consistent naming (camelCase functions, PascalCase components)
- [ ] Comments for non-obvious logic
- [ ] Error boundaries for critical sections
- [ ] Consistent file structure

### Backend Consistency
| Frontend Term | Backend Term | Notes |
|---------------|--------------|-------|
| `user` | `user` | Same |
| `foodLog` | `log` | Route is `/api/log` |
| `gapAnalysis` | `gap` | Route is `/api/analysis/gap` |
| `servingSize` | `serving_size_grams` | Snake_case in API |

---

## 9. Build Order (Implementation Steps)

### Phase 1: Foundation (Day 1)
```
1. Initialize Vite + React project
2. Install dependencies (axios, react-router-dom, recharts)
3. Configure Tailwind CSS with brown color palette
4. Create folder structure (empty files)
5. Set up API client with interceptors
```

### Phase 2: Auth Flow (Day 1-2)
```
1. Create AuthContext
2. Build Login page
3. Build Register page
4. Create ProtectedRoute wrapper
5. Set up App.jsx with routing
```

### Phase 3: Core Layout (Day 2)
```
1. Build Navbar (with brown styling)
2. Build Sidebar with navigation links
3. Create common components (Button, Input, Card, Loading)
4. Wrap authenticated routes with layout
```

### Phase 4: Dashboard - Main Page (Day 2-3)
```
1. Build Dashboard page shell
2. Create MacroCircle component
3. Create NutrientBar component
4. Create DailyFactCard component
5. Create RecommendationCard component
6. Integrate with real API
```

### Phase 5: Food Logging (Day 3)
```
1. Build FoodSearch with debounce
2. Build AddFoodModal
3. Build FoodLogEntry component
4. Build FoodLog page (combines above)
```

### Phase 6: Profile & Trends (Day 3-4)
```
1. Build Profile page with form
2. Add calculate targets functionality
3. Build Trends page with Recharts
```

### Phase 7: Challenges & Admin (Day 4)
```
1. Build challenge components
2. Build Challenges page (quiz flow)
3. Build Admin page (if time permits)
```

### Phase 8: Polish (Day 4-5)
```
1. Add loading states everywhere
2. Add error handling everywhere
3. Test all flows end-to-end
4. Final styling adjustments
```

---

## 10. What to Avoid

| Avoid | Why | Do Instead |
|-------|-----|------------|
| Redux/Zustand | Over-engineering for this scope | Context API |
| TypeScript | Adds complexity for academic project | Plain JS |
| Generic "BaseComponent" | YAGNI (You Aren't Gonna Need It) | Specific components |
| Over-abstraction | Makes code harder to follow | Direct, readable code |
| CSS-in-JS | Tailwind is simpler | Utility classes |
| Too many hooks | Keep it simple | useState, useEffect, useContext |
| Enterprise patterns | Not needed for 8 pages | Simple functions |

---

## User Review Required

> [!IMPORTANT]
> **Reference Image Needed**: Please share the reference image so I can refine the brown accent placement and overall layout inspiration before implementation.

**Questions:**
1. Do you have a preference for the Google Font to use (Inter, Nunito, or system fonts)?
2. Should the sidebar be collapsible on mobile, or use a hamburger menu?
3. Any specific charts/visualizations preference for the Trends page (line, bar, area)?
