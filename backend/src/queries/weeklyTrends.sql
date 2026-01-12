-- Weekly Trends Query
-- Compares current week's intake vs previous week
-- Uses CASE expressions for pivot-style comparison
-- Parameters: userId

WITH WeeklyIntake AS (
    SELECT 
        fn.nutrient_id,
        n.nutrient_name,
        n.unit_name,
        CASE 
            WHEN YEARWEEK(ufl.date_eaten, 1) = YEARWEEK(CURDATE(), 1) THEN 'current'
            WHEN YEARWEEK(ufl.date_eaten, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 7 DAY), 1) THEN 'previous'
            ELSE 'older'
        END AS week_label,
        SUM(fn.amount_per_100g * (ufl.serving_size_grams / 100)) AS total_intake,
        COUNT(DISTINCT DATE(ufl.date_eaten)) AS days_logged
    FROM User_Food_Log ufl
    JOIN Food_Nutrients fn ON ufl.food_id = fn.food_id
    JOIN Nutrients n ON fn.nutrient_id = n.nutrient_id
    WHERE ufl.user_id = ?
      AND ufl.date_eaten >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      AND fn.nutrient_id IN (1008, 1003, 1004, 1005)
    GROUP BY fn.nutrient_id, n.nutrient_name, n.unit_name, week_label
)
SELECT 
    nutrient_id,
    nutrient_name,
    unit_name,
    ROUND(MAX(CASE WHEN week_label = 'current' THEN total_intake / NULLIF(days_logged, 0) END), 1) AS current_week_avg,
    ROUND(MAX(CASE WHEN week_label = 'previous' THEN total_intake / NULLIF(days_logged, 0) END), 1) AS previous_week_avg,
    MAX(CASE WHEN week_label = 'current' THEN days_logged END) AS current_days,
    MAX(CASE WHEN week_label = 'previous' THEN days_logged END) AS previous_days,
    CASE 
        WHEN MAX(CASE WHEN week_label = 'previous' THEN total_intake / NULLIF(days_logged, 0) END) IS NULL THEN 'new_user'
        WHEN (MAX(CASE WHEN week_label = 'current' THEN total_intake / NULLIF(days_logged, 0) END) - 
              MAX(CASE WHEN week_label = 'previous' THEN total_intake / NULLIF(days_logged, 0) END)) /
             NULLIF(MAX(CASE WHEN week_label = 'previous' THEN total_intake / NULLIF(days_logged, 0) END), 0) > 0.05 THEN 'improvement'
        WHEN (MAX(CASE WHEN week_label = 'current' THEN total_intake / NULLIF(days_logged, 0) END) - 
              MAX(CASE WHEN week_label = 'previous' THEN total_intake / NULLIF(days_logged, 0) END)) /
             NULLIF(MAX(CASE WHEN week_label = 'previous' THEN total_intake / NULLIF(days_logged, 0) END), 0) < -0.05 THEN 'decline'
        ELSE 'stable'
    END AS trend
FROM WeeklyIntake
WHERE week_label IN ('current', 'previous')
GROUP BY nutrient_id, nutrient_name, unit_name
ORDER BY nutrient_id;

