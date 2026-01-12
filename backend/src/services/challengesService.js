const challengesRepository = require('../repositories/challengesRepository');

/**
 * Get a random challenge with its options
 * Supports category filter and excluding already-seen challenges
 */
const getRandomChallenge = async (category, excludeIds) => {
    // Parse exclude IDs
    let idsArray = [];
    if (excludeIds) {
        idsArray = excludeIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    }

    const challenge = await challengesRepository.findRandom(category, idsArray);

    // No more challenges available
    if (!challenge) {
        throw new Error('No more challenges available');
    }

    // Get the options for this challenge
    const options = await challengesRepository.findOptionsByChallengeId(challenge.challenge_id);

    return {
        challenge_id: challenge.challenge_id,
        title: challenge.title,
        question: challenge.description,
        category: challenge.category,
        options: options
    };
};

/**
 * Get a specific challenge by ID with its options
 */
const getChallengeById = async (challengeId) => {
    // Validation
    if (!challengeId) {
        throw new Error('Challenge ID is required');
    }

    // Get the challenge from the database
    const challenge = await challengesRepository.findById(challengeId);

    // No challenge found- throw error
    if (!challenge) {
        throw new Error('Challenge not found');
    }

    // Get the options for this challenge
    const options = await challengesRepository.findOptionsByChallengeId(challengeId);

    return {
        challenge_id: challenge.challenge_id,
        title: challenge.title,
        question: challenge.description,
        category: challenge.category,
        options: options
    };
};

/**
 * Check if the submitted answer is correct
 * Updates user's score and streak if userId is provided
 */
const checkAnswer = async (challengeId, optionId, userId) => {
    // Validation
    if (!challengeId) {
        throw new Error('Challenge ID is required');
    }
    if (!optionId) {
        throw new Error('Option ID is required');
    }

    // Get the challenge with its correct answer
    const challenge = await challengesRepository.findCorrectAnswer(challengeId);

    // No challenge found- throw error
    if (!challenge) {
        throw new Error('Challenge not found');
    }

    // Check if the submitted answer is correct
    const isCorrect = challenge.correct_answer_id === parseInt(optionId);

    // Update score and streak if user is logged in
    if (userId) {
        // Get current stats
        const stats = await challengesRepository.findUserStats(userId);

        if (isCorrect) {
            // Correct: increment score and streak, update best if higher
            const newScore = (stats.challenge_score || 0) + 1;
            const newStreak = (stats.challenge_streak || 0) + 1;
            const newBestStreak = Math.max(stats.best_streak || 0, newStreak);

            await challengesRepository.updateUserStats(userId, newScore, newStreak, newBestStreak);
        } else {
            // Wrong: reset streak to 0 and keep score the same
            await challengesRepository.updateUserStats(
                userId,
                stats.challenge_score || 0,
                0,
                stats.best_streak || 0
            );
        }
    }

    return {
        correct: isCorrect,
        correct_answer_id: challenge.correct_answer_id,
        correct_answer_text: challenge.correct_answer_text
    };
};

/**
 * Get user's challenge stats (score, streak, best streak)
 */
const getStats = async (userId) => {
    // Validation
    if (!userId) {
        throw new Error('User ID is required');
    }

    // Get the user's stats from the database
    const stats = await challengesRepository.findUserStats(userId);

    // User has no profile yet - return zeros
    if (!stats) {
        return {
            score: 0,
            current_streak: 0,
            best_streak: 0
        };
    }

    // Get total challenges count for context
    const total = await challengesRepository.count();

    // Return the user's stats
    return {
        score: stats.challenge_score || 0,
        current_streak: stats.challenge_streak || 0,
        best_streak: stats.best_streak || 0,
        total_challenges: total
    };
};

/**
 * Get total count of challenges (optionally by category)
 */
const getChallengeCount = async (category) => {
    return await challengesRepository.count(category);
};

/**
 * Get all available challenge categories with counts
 */
const getCategories = async () => {
    return await challengesRepository.findAllCategories();
};

/**
 * Get leaderboard with top 25 and current user's position
 */
const getLeaderboard = async (sortBy = 'score', userId = null) => {
    // Get top 25
    const topUsers = await challengesRepository.getLeaderboard(sortBy, 25);

    // Add rank to each user
    const leaderboard = topUsers.map((user, index) => ({
        rank: index + 1,
        user_id: user.user_id,
        username: user.username,
        score: user.challenge_score || 0,
        best_streak: user.best_streak || 0
    }));

    let currentUser = null;

    // If user is logged in, check if they're in the top 25
    if (userId) {
        const isInTop25 = leaderboard.some(u => u.user_id === userId);

        if (!isInTop25) {
            // Get user's rank and stats
            const userRank = await challengesRepository.getUserRank(userId, sortBy);
            const userStats = await challengesRepository.findUserStats(userId);

            // Get username
            const base = require('../repositories/baseRepository');
            const userInfo = await base.findOne(
                'SELECT username FROM Users WHERE user_id = ?',
                [userId]
            );

            if (userStats && userInfo) {
                currentUser = {
                    rank: userRank,
                    user_id: userId,
                    username: userInfo.username,
                    score: userStats.challenge_score || 0,
                    best_streak: userStats.best_streak || 0
                };
            }
        }
    }

    return {
        leaderboard,
        currentUser
    };
};

module.exports = {
    getRandomChallenge,
    getChallengeById,
    checkAnswer,
    getStats,
    getChallengeCount,
    getCategories,
    getLeaderboard
};
