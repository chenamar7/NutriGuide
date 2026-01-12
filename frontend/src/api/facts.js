import api from './client';

/**
 * Facts API
 * 
 * Daily nutrition facts and fun knowledge
 */

/**
 * Get a random nutrition fact
 * @returns {Promise<Object>} Random fact with title and content
 */
export const getRandomFact = async () => {
    const { data } = await api.get('/facts/random');
    return data.fact;
};

/**
 * Get facts by category
 * @param {string} category - Category name
 * @returns {Promise<Array>} List of facts
 */
export const getFactsByCategory = async (category) => {
    const { data } = await api.get(`/facts?category=${category}`);
    return data.facts;
};

/**
 * Get all fact categories
 * @returns {Promise<Array>} List of categories
 */
export const getCategories = async () => {
    const { data } = await api.get('/facts/categories');
    return data.categories;
};
