const analysisRepository = require('../repositories/analysisRepository');

/**
 * Analysis Service
 * Contains complex analytical queries for nutrition insights
 * SQL queries are loaded from separate files in /queries directory
 */

// Nutrient IDs for reference
const NUTRIENT_IDS = {
    CALORIES: 1008,
    PROTEIN: 1003,
    FAT: 1004,
    CARBS: 1005
};

/**
 * Get gap analysis for a specific date
 * Compares consumed macros vs user's targets
 * Returns deficit/surplus for each macro
 */
const getGapAnalysis = async (userId, date) => {
    // Default to today if no date provided
    const targetDate = date || new Date().toISOString().split('T')[0];

    // Execute query (userId appears 5 times in the query due to UNION ALL structure)
    const results = await analysisRepository.getGapAnalysis(userId, targetDate);

    // Check if user has targets set
    if (results.length === 0 || results[0].target === null) {
        throw new Error('Please set your macro targets first (use /api/profile/calculate)');
    }

    return {
        date: targetDate,
        macros: results
    };
};

/**
 * Get food recommendations to fill nutrient gaps
 * Uses gap analysis results to find efficient foods
 */
const getRecommendations = async (userId) => {
    // First get today's gaps
    const gapData = await getGapAnalysis(userId);
    
    // Extract deficits for each macro (only if positive = under target)
    const gaps = {};
    gapData.macros.forEach(macro => {
        if (macro.deficit > 0) {
            gaps[macro.macro_name.toLowerCase()] = macro.deficit;
        }
    });

    // If no gaps, user has met all targets!
    if (Object.keys(gaps).length === 0) {
        return {
            message: "You've met all your macro targets for today!",
            recommendations: []
        };
    }

    // Get deficits (use small value if no deficit to avoid division issues)
    const proteinDeficit = gaps.protein || 0.1;
    const fatDeficit = gaps.fat || 0.1;
    const carbsDeficit = gaps.carbs || 0.1;

    // Load and execute optimizer query
    const recommendations = await analysisRepository.getFoodRecommendations(
        proteinDeficit, fatDeficit, carbsDeficit, userId
    );

    return {
        gaps: gaps,
        recommendations: recommendations
    };
};

/**
 * Get weekly trends comparison
 * Compares this week's average intake vs last week
 */
const getWeeklyTrends = async (userId) => {
    const trends = await analysisRepository.getWeeklyTrends(userId);

    // If no data, user is new
    if (trends.length === 0) {
        return {
            message: 'Not enough data yet. Keep logging to see trends!',
            trends: []
        };
    }

    return { trends };
};

/**
 * Get logging streak information
 * Uses gap-and-island technique to find consecutive logging days
 */
const getStreak = async (userId) => {
    const result = await analysisRepository.getStreak(userId);

    // No logs yet
    if (!result || result.current_streak === null) {
        return {
            current_streak: 0,
            longest_streak: 0,
            last_logged_date: null,
            streak_status: 'no_logs'
        };
    }

    return result;
};

/**
 * Get most effective foods for a nutrient
 * Shows which foods contributed most to intake
 * nutrientId: 1003=Protein, 1004=Fat, 1005=Carbs, 1008=Calories
 * daysBack: how many days to analyze (default 30)
 */
const getEffectiveFoods = async (userId, nutrientId, daysBack = 30) => {
    // Validate nutrient ID
    const validNutrients = [1003, 1004, 1005, 1008];
    const nutrientIdNum = parseInt(nutrientId) || NUTRIENT_IDS.PROTEIN;
    
    if (!validNutrients.includes(nutrientIdNum)) {
        throw new Error('Invalid nutrient ID. Use 1003 (Protein), 1004 (Fat), 1005 (Carbs), or 1008 (Calories)');
    }

    const days = parseInt(daysBack) || 30;

    // Parameters appear twice in nested subquery
    const foods = await analysisRepository.getEffectiveFoods(userId);

    // Get nutrient name for response
    const nutrientNames = {
        1003: 'Protein',
        1004: 'Fat',
        1005: 'Carbs',
        1008: 'Calories'
    };

    return {
        nutrient: nutrientNames[nutrientIdNum],
        period_days: days,
        top_foods: foods
    };
};

module.exports = {
    getGapAnalysis,
    getRecommendations,
    getWeeklyTrends,
    getStreak,
    getEffectiveFoods,
    NUTRIENT_IDS
};

