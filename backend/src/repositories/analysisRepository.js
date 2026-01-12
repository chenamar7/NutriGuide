const base = require('./baseRepository');

/**
 * Analysis Repository
 * Handles gap analysis and recommendation queries
 * Uses complex SQL files from queries/ directory
 */

/**
 * Get gap analysis for a user on a specific date
 * Uses complex SQL from gapAnalysis.sql
 */
const getGapAnalysis = async (userId, targetDate) => {
    return await base.executeFromFile('gapAnalysis', [
        userId, targetDate, userId, userId, userId, userId
    ]);
};

/**
 * Get food recommendations based on nutrient gaps
 * Uses complex SQL from foodOptimizer.sql (with filters applied)
 */
const getFoodRecommendations = async (proteinDeficit, fatDeficit, carbsDeficit, userId) => {
    return await base.executeFromFile('foodOptimizer', [
        proteinDeficit, fatDeficit, carbsDeficit, userId
    ]);
};

/**
 * Get weekly trends comparison
 * Uses complex SQL from weeklyTrends.sql
 */
const getWeeklyTrends = async (userId) => {
    return await base.executeFromFile('weeklyTrends', [userId, userId]);
};

/**
 * Get user logging streak
 * Uses complex SQL from streakTracker.sql
 */
const getStreak = async (userId) => {
    const results = await base.executeFromFile('streakTracker', [userId, userId]);
    // Check if there are any results
    return results.length > 0 ? results[0] : null;
};

/**
 * Get most effective foods
 * Uses complex SQL from effectiveFoods.sql
 */
const getEffectiveFoods = async (userId) => {
    return await base.executeFromFile('effectiveFoods', [userId, userId]);
};

module.exports = {
    getGapAnalysis,
    getFoodRecommendations,
    getWeeklyTrends,
    getStreak,
    getEffectiveFoods
};

