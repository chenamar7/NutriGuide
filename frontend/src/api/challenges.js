import api from './client';

/**
 * Challenges API
 * 
 * Quiz challenges with gamification (score/streak tracking)
 * Most endpoints are public, stats and score tracking require auth
 * Backend: /api/challenges
 */

/**
 * Get a random challenge
 * @param {Object} [options] - Optional filters
 * @param {string} [options.category] - Filter by category (Vitamins, Minerals, Macros, Food Sources, General)
 * @param {number[]} [options.exclude] - Array of challenge IDs to exclude (for no repeats)
 * @returns {Promise<Object>} Challenge with question and options
 */
export const getRandomChallenge = async (options = {}) => {
    const params = new URLSearchParams();

    if (options.category) {
        params.append('category', options.category);
    }
    if (options.exclude && options.exclude.length > 0) {
        params.append('exclude', options.exclude.join(','));
    }

    const queryString = params.toString();
    const url = queryString ? `/challenges/random?${queryString}` : '/challenges/random';

    const { data } = await api.get(url);
    return data.challenge;
};

/**
 * Get challenge categories with counts
 * @returns {Promise<Array>} List of categories with challenge count per category
 */
export const getCategories = async () => {
    const { data } = await api.get('/challenges/categories');
    return data.categories;
};

/**
 * Get total challenge count
 * @param {string} [category] - Optional category filter
 * @returns {Promise<Object>} { total, category }
 */
export const getChallengeCount = async (category = null) => {
    const url = category
        ? `/challenges/count?category=${category}`
        : '/challenges/count';
    const { data } = await api.get(url);
    return data;
};

/**
 * Get a specific challenge by ID
 * @param {number} challengeId - Challenge ID
 * @returns {Promise<Object>} Challenge with question and options
 */
export const getChallengeById = async (challengeId) => {
    const { data } = await api.get(`/challenges/${challengeId}`);
    return data.challenge;
};

/**
 * Submit an answer to a challenge
 * Works with or without authentication:
 * - Without auth: just returns if answer was correct
 * - With auth: also updates user's score/streak
 * 
 * @param {number} challengeId - Challenge ID
 * @param {number} optionId - Selected option ID
 * @returns {Promise<Object>} { correct, correct_answer_id, correct_answer_text }
 */
export const submitAnswer = async (challengeId, optionId) => {
    const { data } = await api.post(`/challenges/${challengeId}/answer`, {
        option_id: optionId
    });
    return data;
};

/**
 * Get user's challenge stats (requires authentication)
 * @returns {Promise<Object>} { challenge_score, challenge_streak, best_streak }
 */
export const getStats = async () => {
    const { data } = await api.get('/challenges/stats');
    return data.stats;
};

/**
 * Get leaderboard - top 25 users by score or streak
 * @param {string} [sortBy='score'] - Sort by 'score' or 'streak'
 * @returns {Promise<Object>} { leaderboard, currentUser }
 */
export const getLeaderboard = async (sortBy = 'score') => {
    const { data } = await api.get(`/challenges/leaderboard?sortBy=${sortBy}`);
    return data;
};
