-- Streak Tracker Query
-- Calculates consecutive days of food logging (gap-and-island problem)
-- Uses Window Functions (ROW_NUMBER) for date sequence detection
-- Parameters: userId

WITH UserLogDates AS (
    -- Get distinct dates when user logged food
    SELECT DISTINCT DATE(date_eaten) AS log_date
    FROM User_Food_Log
    WHERE user_id = ?
),
DateWithIsland AS (
    -- Assign island ID using gap-and-island technique
    -- Consecutive dates will have the same island_id
    SELECT 
        log_date,
        DATE_SUB(log_date, INTERVAL ROW_NUMBER() OVER (ORDER BY log_date) DAY) AS island_id
    FROM UserLogDates
),
Streaks AS (
    -- Group by island and count consecutive days
    SELECT 
        island_id,
        MIN(log_date) AS streak_start,
        MAX(log_date) AS streak_end,
        COUNT(*) AS streak_length
    FROM DateWithIsland
    GROUP BY island_id
),
CurrentStreak AS (
    -- Current streak only if it includes today or yesterday
    SELECT streak_length
    FROM Streaks
    WHERE streak_end >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    ORDER BY streak_end DESC
    LIMIT 1
)
SELECT 
    COALESCE((SELECT streak_length FROM CurrentStreak), 0) AS current_streak,
    (SELECT MAX(streak_length) FROM Streaks) AS longest_streak,
    (SELECT MAX(log_date) FROM UserLogDates) AS last_logged_date,
    CASE 
        WHEN (SELECT MAX(log_date) FROM UserLogDates) = CURDATE() THEN 'logged_today'
        WHEN (SELECT MAX(log_date) FROM UserLogDates) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN 'log_today_to_keep'
        ELSE 'streak_broken'
    END AS streak_status;

