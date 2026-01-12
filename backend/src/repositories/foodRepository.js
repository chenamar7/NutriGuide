const base = require('./baseRepository');

/**
 * Food Repository
 * Handles all food-related database operations
 */

/**
 * Get all food categories
 */
const findAllCategories = async () => {
    return await base.findAll(`
        SELECT category_id, category_name
        FROM Food_Categories
        ORDER BY category_name
    `);
};

/**
 * Count total foods matching search criteria
 */
const countSearchResults = async (searchTerm, category_id, min_cal, max_cal) => {
    // Build contains pattern dynamically
    const containsPattern = `%${searchTerm}%`;

    // Build conditions dynamically
    let conditions = ['f.name LIKE ?'];
    // Add contains pattern to parameters
    let params = [containsPattern];

    // Add category condition if provided
    if (category_id) {
        conditions.push('f.food_category_id = ?');
        params.push(category_id);
    }

    // Add min calorie condition if provided
    if (min_cal) {
        conditions.push('fn_cal.amount_per_100g >= ?');
        params.push(min_cal);
    }

    // Add max calorie condition if provided
    if (max_cal) {
        conditions.push('fn_cal.amount_per_100g <= ?');
        params.push(max_cal);
    }

    // Build where clause
    const whereClause = conditions.join(' AND ');
    const needsCalorieJoin = min_cal || max_cal;

    const result = await base.findOne(`
        SELECT COUNT(*) AS total
        FROM Foods f
        ${needsCalorieJoin ? 'JOIN Food_Nutrients fn_cal ON f.food_id = fn_cal.food_id AND fn_cal.nutrient_id = 1008' : ''}
        WHERE ${whereClause}`,
        params
    );

    // Return total count
    return result.total;
};

/**
 * Search foods by name with optional filters and pagination
 */
const search = async (searchTerm, category_id, min_cal, max_cal, limit, offset) => {
    // Build contains pattern dynamically
    const containsPattern = `%${searchTerm}%`;
    const startsWithPattern = `${searchTerm}%`;

    // Build conditions dynamically
    let conditions = ['f.name LIKE ?'];
    let params = [containsPattern];

    // Add category condition if provided
    if (category_id) {
        conditions.push('f.food_category_id = ?');
        params.push(category_id);
    }

    // Add min calorie condition if provided
    if (min_cal) {
        conditions.push('fn_cal.amount_per_100g >= ?');
        params.push(min_cal);
    }

    // Add max calorie condition if provided
    if (max_cal) {
        conditions.push('fn_cal.amount_per_100g <= ?');
        params.push(max_cal);
    }

    // Build where clause
    const whereClause = conditions.join(' AND ');
    const needsCalorieJoin = min_cal || max_cal;

    // Add parameters
    params.push(startsWithPattern);
    params.push(limit);
    params.push(offset);

    // Execute query and return all rows
    return await base.findAll(`
        SELECT 
            f.food_id, 
            f.name, 
            fc.category_name
            ${needsCalorieJoin ? ', ROUND(fn_cal.amount_per_100g, 0) AS calories_per_100g' : ''}
        FROM Foods f
        LEFT JOIN Food_Categories fc ON f.food_category_id = fc.category_id
        ${needsCalorieJoin ? 'JOIN Food_Nutrients fn_cal ON f.food_id = fn_cal.food_id AND fn_cal.nutrient_id = 1008' : ''}
        WHERE ${whereClause}
        ORDER BY 
            CASE WHEN f.name LIKE ? THEN 0 ELSE 1 END, 
            LENGTH(f.name)
        LIMIT ? OFFSET ?`,
        params
    );
};

/**
 * Get food by ID with all its nutrients
 */
const findByIdWithNutrients = async (foodId) => {
    return await base.findAll(`
        SELECT 
            f.food_id, 
            f.name AS food_name, 
            fc.category_name, 
            n.nutrient_id, 
            n.nutrient_name, 
            n.unit_name,
            ROUND(fn.amount_per_100g, 2) AS amount_per_100g
        FROM Foods f
        LEFT JOIN Food_Categories fc ON f.food_category_id = fc.category_id
        JOIN Food_Nutrients fn ON f.food_id = fn.food_id
        JOIN Nutrients n ON fn.nutrient_id = n.nutrient_id
        WHERE f.food_id = ?
        ORDER BY 
            CASE WHEN n.nutrient_id IN (1008, 1003, 1004, 1005) THEN 0 ELSE 1 END,
            n.nutrient_name`,
        [foodId]
    );
};

/**
 * Check if food exists
 */
const existsById = async (foodId) => {
    const result = await base.findOne(`
        SELECT food_id 
        FROM Foods 
        WHERE food_id = ?`,
        [foodId]
    );
    return result !== null;
};

module.exports = {
    findAllCategories,
    countSearchResults,
    search,
    findByIdWithNutrients,
    existsById
};
