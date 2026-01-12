-- Gap Analysis Query
-- Compares user's consumed macros vs their targets for a specific date
-- Returns: macro_name, unit, consumed, target, deficit, percent_met
-- Parameters: userId (x5), targetDate (x1)

WITH DailyIntake AS (
    SELECT 
        n.nutrient_id,
        COALESCE(SUM(fn.amount_per_100g * (ufl.serving_size_grams / 100)), 0) AS total_consumed
    FROM Nutrients n
    LEFT JOIN Food_Nutrients fn ON n.nutrient_id = fn.nutrient_id
    LEFT JOIN User_Food_Log ufl ON fn.food_id = ufl.food_id 
        AND ufl.user_id = ?
        AND DATE(ufl.date_eaten) = ?
    WHERE n.nutrient_id IN (1008, 1003, 1004, 1005)
    GROUP BY n.nutrient_id
)
SELECT 
    'Calories' AS macro_name, 'kcal' AS unit,
    ROUND(di.total_consumed, 0) AS consumed,
    up.target_calories AS target,
    ROUND(up.target_calories - di.total_consumed, 0) AS deficit,
    ROUND(di.total_consumed / up.target_calories * 100, 1) AS percent_met
FROM User_Profiles up
JOIN DailyIntake di ON di.nutrient_id = 1008
WHERE up.user_id = ?

UNION ALL

SELECT 'Protein', 'g',
    ROUND(di.total_consumed, 1),
    up.target_protein_g,
    ROUND(up.target_protein_g - di.total_consumed, 0),
    ROUND(di.total_consumed / up.target_protein_g * 100, 1)
FROM User_Profiles up
JOIN DailyIntake di ON di.nutrient_id = 1003
WHERE up.user_id = ?

UNION ALL

SELECT 'Carbs', 'g',
    ROUND(di.total_consumed, 1),
    up.target_carbs_g,
    ROUND(up.target_carbs_g - di.total_consumed, 0),
    ROUND(di.total_consumed / up.target_carbs_g * 100, 1)
FROM User_Profiles up
JOIN DailyIntake di ON di.nutrient_id = 1005
WHERE up.user_id = ?

UNION ALL

SELECT 'Fat', 'g',
    ROUND(di.total_consumed, 1),
    up.target_fat_g,
    ROUND(up.target_fat_g - di.total_consumed, 0),
    ROUND(di.total_consumed / up.target_fat_g * 100, 1)
FROM User_Profiles up
JOIN DailyIntake di ON di.nutrient_id = 1004
WHERE up.user_id = ?;

