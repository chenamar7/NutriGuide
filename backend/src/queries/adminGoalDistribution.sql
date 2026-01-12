-- Admin Goal Distribution Query 
-- Purpose: Show distribution of user goals across the platform

SELECT 
    goal,
    COUNT(*) AS user_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM User_Profiles WHERE goal IS NOT NULL), 1) AS percentage
FROM User_Profiles
WHERE goal IS NOT NULL
GROUP BY goal
ORDER BY 
    CASE goal 
        WHEN 'Loss' THEN 1 
        WHEN 'Maintain' THEN 2 
        WHEN 'Gain' THEN 3 
    END;
