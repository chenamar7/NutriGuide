const express = require('express');
const router = express.Router();
const logService = require('../services/logService');
const { authenticate } = require('../middleware/auth');

// All log routes require authentication
router.use(authenticate);

/**
 * POST /api/log
 * Log a food entry
 * Body: { food_id, serving_size_grams, date_eaten? }
 */
router.post('/', async (req, res) => {
    try {
        const { food_id, serving_size_grams, date_eaten } = req.body;
        const log = await logService.logFood(req.user.userId, food_id, serving_size_grams, date_eaten);
        res.status(201).json({ message: 'Food logged successfully', log });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/log/today
 * Get today's food log
 */
router.get('/today', async (req, res) => {
    try {
        const logs = await logService.getFoodLog(req.user.userId);
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/log/history?days=30
 * Get log history for past X days
 */
router.get('/history', async (req, res) => {
    try {
        const { days } = req.query;
        const results = await logService.getLogHistory(req.user.userId, days);
        res.json({ logs: results });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/log?date=2025-12-17
 * Get food log for specific date
 */
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        const logs = await logService.getFoodLog(req.user.userId, date);
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * PUT /api/log/:log_id
 * Update a log entry's serving size
 * Body: { serving_size_grams }
 * Returns: Updated log entry
 */
router.put('/:log_id', async (req, res) => {
    try {
        const { log_id } = req.params;
        const { serving_size_grams } = req.body;
        const log = await logService.updateLogEntry(req.user.userId, log_id, serving_size_grams);
        res.json({ message: 'Log entry updated', log });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 400;
        res.status(status).json({ error: error.message });
    }
});

/**
 * DELETE /api/log/:log_id
 * Delete a log entry
 */
router.delete('/:log_id', async (req, res) => {
    try {
        const { log_id } = req.params;
        const result = await logService.deleteLogEntry(req.user.userId, log_id);
        res.json(result);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;

