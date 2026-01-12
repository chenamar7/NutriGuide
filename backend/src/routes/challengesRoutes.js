const express = require('express');
const router = express.Router();
const challengesService = require('../services/challengesService');
const { authenticate } = require('../middleware/auth');

/**
 * GET /api/challenges/random
 * Get a random challenge with its options
 * Query: ?category=Vitamins&exclude=1,2,3 (both optional)
 */
router.get('/random', async (req, res) => {
    try {
        const { category, exclude } = req.query;
        const challenge = await challengesService.getRandomChallenge(category, exclude);
        res.json({ challenge });
    } catch (error) {
        // Check if the error is because no more challenges are available
        const status = error.message.includes('No more') ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
});

/**
 * GET /api/challenges/categories
 * Get all challenge categories with counts
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await challengesService.getCategories();
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/challenges/leaderboard
 * Get top 25 users by score or streak
 * Query: ?sortBy=score|streak (default: score)
 * Token optional - logged in users see their rank if not in top 25
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const { sortBy = 'score' } = req.query;

        // Check if user is logged in (optional auth)
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const jwt = require('jsonwebtoken');
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
            } catch (e) {
                // Invalid token - continue as guest
            }
        }

        const result = await challengesService.getLeaderboard(sortBy, userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/challenges/count
 * Get total number of challenges available
 * Query: ?category=Vitamins (optional)
 */
router.get('/count', async (req, res) => {
    try {
        const { category } = req.query;
        const total = await challengesService.getChallengeCount(category);
        // If the category is not provided, set it to 'all'
        res.json({ total, category: category || 'all' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/challenges/stats
 * Get user's challenge progress (score, streak)
 * Requires authentication
 */
router.get('/stats', authenticate, async (req, res) => {
    try {
        const stats = await challengesService.getStats(req.user.userId);
        res.json({ stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/challenges/:challenge_id
 * Get a specific challenge by ID
 */
router.get('/:challenge_id', async (req, res) => {
    try {
        const { challenge_id } = req.params;
        const challenge = await challengesService.getChallengeById(challenge_id);
        res.json({ challenge });
    } catch (error) {
        // Check if the error is because the challenge is not found
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
});

/**
 * POST /api/challenges/:challenge_id/answer
 * Submit an answer and check if it's correct
 * Body: { option_id: number }
 * Token optional - logged in users get score tracking
 */
router.post('/:challenge_id/answer', async (req, res) => {
    try {
        const { challenge_id } = req.params;
        const { option_id } = req.body;

        // Check if user is logged in (optional auth)
        let userId = null;
        // Get the token from the header
        const authHeader = req.headers.authorization;
        // Check if the token is valid
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                // Verify the token
                const jwt = require('jsonwebtoken');
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.userId;
            } catch (e) {
                // Invalid token - continue as guest
            }
        }

        const result = await challengesService.checkAnswer(challenge_id, option_id, userId);
        res.json(result);
    } catch (error) {
        // Check if the error is because the challenge is not found
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
});

module.exports = router;
