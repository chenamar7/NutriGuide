const logRepository = require('../repositories/logRepository');
const foodRepository = require('../repositories/foodRepository');

/**
 * Log a food entry
 * dateEaten is optional (defaults to now)
 */
const logFood = async (userId, foodId, servingSizeGrams, dateEaten) => {
    // Validation
    if (!foodId || !servingSizeGrams) {
        throw new Error('Food ID and serving size are required');
    }
    if (servingSizeGrams <= 0) {
        throw new Error('Serving size must be positive');
    }

    // Check if food exists
    const foodExists = await foodRepository.existsById(foodId);
    if (!foodExists) {
        throw new Error('Food not found');
    }

    // Use provided date or current timestamp
    const logDate = dateEaten || new Date();

    // Insert into database
    const logId = await logRepository.create(userId, foodId, logDate, servingSizeGrams);

    return {
        log_id: logId,
        user_id: userId,
        food_id: foodId,
        date_eaten: logDate,
        serving_size_grams: servingSizeGrams
    };
};

/**
 * Get food log for a specific date
 * date is optional (defaults to today)
 */
const getFoodLog = async (userId, date) => {
    // Default to today if no date provided
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Get the foods logs of the relevant date and user
    return await logRepository.findByUserAndDate(userId, targetDate);
};

/**
 * Delete a log entry
 * Validates that entry belongs to the user
 */
const deleteLogEntry = async (userId, logId) => {
    // Validation
    if (!logId) {
        throw new Error('Log ID is required');
    }

    const rowsDeleted = await logRepository.deleteById(logId, userId);

    // Check if anything was deleted
    if (rowsDeleted === 0) {
        throw new Error('Log entry not found or does not belong to you');
    }

    return { message: 'Log entry deleted successfully' };
};

/**
 * Update a log entry's serving size
 * Returns the updated log entry
 */
const updateLogEntry = async (userId, logId, newServingSize) => {
    if (!logId) {
        throw new Error('Log ID is required');
    }
    if (!newServingSize || newServingSize <= 0) {
        throw new Error('Serving size must be a positive number');
    }

    const rowsUpdated = await logRepository.updateServingSize(logId, userId, newServingSize);

    if (rowsUpdated === 0) {
        throw new Error('Log entry not found or does not belong to you');
    }

    // Return the updated log entry
    return await logRepository.findById(logId);
};

/**
 * Get log history for past X days
 */
const getLogHistory = async (userId, days) => {
    // Validation
    const numDays = parseInt(days);
    if (!numDays || numDays <= 0) {
        throw new Error('Days is required and must be a positive number');
    }

    // Get current date
    const startDate = new Date();
    // Calculate latest relevant date by days
    startDate.setDate(startDate.getDate() - numDays);
    // SQL format
    const startDateStr = startDate.toISOString().split('T')[0];

    return await logRepository.findByUserAndDateRange(userId, startDateStr);
};

module.exports = {
    logFood,
    getFoodLog,
    deleteLogEntry,
    getLogHistory,
    updateLogEntry
};
