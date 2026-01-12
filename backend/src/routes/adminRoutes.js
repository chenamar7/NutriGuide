const express = require('express');
const router = express.Router();
const adminService = require('../services/adminService');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin privileges
router.use(authenticate);
router.use(requireAdmin);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const dashboardData = await adminService.getDashboard();
        res.json(dashboardData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/popular-categories
router.get('/popular-categories', async (req, res) => {
    try {
        const categories = await adminService.getPopularCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/deficiencies
router.get('/deficiencies', async (req, res) => {
    try {
        const deficiencies = await adminService.getDeficiencies();
        res.json(deficiencies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/top-foods
router.get('/top-foods', async (req, res) => {
    try {
        const topFoods = await adminService.getTopFoods();
        res.json(topFoods);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/admin/goal-distribution
router.get('/goal-distribution', async (req, res) => {
    try {
        const distribution = await adminService.getGoalDistribution();
        res.json(distribution);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;