# NutriGuide

**A Data-Driven Personal Nutrition Management System**

> University Database Course Project

## Project Overview

![NutriGuide Dashboard](docs/images/dashboard.png)

NutriGuide is an educational project demonstrating advanced database capabilities within a full-stack web application. The system transforms complex raw nutritional data into actionable personal insights. Its core feature, **Gap Analysis**, identifies nutrient deficiencies in real-time and uses complex SQL algorithms to recommend foods that efficiently address multiple gaps simultaneously.

This project was built to satisfy the requirements of a Database Management Workshop, prioritizing complex query logic, data integrity, and large-scale data handling over simple CRUD operations.

## Project Structure

The project is organized into modular components.

```
NutriGuide/
├── backend/                   # Server-side application
│   ├── src/
│   │   ├── config/            # Database configurations
│   │   ├── queries/           # Complex SQL queries (.sql)
│   │   ├── routes/            # API endpoints
│   │   └── services/          # Business logic
│   ├── .env                   # Environment variables
│   └── server.js              # Entry point
│
├── frontend/                  # Client-side application
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # React components
│   │   └── pages/             # Application pages
│   └── package.json           # Frontend dependencies
│
├── scripts/                   # Database management
│   ├── create_schema.sql      # Database schema
│   ├── etl_sr_legacy.py       # Python ETL script
│   ├── init_db_data.js        # Master initialization script
│   ├── load_challenges.js     # Challenges seeder
│   └── load_facts.js          # Facts seeder
│
└── usda_data_sr_legacy/       # Raw dataset (CSV files)
```

## Technology Stack

### Backend
- **Runtime:** Node.js (Express framework)
- **Database:** MySQL 8.0 (Relational schema)
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Testing:** Jest

### Frontend
- **Framework:** React
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Charting:** Recharts

### Data Source
- **Primary Source:** USDA FoodData Central (SR Legacy)
- **Volume:** Over 230,000 processed nutrient records
- **ETL:** Python (pandas) custom extract-transform-load scripts

## Key Features

### Core Analysis
- **Gap Analysis:** Real-time calculation of nutrient deficits against personal targets.
- **Multi-Gap Optimizer:** SQL-based recommendation engine that finds foods rich in multiple missing nutrients.
- **Weekly Trends:** Comparative analysis of nutrient intake over time windows.

### User Management
- **Profile System:** Calculates BMR and TDEE based on metabolic formulas (Mifflin-St Jeor).
- **Food Logging:** Grams-based logging with automatic macro calculation from 100g standards.
- **Gamification:** Streak tracking and educational quizzes with score persistence.

### Technical Implementation
- **Complex SQL:** Logic relies on CTEs, Window Functions, and Gap-and-Island algorithms.
- **Architecture:** Service-Repository pattern separating API routing from business logic.
- **Security:** Standardized error handling, input validation, and secure password storage.

## Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)
- Python 3.x (Required only for initial data loading)

### Installation & Setup

1. **Install Dependencies**
   Navigate to the backend and frontend directories:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

2. **Configure Backend Environment**
   Create a `.env` file in the `backend/` directory:

   **Generating a Secure JWT Token:**
   Run this command in your terminal to get a random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   **Example `.env` File:**
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=nutri_guide_db
   JWT_SECRET=paste_your_generated_token_here
   PORT=3000
   ```
   *(Note: The frontend allows configuration but defaults to `http://localhost:3000/api`)*

3. **Initialize Database**
   Run the master initialization script from the project root to create schema and load data:
   ```bash
   node scripts/init_db_data.js
   ```

4. **Start Application**
   Start both backend and frontend servers.
   ```bash
   # Terminal 1: Backend
   cd backend
   npm start

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

## Gallery

### Dashboard & Analytics
| Dashboard | Admin Analytics |
|:---:|:---:|
| ![Dashboard](docs/images/dashboard.png) | ![Admin Analytics](docs/images/adminAnalytics.png) |
| *Comprehensive daily overview* | *System-wide usage statistics* |

### Core Nutrition Features
| Food Log | Recommendation Engine |
|:---:|:---:|
| ![Food Log](docs/images/foodLog.png) | ![Recommendations](docs/images/foodRecommendation.png) |
| *Detailed macro/micro tracking* | *Smart food suggestions for gap filling* |

### Challenges & Gamification
| Challenge Menu | Simulation |
|:---:|:---:|
| ![Challenges](docs/images/ChallengesMenu.png) | ![Simulation](docs/images/challengesSimulation.png) |
| *Educational quizzes & streaks* | *Interactive challenge simulation* |

### User Profile
| Sign Up | Profile Settings |
|:---:|:---:|
| ![Sign Up](docs/images/signUp.png) | ![Profile](docs/images/ProfilePage.png) |
| *User registration* | *Personalized settings & BMR* |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
