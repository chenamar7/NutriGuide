import api from './client';

/**
 * Admin API
 * 
 * Admin-only analytics and reports
 * All endpoints require authentication + admin privileges
 * Backend: /api/admin
 */

/**
 * Get admin dashboard statistics
 * Includes user counts, activity metrics, and log statistics
 * @returns {Promise<Object>} Dashboard data with stats object
 */
export const getDashboard = async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
};

/**
 * Get common nutrient deficiencies across all users
 * Shows which nutrients users struggle with most
 * @returns {Promise<Object>} Deficiency report data
 */
export const getDeficiencies = async () => {
    const { data } = await api.get('/admin/deficiencies');
    return data;
};

/**
 * Get popular food categories by user goal type
 * Shows category preferences for loss/maintain/gain goals
 * @returns {Promise<Object>} Category popularity data
 */
export const getPopularCategories = async () => {
    const { data } = await api.get('/admin/popular-categories');
    return data;
};

/**
 * Get top 5 most frequently logged foods
 * Shows most popular foods across the platform
 * @returns {Promise<Array>} Top foods with log counts
 */
export const getTopFoods = async () => {
    const { data } = await api.get('/admin/top-foods');
    return data;
};

/**
 * Get distribution of user goals
 * Shows breakdown of Loss/Maintain/Gain goals
 * @returns {Promise<Array>} Goal distribution with counts and percentages
 */
export const getGoalDistribution = async () => {
    const { data } = await api.get('/admin/goal-distribution');
    return data;
};
