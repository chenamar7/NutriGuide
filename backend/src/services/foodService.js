const foodRepository = require('../repositories/foodRepository');

/**
 * Get all food categories
 */
const getCategories = async () => {
    // Get all food categories from database
    return await foodRepository.findAllCategories();
};

/**
 * Search foods by name with optional filters and pagination
 * Filters: category_id, min_cal, max_cal
 * Pagination: page, limit
 */
const searchFoods = async (searchTerm, category_id, min_cal, max_cal, page, limit) => {
    // Validation
    if (!searchTerm || searchTerm.trim() === '') {
        throw new Error('Search term is required');
    }

    // Pagination defaults
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Count total results for pagination
    const total = await foodRepository.countSearchResults(searchTerm, category_id, min_cal, max_cal);

    // Get paginated results
    const foods = await foodRepository.search(searchTerm, category_id, min_cal, max_cal, limitNum, offset);
    
    return {
        foods,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
        }
    };
};

/**
 * Get food by ID with all its nutrients
 * Returns nested object with nutrients array
 */
const getFoodById = async (foodId) => {
    // Validation
    if (!foodId) {  
        throw new Error('Food ID is required');
    }

    // Get food from database
    const rows = await foodRepository.findByIdWithNutrients(foodId);

    // No food found- throw error
    if (rows.length === 0) {
        throw new Error('Food not found');
    }

    // Transform rows into nested structure 
    const firstRow = rows[0];
    // Map the rows to the nutrients array
    const nutrients = rows.map(row => ({
        nutrient_id: row.nutrient_id,
        name: row.nutrient_name,
        unit: row.unit_name,
        amount_per_100g: row.amount_per_100g
    }));

    // Return the food object with nutrients array
    return {
        food_id: firstRow.food_id,
        name: firstRow.food_name,
        category: firstRow.category_name,
        nutrients
    };
};

module.exports = {
    getCategories,
    searchFoods,
    getFoodById
};
