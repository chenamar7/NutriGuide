-- Admin Categories Query (Query 13)
-- Purpose: Food category popularity segmented by user goal (Loss/Maintain/Gain)
-- Complex Techniques: CTE, Pivot-style CASE aggregation, Nested CASE comparison
-- Parameters: None (analyzes all users in last 30 days)

-- CTE: Count food logs per category, grouped by user's goal
WITH CategoryLogsByGoal AS (
    SELECT 
        fc.category_id,
        fc.category_name,
        up.goal,
        COUNT(*) AS log_count,
        COUNT(DISTINCT ufl.user_id) AS unique_users
    FROM User_Food_Log ufl
    JOIN Foods f ON ufl.food_id = f.food_id
    JOIN Food_Categories fc ON f.food_category_id = fc.category_id
    JOIN User_Profiles up ON ufl.user_id = up.user_id
    WHERE up.goal IS NOT NULL
      AND ufl.date_eaten >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY fc.category_id, fc.category_name, up.goal
)

SELECT 
    category_name,
    
    -- PIVOT: Transform rows into columns using conditional SUM
    -- Instead of 3 rows per category, we get 1 row with 3 columns
    SUM(CASE WHEN goal = 'Loss' THEN log_count ELSE 0 END) AS loss_logs,
    SUM(CASE WHEN goal = 'Maintain' THEN log_count ELSE 0 END) AS maintain_logs,
    SUM(CASE WHEN goal = 'Gain' THEN log_count ELSE 0 END) AS gain_logs,
    
    -- NESTED CASE: Determine which goal group uses this category most
    CASE 
        WHEN SUM(CASE WHEN goal = 'Loss' THEN log_count ELSE 0 END) >= 
             SUM(CASE WHEN goal = 'Maintain' THEN log_count ELSE 0 END)
         AND SUM(CASE WHEN goal = 'Loss' THEN log_count ELSE 0 END) >= 
             SUM(CASE WHEN goal = 'Gain' THEN log_count ELSE 0 END)
        THEN 'Loss'
        WHEN SUM(CASE WHEN goal = 'Gain' THEN log_count ELSE 0 END) >= 
             SUM(CASE WHEN goal = 'Maintain' THEN log_count ELSE 0 END)
        THEN 'Gain'
        ELSE 'Maintain'
    END AS most_popular_with,
    
    -- Total logs across all goals
    SUM(log_count) AS total_logs
    
FROM CategoryLogsByGoal
GROUP BY category_id, category_name
HAVING SUM(log_count) > 0  -- Only show categories with logs
ORDER BY total_logs DESC
LIMIT 15;
