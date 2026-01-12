-- Most Effective Foods Query
-- Shows which foods contributed most to a nutrient intake
-- Uses nested subquery to calculate percentage contribution
-- Parameters: userId, nutrientId, daysBack, userId, nutrientId, daysBack

SELECT 
    f.food_id,
    f.name AS food_name,
    fc.category_name,
    COUNT(*) AS times_eaten,
    ROUND(SUM(fn.amount_per_100g * (ufl.serving_size_grams / 100)), 1) AS total_contributed,
    ROUND(
        SUM(fn.amount_per_100g * (ufl.serving_size_grams / 100)) * 100.0 / 
        (
            -- Nested subquery: total nutrient consumed by user in period
            SELECT SUM(fn2.amount_per_100g * (ufl2.serving_size_grams / 100))
            FROM User_Food_Log ufl2
            JOIN Food_Nutrients fn2 ON ufl2.food_id = fn2.food_id
            WHERE ufl2.user_id = ?
              AND fn2.nutrient_id = ?
              AND ufl2.date_eaten >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ),
        1
    ) AS percent_of_total
FROM User_Food_Log ufl
JOIN Foods f ON ufl.food_id = f.food_id
JOIN Food_Nutrients fn ON f.food_id = fn.food_id
JOIN Food_Categories fc ON f.food_category_id = fc.category_id
WHERE ufl.user_id = ?
  AND fn.nutrient_id = ?
  AND ufl.date_eaten >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
GROUP BY f.food_id, f.name, fc.category_name
HAVING total_contributed > 0
ORDER BY percent_of_total DESC
LIMIT 5;

