const base = require('./baseRepository');

/**
 * Log Repository
 * Handles all food log database operations
 */

/**
 * Create a new food log entry
 */
const create = async (userId, foodId, dateEaten, servingSizeGrams) => {
    return await base.insert(`
        INSERT INTO User_Food_Log (user_id, food_id, date_eaten, serving_size_grams)
        VALUES (?, ?, ?, ?)`,
        [userId, foodId, dateEaten, servingSizeGrams]
    );
};

/**
 * Get food log for a specific date with nutrition data
 */
const findByUserAndDate = async (userId, targetDate) => {
    return await base.findAll(`
        SELECT 
            ufl.log_id,
            ufl.date_eaten,
            ufl.serving_size_grams,
            f.food_id,
            f.name AS food_name,
            fc.category_name,
            ROUND(COALESCE(cal.amount_per_100g, 0) * ufl.serving_size_grams / 100, 1) AS calories,
            ROUND(COALESCE(prot.amount_per_100g, 0) * ufl.serving_size_grams / 100, 1) AS protein_g,
            ROUND(COALESCE(carb.amount_per_100g, 0) * ufl.serving_size_grams / 100, 1) AS carbs_g,
            ROUND(COALESCE(fat.amount_per_100g, 0) * ufl.serving_size_grams / 100, 1) AS fat_g
        FROM User_Food_Log ufl
        JOIN Foods f ON ufl.food_id = f.food_id
        LEFT JOIN Food_Categories fc ON f.food_category_id = fc.category_id
        LEFT JOIN Food_Nutrients cal ON f.food_id = cal.food_id AND cal.nutrient_id = 1008
        LEFT JOIN Food_Nutrients prot ON f.food_id = prot.food_id AND prot.nutrient_id = 1003
        LEFT JOIN Food_Nutrients carb ON f.food_id = carb.food_id AND carb.nutrient_id = 1005
        LEFT JOIN Food_Nutrients fat ON f.food_id = fat.food_id AND fat.nutrient_id = 1004
        WHERE ufl.user_id = ? AND DATE(ufl.date_eaten) = ?
        ORDER BY ufl.date_eaten DESC`,
        [userId, targetDate]
    );
};

/**
 * Delete a log entry
 */
const deleteById = async (logId, userId) => {
    return await base.modify(`
        DELETE FROM User_Food_Log 
        WHERE log_id = ? AND user_id = ?`,
        [logId, userId]
    );
};

/**
 * Update log entry's serving size
 */
const updateServingSize = async (logId, userId, newServingSize) => {
    return await base.modify(`
        UPDATE User_Food_Log
        SET serving_size_grams = ?
        WHERE log_id = ? AND user_id = ?`,
        [newServingSize, logId, userId]
    );
};

/**
 * Get log entry by ID
 */
const findById = async (logId) => {
    return await base.findOne(`
        SELECT 
            ufl.log_id,
            ufl.date_eaten,
            ufl.serving_size_grams,
            f.food_id,
            f.name AS food_name
        FROM User_Food_Log ufl
        JOIN Foods f ON ufl.food_id = f.food_id
        WHERE ufl.log_id = ?`,
        [logId]
    );
};

/**
 * Get log history for past X days with nutrition data
 */
const findByUserAndDateRange = async (userId, startDateStr) => {
    return await base.findAll(`
        SELECT 
            ufl.log_id,
            ufl.date_eaten,
            ufl.serving_size_grams,
            f.food_id,
            f.name AS food_name,
            ROUND(COALESCE(cal.amount_per_100g, 0) * ufl.serving_size_grams / 100, 1) AS calories,
            ROUND(COALESCE(prot.amount_per_100g, 0) * ufl.serving_size_grams / 100, 1) AS protein_g,
            ROUND(COALESCE(carb.amount_per_100g, 0) * ufl.serving_size_grams / 100, 1) AS carbs_g,
            ROUND(COALESCE(fat.amount_per_100g, 0) * ufl.serving_size_grams / 100, 1) AS fat_g
        FROM User_Food_Log ufl
        JOIN Foods f ON ufl.food_id = f.food_id
        LEFT JOIN Food_Nutrients cal ON f.food_id = cal.food_id AND cal.nutrient_id = 1008
        LEFT JOIN Food_Nutrients prot ON f.food_id = prot.food_id AND prot.nutrient_id = 1003
        LEFT JOIN Food_Nutrients carb ON f.food_id = carb.food_id AND carb.nutrient_id = 1005
        LEFT JOIN Food_Nutrients fat ON f.food_id = fat.food_id AND fat.nutrient_id = 1004
        WHERE ufl.user_id = ? AND DATE(ufl.date_eaten) >= ?
        ORDER BY ufl.date_eaten DESC`,
        [userId, startDateStr]
    );
};

module.exports = {
    create,
    findByUserAndDate,
    deleteById,
    updateServingSize,
    findById,
    findByUserAndDateRange
};

