const express = require('express');
const router = express.Router();
const foodService = require('../services/foodService');

/**
 * GET /api/foods/categories
 * Returns all food categories
 */
router.get('/categories', async (req, res) => {
    try {
        const categories = await foodService.getCategories();
        res.json({ categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/foods/search?q=chicken&category_id=5&min_cal=100&max_cal=300&page=1&limit=20
 * Search foods by name with optional filters and pagination
 * Returns: { foods, pagination: { page, limit, total, totalPages } }
 */
router.get('/search', async (req, res) => {
    try {
        const { q, category_id, min_cal, max_cal, page, limit } = req.query;
        const result = await foodService.searchFoods(q, category_id, min_cal, max_cal, page, limit);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * GET /api/foods/:food_id
 * Get single food with all nutrients
 */
router.get('/:food_id', async (req, res) => {
    try {
        const { food_id } = req.params;
        const food = await foodService.getFoodById(food_id);
        res.json({ food });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

module.exports = router;
