-- Admin Dashboard Query (Query 11)
-- Purpose: Platform-wide statistics for admin overview
-- Complex Techniques: UNION ALL, NOT EXISTS, Nested subqueries
-- Parameters: None (platform-wide data)

-- Section 1: User Engagement Stats
SELECT 
    'User Stats' AS metric_category,
    'Total Users' AS metric_name,
    COUNT(*) AS metric_value,
    NULL AS comparison_value
FROM Users

UNION ALL

SELECT 
    'User Stats',
    'Active Users (7 days)',
    (
        -- Users who logged food in the last 7 days
        SELECT COUNT(DISTINCT user_id) 
        FROM User_Food_Log 
        WHERE date_eaten >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    ),
    (
        -- NESTED SUBQUERY: Compare to previous week (days 8-14)
        SELECT COUNT(DISTINCT user_id) 
        FROM User_Food_Log 
        WHERE date_eaten BETWEEN DATE_SUB(CURDATE(), INTERVAL 14 DAY) 
                             AND DATE_SUB(CURDATE(), INTERVAL 7 DAY)
    )

UNION ALL

-- Section 2: Logging Activity
SELECT 
    'Activity',
    'Food Logs Today',
    COUNT(*),
    NULL
FROM User_Food_Log
WHERE DATE(date_eaten) = CURDATE()

UNION ALL

SELECT 
    'Activity',
    'Avg Logs Per Active User (7 days)',
    ROUND(
        -- Total logs in 7 days divided by unique users in 7 days
        (SELECT COUNT(*) FROM User_Food_Log WHERE date_eaten >= DATE_SUB(CURDATE(), INTERVAL 7 DAY))
        / 
        -- NULLIF prevents division by zero
        NULLIF((SELECT COUNT(DISTINCT user_id) FROM User_Food_Log WHERE date_eaten >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)), 0)
    , 1),
    NULL

UNION ALL

-- Section 3: Content Stats
SELECT 
    'Content',
    'Total Foods in Database',
    (SELECT COUNT(*) FROM Foods),
    NULL

UNION ALL

SELECT 
    'Content',
    'Foods Never Logged',
    (
        -- NOT EXISTS: Find foods that no user has ever logged
        SELECT COUNT(*) 
        FROM Foods f 
        WHERE NOT EXISTS (
            SELECT 1 FROM User_Food_Log ufl WHERE ufl.food_id = f.food_id
        )
    ),
    NULL;
