SELECT 
    f.food_id,
    f.name AS food_name,
    fc.category_name,
    COUNT(*) AS log_count,
    COUNT(DISTINCT ufl.user_id) AS unique_users
FROM User_Food_Log ufl
JOIN Foods f ON ufl.food_id = f.food_id
LEFT JOIN Food_Categories fc ON f.food_category_id = fc.category_id
WHERE ufl.date_eaten >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY f.food_id, f.name, fc.category_name
ORDER BY log_count DESC
LIMIT 5;
