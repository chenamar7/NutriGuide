import api from './client';

/**
 * Analysis API
 * 
 * Gap analysis, recommendations, trends, and streak data
 * All endpoints require authentication
 */

/**
 * Get gap analysis for a date (macros + nutrient deficiencies)
 * @param {string} date - Optional, YYYY-MM-DD format (defaults to today)
 * @returns {Promise<Object>} Gap analysis with consumed vs target values
 */
export const getGapAnalysis = async (date = null) => {
    const url = date ? `/analysis/gap?date=${date}` : '/analysis/gap';
    const { data } = await api.get(url);
    return data;
};

/**
 * Get food recommendations based on nutrient gaps
 * @returns {Promise<Object>} { gaps, recommendations, message? }
 */
export const getRecommendations = async () => {
    const { data } = await api.get('/analysis/recommendations');
    return data;
};

/**
 * Get nutrition trends over time
 * @returns {Promise<Object>} Weekly trend data
 */
export const getTrends = async () => {
    const { data } = await api.get('/analysis/trends');
    return data;
};

/**
 * Get user's logging streak
 * @returns {Promise<Object>} { currentStreak, bestStreak }
 */
export const getStreak = async () => {
    const { data } = await api.get('/analysis/streak');
    return data;
};

/**
 * Get most effective foods for meeting nutrient targets
 * @param {Object} [options] - Optional filters
 * @param {number} [options.nutrientId] - Nutrient ID (1003=Protein, 1004=Fat, 1005=Carbs, 1008=Calories)
 * @param {number} [options.days=30] - Number of days to analyze
 * @returns {Promise<Object>} List of most effective foods
 */
export const getEffectiveFoods = async (options = {}) => {
    const params = new URLSearchParams();

    if (options.nutrientId) {
        params.append('nutrient_id', options.nutrientId);
    }
    if (options.days) {
        params.append('days', options.days);
    }

    const queryString = params.toString();
    const url = queryString ? `/analysis/effective?${queryString}` : '/analysis/effective';

    const { data } = await api.get(url);
    return data;
};
