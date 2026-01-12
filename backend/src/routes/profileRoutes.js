const express = require('express');
const router = express.Router();
const profileService = require('../services/profileService');
const { authenticate } = require('../middleware/auth');

// All profile routes require authentication
router.use(authenticate);

/**
 * GET /api/profile
 * Get current user's profile
 */
router.get('/', async (req, res) => {
    try {
        const profile = await profileService.getProfile(req.user.userId);
        res.json({ profile });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * PUT /api/profile
 * Update profile fields
 * Body: { birth_date?, gender?, height_cm?, weight_kg?, activity_level?, goal? }
 */
router.put('/', async (req, res) => {
    try {
        const profile = await profileService.updateProfile(req.user.userId, req.body);
        res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/profile/calculate
 * Calculate and save macro targets based on profile data
 */
router.post('/calculate', async (req, res) => {
    try {
        const targets = await profileService.calculateTargets(req.user.userId);
        res.json({ message: 'Targets calculated successfully', targets });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
