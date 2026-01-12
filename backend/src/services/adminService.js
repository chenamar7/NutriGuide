const adminRepository = require('../repositories/adminRepository');
// Service layer for admin analytics

/**
 * Get admin dashboard statistics
 */
const getDashboard = async () => {
    return await adminRepository.getDashboardStats();
};

/**
 * Get popular food categories by user goal
 */
const getPopularCategories = async () => {
    return await adminRepository.getPopularCategories();
};

/**
 * Get nutrient deficiency report across all users
 */
const getDeficiencies = async () => {
    return await adminRepository.getDeficiencies();
};

/**
 * Get top 5 most frequently logged foods
 */
const getTopFoods = async () => {
    return await adminRepository.getTopFoods();
};

/**
 * Get distribution of user goals (Loss/Maintain/Gain)
 */
const getGoalDistribution = async () => {
    return await adminRepository.getGoalDistribution();
};

module.exports = {
    getDashboard,
    getPopularCategories,
    getDeficiencies,
    getTopFoods,
    getGoalDistribution
};
