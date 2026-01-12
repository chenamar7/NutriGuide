const base = require('./baseRepository');

/**
 * Challenges Repository
 * Handles all challenges and challenge options database operations
 */

/**
 * Get a random challenge (optionally filtered by category and excluding IDs)
 */
const findRandom = async (category, excludeIdsArray) => {
    // Build condiotions dynamically
    let conditions = [];
    let params = [];

    // Add category condition if provided
    if (category) {
        conditions.push('category = ?');
        params.push(category);
    }

    // Add exclude IDs condition if provided
    if (excludeIdsArray && excludeIdsArray.length > 0) {
        // Map exclude IDs to placeholders
        const placeholders = excludeIdsArray.map(() => '?').join(', ');
        conditions.push(`challenge_id NOT IN (${placeholders})`);
        params.push(...excludeIdsArray);
    }

    // Build where clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
        SELECT challenge_id, title, description, category
        FROM Challenges
        ${whereClause}
        ORDER BY RAND()
        LIMIT 1`;

    // Execute query and return first result
    return await base.findOne(sql, params);
};

/**
 * Get challenge by ID
 */
const findById = async (challengeId) => {
    return await base.findOne(`
        SELECT challenge_id, title, description, category
        FROM Challenges
        WHERE challenge_id = ?`,
        [challengeId]
    );
};

/**
 * Get options for a challenge
 */
const findOptionsByChallengeId = async (challengeId) => {
    return await base.findAll(`
        SELECT option_id, option_text
        FROM Challenge_Options
        WHERE challenge_id = ?
        ORDER BY option_id`,
        [challengeId]
    );
};

/**
 * Get all available categories
 */
const findAllCategories = async () => {
    return await base.findAll(`
        SELECT DISTINCT category
        FROM Challenges
        ORDER BY category
    `);
};

/**
 * Count challenges (optionally by category)
 */
const count = async (category) => {
    // Build SQL query dynamically
    let sql = `SELECT COUNT(*) as total FROM Challenges`;
    let params = [];

    // Add category condition if provided
    if (category) {
        sql += ` WHERE category = ?`;
        params.push(category);
    }

    const result = await base.findOne(sql, params);
    return result.total;
};

/**
 * Get correct answer for a challenge
 */
const findCorrectAnswer = async (challengeId) => {
    return await base.findOne(`
        SELECT 
            c.correct_answer_id,
            co.option_text as correct_answer_text
        FROM Challenges c
        JOIN Challenge_Options co ON c.correct_answer_id = co.option_id
        WHERE c.challenge_id = ?`,
        [challengeId]
    );
};

/**
 * Get user's challenge stats
 */
const findUserStats = async (userId) => {
    return await base.findOne(`
        SELECT challenge_score, challenge_streak, best_streak
        FROM User_Profiles
        WHERE user_id = ?`,
        [userId]
    );
};

/**
 * Update user's challenge score and streak
 */
const updateUserStats = async (userId, newScore, newStreak, newBestStreak) => {
    return await base.modify(`
        UPDATE User_Profiles
        SET 
            challenge_score = ?,
            challenge_streak = ?,
            best_streak = ?
        WHERE user_id = ?`,
        [newScore, newStreak, newBestStreak, userId]
    );
};

/**
 * Get leaderboard - top 25 by score or best_streak
 */
const getLeaderboard = async (sortBy = 'score', limit = 25) => {
    const column = sortBy === 'streak' ? 'best_streak' : 'challenge_score';
    return await base.findAll(`
        SELECT 
            u.user_id,
            u.username,
            up.challenge_score,
            up.best_streak
        FROM Users u
        JOIN User_Profiles up ON u.user_id = up.user_id
        WHERE up.${column} > 0
        ORDER BY up.${column} DESC, u.username ASC
        LIMIT ?`,
        [limit]
    );
};

/**
 * Get user's rank for a specific leaderboard
 */
const getUserRank = async (userId, sortBy = 'score') => {
    const column = sortBy === 'streak' ? 'best_streak' : 'challenge_score';
    const sql = `
        SELECT COUNT(*) + 1 as \`rank\`
        FROM User_Profiles
        WHERE ${column} > (
            SELECT COALESCE(up2.${column}, 0)
            FROM User_Profiles up2
            WHERE up2.user_id = ?
        )`;
    const result = await base.findOne(sql, [userId]);
    return result?.rank || null;
};

module.exports = {
    findRandom,
    findById,
    findOptionsByChallengeId,
    findAllCategories,
    count,
    findCorrectAnswer,
    findUserStats,
    updateUserStats,
    getLeaderboard,
    getUserRank
};
