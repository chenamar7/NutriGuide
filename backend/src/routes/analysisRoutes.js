const express = require('express');
const router = express.Router();
const analysisService = require('../services/analysisService');
const { authenticate } = require('../middleware/auth');

// All analysis routes require authentication
router.use(authenticate);

/**
 * GET /api/analysis/gap
 * Get gap analysis for a specific date
 * Query: ?date=2025-12-17 (optional, defaults to today)
 */
router.get('/gap', async (req, res) => {
    try {
        const { date } = req.query;
        const analysis = await analysisService.getGapAnalysis(req.user.userId, date);
        res.json(analysis);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/analysis/gap/today
 * Shortcut for today's gap analysis
 */
router.get('/gap/today', async (req, res) => {
    try {
        const analysis = await analysisService.getGapAnalysis(req.user.userId);
        res.json(analysis);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/analysis/recommendations
 * Get food recommendations to fill today's gaps
 */
router.get('/recommendations', async (req, res) => {
    try {
        const recommendations = await analysisService.getRecommendations(req.user.userId);
        res.json(recommendations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/analysis/trends
 * Get weekly trends (this week vs last week)
 */
router.get('/trends', async (req, res) => {
    try {
        const trends = await analysisService.getWeeklyTrends(req.user.userId);
        res.json(trends);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analysis/streak
 * Get logging streak information
 */
router.get('/streak', async (req, res) => {
    try {
        const streak = await analysisService.getStreak(req.user.userId);
        res.json(streak);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analysis/effective
 * Get most effective foods for a nutrient
 * Query: ?nutrient_id=1003&days=30
 * nutrient_id: 1003=Protein, 1004=Fat, 1005=Carbs, 1008=Calories
 */
router.get('/effective', async (req, res) => {
    try {
        const { nutrient_id, days } = req.query;
        const effective = await analysisService.getEffectiveFoods(req.user.userId, nutrient_id, days);
        res.json(effective);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;

