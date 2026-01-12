const express = require('express');
const router = express.Router();
const factsService = require('../services/factsService');

/**
 * GET /api/facts/random
 * Get a random nutrition fact
 * Query: ?category=Vitamins (optional)
 */
router.get('/random', async (req, res) => {
    try {
        const { category } = req.query;
        const fact = await factsService.getRandomFact(category);
        res.json({ fact });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

/**
 * GET /api/facts/categories
 * Get all fact categories with counts
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await factsService.getCategories();
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/facts
 * Get all facts (optionally filtered by category)
 * Query: ?category=Vitamins (optional)
 */
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const facts = await factsService.getAllFacts(category);
        res.json({ facts, count: facts.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/facts/:fact_id
 * Get a specific fact by ID
 */
router.get('/:fact_id', async (req, res) => {
    try {
        const { fact_id } = req.params;
        const fact = await factsService.getFactById(fact_id);
        res.json({ fact });
    } catch (error) {
        const status = error.message.includes('not found') ? 404 : 500;
        res.status(status).json({ error: error.message });
    }
});

module.exports = router;

