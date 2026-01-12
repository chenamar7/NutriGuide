import api from './client';

/**
 * Foods API
 * 
 * Food search, categories, and details
 * Backend: /api/foods
 */

/**
 * Get all food categories
 * @returns {Promise<Array>} List of categories with id and name
 */
export const getCategories = async () => {
    const { data } = await api.get('/foods/categories');
    return data.categories;
};

/**
 * Search foods by name with optional filters
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search term (min 2 chars required)
 * @param {number} [params.categoryId] - Filter by category ID
 * @param {number} [params.minCal] - Minimum calories per 100g
 * @param {number} [params.maxCal] - Maximum calories per 100g
 * @param {number} [params.page=1] - Page number
 * @param {number} [params.limit=20] - Results per page (max 100)
 * @returns {Promise<Object>} { foods, pagination }
 */
export const searchFoods = async ({ query, categoryId, minCal, maxCal, page = 1, limit = 20 }) => {
    const params = new URLSearchParams();

    if (query) params.append('q', query);
    if (categoryId) params.append('category_id', categoryId);
    if (minCal) params.append('min_cal', minCal);
    if (maxCal) params.append('max_cal', maxCal);
    params.append('page', page);
    params.append('limit', limit);

    const { data } = await api.get(`/foods/search?${params.toString()}`);
    return data;
};

/**
 * Get detailed food information with all nutrients
 * @param {number} foodId - Food ID
 * @returns {Promise<Object>} Complete food object with nutrients
 */
export const getFoodById = async (foodId) => {
    const { data } = await api.get(`/foods/${foodId}`);
    return data.food;
};
