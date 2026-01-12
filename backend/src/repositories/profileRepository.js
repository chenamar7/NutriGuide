const base = require('./baseRepository');

/**
 * Profile Repository
 * Handles all user profile database operations
 */

/**
 * Get user profile by user ID
 */
const findByUserId = async (userId) => {
    return await base.findOne(`
        SELECT * 
        FROM User_Profiles 
        WHERE user_id = ?`,
        [userId]
    );
};

/**
 * Create empty profile for new user
 */
const create = async (userId) => {
    return await base.insert(`
        INSERT INTO User_Profiles (user_id) 
        VALUES (?)`,
        [userId]
    );
};

/**
 * Update user profile fields
 * Uses COALESCE to only update provided fields
 */
const update = async (userId, data) => {
    const {
        birth_date = null,
        gender = null,
        height_cm = null,
        weight_kg = null,
        activity_level = null,
        goal = null
    } = data;
    
    return await base.modify(`
        UPDATE User_Profiles
        SET 
            birth_date = COALESCE(?, birth_date),
            gender = COALESCE(?, gender),
            height_cm = COALESCE(?, height_cm),
            weight_kg = COALESCE(?, weight_kg),
            activity_level = COALESCE(?, activity_level),
            goal = COALESCE(?, goal)
        WHERE user_id = ?`,
        [birth_date, gender, height_cm, weight_kg, activity_level, goal, userId]
    );
};

/**
 * Update calculated macro targets
 */
const updateTargets = async (userId, targetCalories, proteinG, carbsG, fatG) => {
    return await base.modify(`
        UPDATE User_Profiles
        SET 
            target_calories = ?, 
            target_protein_g = ?, 
            target_carbs_g = ?, 
            target_fat_g = ?
        WHERE user_id = ?`,
        [targetCalories, proteinG, carbsG, fatG, userId]
    );
};

module.exports = {
    findByUserId,
    create,
    update,
    updateTargets
};

