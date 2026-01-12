const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { authenticate, requireAdmin } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Create new user account
 * Body: { username, email, password }
 */
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await authService.register(username, email, password);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and get JWT token
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
});

/**
 * GET /api/auth/me
 * Get current logged-in user info
 * Requires: Authorization header with Bearer token
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await authService.getCurrentUser(req.user.userId);
        res.json({ user });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * DELETE /api/auth/:userId
 * Delete a user account (admin only)
 */
router.delete('/:userId', authenticate, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await authService.deleteUser(userId);
        res.json(result);
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
});

module.exports = router;
