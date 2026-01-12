import api from './client';

/**
 * Food Log API
 * 
 * Log food entries, view history, update and delete
 * All endpoints require authentication
 * Backend: /api/log
 */

/**
 * Log a food entry
 * @param {number} foodId - ID of the food to log
 * @param {number} servingSizeGrams - Serving size in grams
 * @param {string} [dateEaten] - Optional datetime (YYYY-MM-DD HH:MM:SS or YYYY-MM-DD), defaults to now
 * @returns {Promise<Object>} Created log entry
 */
export const logFood = async (foodId, servingSizeGrams, dateEaten = null) => {
    const body = {
        food_id: foodId,
        serving_size_grams: servingSizeGrams
    };
    if (dateEaten) {
        body.date_eaten = dateEaten;
    }
    const { data } = await api.post('/log', body);
    return data.log;
};

/**
 * Meal time definitions with representative hours
 */
export const MEAL_TIMES = {
    morning: { label: 'Breakfast', hour: 8, icon: '☀️', range: [5, 11] },
    lunch: { label: 'Lunch', hour: 12, icon: '🌤️', range: [11, 14] },
    afternoon: { label: 'Afternoon', hour: 15, icon: '🌅', range: [14, 17] },
    dinner: { label: 'Dinner', hour: 19, icon: '🌙', range: [17, 21] },
    lateNight: { label: 'Late Night', hour: 22, icon: '🌃', range: [21, 5] }
};

/**
 * Get meal type from hour (0-23)
 */
export const getMealTypeFromHour = (hour) => {
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'dinner';
    return 'lateNight'; // 21-5
};

/**
 * Build datetime string for a meal type on a given date
 */
export const buildMealDateTime = (date, mealType) => {
    const hour = MEAL_TIMES[mealType]?.hour || 12;
    return `${date} ${hour.toString().padStart(2, '0')}:00:00`;
};

/**
 * Get today's food log
 * @returns {Promise<Array>} List of today's log entries with calculated macros
 */
export const getTodayLog = async () => {
    const { data } = await api.get('/log/today');
    return data.logs;
};

/**
 * Get food log for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Promise<Array>} List of log entries for that date
 */
export const getLogByDate = async (date) => {
    const { data } = await api.get(`/log?date=${date}`);
    return data.logs;
};

/**
 * Get log history for past N days
 * @param {number} [days=30] - Number of days to look back
 * @returns {Promise<Array>} List of log entries grouped by date
 */
export const getLogHistory = async (days = 30) => {
    const { data } = await api.get(`/log/history?days=${days}`);
    return data.logs;
};

/**
 * Update a log entry's serving size
 * @param {number} logId - ID of the log entry to update
 * @param {number} servingSizeGrams - New serving size in grams
 * @returns {Promise<Object>} Updated log entry
 */
export const updateLogEntry = async (logId, servingSizeGrams) => {
    const { data } = await api.put(`/log/${logId}`, {
        serving_size_grams: servingSizeGrams
    });
    return data.log;
};

/**
 * Delete a log entry
 * @param {number} logId - ID of the log entry to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteLogEntry = async (logId) => {
    const { data } = await api.delete(`/log/${logId}`);
    return data;
};
