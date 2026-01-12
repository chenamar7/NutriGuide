const base = require('./baseRepository');

/**
 * Admin Repository
 * Handles admin analytics queries
 * Uses complex SQL files from queries/ directory
 */

/**
 * Get admin dashboard statistics
 * Uses complex SQL from adminDashboard.sql
 */
const getDashboardStats = async () => {
    return await base.executeFromFile('adminDashboard');
};

/**
 * Get popular categories by goal
 * Uses complex SQL from adminCategories.sql
 */
const getPopularCategories = async () => {
    return await base.executeFromFile('adminCategories');
};

/**
 * Get common nutrient deficiencies
 * Uses complex SQL from adminDeficiencies.sql
 */
const getDeficiencies = async () => {
    return await base.executeFromFile('adminDeficiencies');
};

/**
 * Get top 5 most logged foods
 * Uses complex SQL from adminTopFoods.sql
 */
const getTopFoods = async () => {
    return await base.executeFromFile('adminTopFoods');
};

/**
 * Get user goal distribution
 * Uses complex SQL from adminGoalDistribution.sql
 */
const getGoalDistribution = async () => {
    return await base.executeFromFile('adminGoalDistribution');
};

module.exports = {
    getDashboardStats,
    getPopularCategories,
    getDeficiencies,
    getTopFoods,
    getGoalDistribution
};
