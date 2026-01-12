A Data-Driven Personal Nutrition Management System

1. Executive Summary & Vision
NutriGuide is an educational, interactive web application designed to transform complex, raw nutritional data into actionable personal insights.

Unlike standard calorie trackers, NutriGuide’s core value proposition is "Gap Analysis": instead of just tracking what users eat, the system identifies what nutrients they are missing in real-time and provides data-backed recommendations to close those gaps.

1.1 The Academic Mission
This project is the Capstone for a Data Management Workshop.

Primary Goal: To demonstrate advanced SQL capabilities within a full-stack application.

Requirement: The application logic must rely on complex database queries rather than simple CRUD operations.

Constraint: No external APIs are used. All intelligence is derived from a locally hosted, rigorously processed relational database.

2. The Data Architecture
The application is built upon a processed dataset derived from USDA FoodData Central (Branded Foods). We have completed an ETL process to clean, normalize, and load the data.

2.1 The Dataset (Post-ETL State)
The database is live with the following characteristics:

Volume: ~137,000 nutrient records linking ~10,000 distinct high-quality food items.

Quality: Every food item has data for at least 10 critical nutrients.

Diversity: Represents over 6,200 unique brands.

Standardization: All nutritional values are normalized to Amount per 100 Grams. We strictly use a "Grams-Only" logging standard.

2.2 Database Schema (9 Tables)
The schema is divided into three logical layers:

A. Core Layer (Static Data - Loaded)

Foods: Metadata (food_id [PK], name, brand_owner, food_category_id).

Nutrients: Dictionary of 34 critical nutrients (nutrient_id [PK], nutrient_name, unit_name).

Food_Nutrients: The massive Many-to-Many linkage table (food_id [FK], nutrient_id [FK], amount_per_100g).

Food_Categories: Classification dictionary (category_id [PK], category_name).

B. Application Layer (User Data - Dynamic) 5. Users: Authentication (user_id [PK], email, password_hash, created_at). 6. User_Profiles: Personal stats & calculated targets (user_id [FK], height, weight, goal, activity_level, target_calories, target_protein_g, target_fat_g, target_carbs_g). 7. User_Food_Log: Consumption history (log_id [PK], user_id [FK], food_id [FK], date_eaten, serving_size_grams).

C. Content Layer (Educational - Loaded) 8. Daily_Facts: Trivia for engagement. 9. Challenges: Educational quizzes.

3. Core Features & Functional Requirements
The backend must support the following features. The implementation of these features requires designing efficient and complex SQL algorithms.

3.1 Feature 1: Real-Time Gap Analysis ("What am I missing?")
Functional Goal: A dashboard that calculates the difference between a user's daily nutrient targets and their actual consumption for the current day.

Requirements:

Calculate total intake from the user's food log for all tracked nutrients.

Compare these totals against the user's specific profile targets.

Identify and return the top 5 nutrients with the largest "deficits" (where Target > Consumption).

Must handle cases where a user has logged no food yet (Cold Start).

3.2 Feature 2: Multi-Gap Optimizer (Smart Recommendations)
Functional Goal: A recommendation engine that solves the "Gap Analysis" problem by suggesting specific foods.

Requirements:

Take the "Missing Nutrients" (from Feature 1) as input.

Search the database for foods that are rich in multiple missing nutrients simultaneously (efficiency).

Variety Constraint: Must exclude foods the user has already eaten today.

Ranking: Results should be ordered by how efficiently they close the user's specific gaps.

3.3 Feature 3: Historical Trends (Progress Tracking)
Functional Goal: Visualize the user's nutritional progress over time.

Requirements:

Compare the user's average nutrient intake for the Current Week versus the Previous Week.

Determine the trend direction (Improvement, Decline, or Stable) for key macros.

This requires analyzing data across different time windows dynamically.

3.4 Feature 4: Smart Food Search & Log
Functional Goal: Allow users to find branded foods and add them to their daily log.

Requirements:

Text-based search against the Foods table.

Logging inputs must be in Grams. The system does not support unit conversion (e.g., "cups").

3.5 Feature 5: User Profile & Macro Calculator
Functional Goal: Onboarding process to determine nutritional needs.

Requirements:

Calculate BMR/TDEE based on user stats (Age, Weight, Height, Activity).

Distribute calories into Macro targets (Protein/Fat/Carbs) based on the user's selected goal (e.g., Weight Loss, Muscle Gain).

3.6 Feature 6: Educational Content
Functional Goal: Gamification to keep users engaged.

Requirements:

Serve random daily facts.

Serve interactive challenges (quizzes) that validate answers against the static database.

4. Technical Stack & Architecture
Backend: Node.js (Express).

Database: MySQL (Relational).

Frontend: React (Single Page Application).

Architecture Pattern: MVC (Model-View-Controller) or Service-Repository pattern is preferred to separate the API routing from the complex data logic.

5. Implementation Guidelines & Constraints
Academic Complexity: The core value of this project is the database logic. The SQL queries designed for the Gap Analysis and Optimizer must demonstrate advanced techniques (e.g., Aggregations, Nested Queries, Joins, Window Functions).

Performance: The Food_Nutrients table is large (~137k rows). Queries must be designed with performance in mind (efficient filtering and indexing).

No ORM for Core Logic: While an ORM can be used for basic configuration, the complex features (3.1, 3.2, 3.3) should be implemented using Raw SQL or Query Builders to ensure we have full control over the query structure.