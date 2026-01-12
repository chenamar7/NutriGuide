-- Admin Deficiencies Query (Query 12)
-- Purpose: Identify which nutrients users struggle with most
-- Complex Techniques: 3-level nested aggregation, RANK() window function, CTEs
-- Parameters: None (analyzes all users in last 30 days)

-- CTE Level 1: Calculate each user's daily intake per nutrient
WITH DailyUserIntake AS (
    SELECT 
        ufl.user_id,
        DATE(ufl.date_eaten) AS log_date,
        fn.nutrient_id,
        -- Sum up all nutrients from foods eaten that day
        SUM(fn.amount_per_100g * (ufl.serving_size_grams / 100)) AS daily_intake
    FROM User_Food_Log ufl
    JOIN Food_Nutrients fn ON ufl.food_id = fn.food_id
    WHERE fn.nutrient_id IN (1008, 1003, 1004, 1005)  -- Calories, Protein, Fat, Carbs
      AND ufl.date_eaten >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY ufl.user_id, DATE(ufl.date_eaten), fn.nutrient_id
),

-- CTE Level 2: Compare each day's intake to user's personal target
UserDailyVsTarget AS (
    SELECT 
        dui.user_id,
        dui.log_date,
        dui.nutrient_id,
        n.nutrient_name,
        dui.daily_intake,
        -- CASE expression: Map nutrient_id to the correct target column
        CASE dui.nutrient_id
            WHEN 1008 THEN up.target_calories
            WHEN 1003 THEN up.target_protein_g
            WHEN 1004 THEN up.target_fat_g
            WHEN 1005 THEN up.target_carbs_g
        END AS target,
        -- Calculate percentage of target achieved
        ROUND(dui.daily_intake * 100.0 / 
            NULLIF(CASE dui.nutrient_id
                WHEN 1008 THEN up.target_calories
                WHEN 1003 THEN up.target_protein_g
                WHEN 1004 THEN up.target_fat_g
                WHEN 1005 THEN up.target_carbs_g
            END, 0), 1) AS percent_met
    FROM DailyUserIntake dui
    JOIN User_Profiles up ON dui.user_id = up.user_id
    JOIN Nutrients n ON dui.nutrient_id = n.nutrient_id
    WHERE up.target_calories IS NOT NULL  -- Only users with calculated targets
)

-- Level 3: Aggregate across ALL users to find problem nutrients
SELECT 
    nutrient_id,
    nutrient_name,
    COUNT(DISTINCT user_id) AS users_analyzed,
    COUNT(*) AS total_user_days,
    ROUND(AVG(percent_met), 1) AS avg_percent_met,
    -- Conditional aggregation: Count days where user was under 80% of target
    ROUND(
        SUM(CASE WHEN percent_met < 80 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
        1
    ) AS pct_days_under_target,
    -- WINDOW FUNCTION: Rank nutrients by difficulty (lowest avg = hardest)
    RANK() OVER (ORDER BY AVG(percent_met) ASC) AS difficulty_rank
FROM UserDailyVsTarget
GROUP BY nutrient_id, nutrient_name
ORDER BY avg_percent_met ASC;
