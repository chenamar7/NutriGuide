const foodService = require('../../../src/services/foodService');
const foodRepository = require('../../../src/repositories/foodRepository');

// Mock dependencies
jest.mock('../../../src/repositories/foodRepository');

/**
 * Food Service Unit Tests
 * Tests food business logic including search and filtering
 */
describe('foodService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * getCategories tests
     * Purpose: Test the getCategories function of the foodService
     * Success: Returns all food categories
     * Failure: N/A (returns empty array when no categories)
     */
    describe('getCategories', () => {
        it('should return all food categories', async () => {
            // Mock an array of categories
            const mockCategories = [
                { category_id: 1, category_name: 'Dairy' },
                { category_id: 2, category_name: 'Fruits' }
            ];
            foodRepository.findAllCategories.mockResolvedValue(mockCategories);

            // Call the function and check the result
            const result = await foodService.getCategories();

            // Check that the result matches the mock categories
            expect(result).toEqual(mockCategories);

            // Verify repository was called
            expect(foodRepository.findAllCategories).toHaveBeenCalled();
        });
    });

    /**
     * searchFoods tests
     * Purpose: Test the searchFoods function of the foodService
     * Success: Returns paginated search results with filters applied
     * Failure: Throws error when search term is missing or empty
     */
    describe('searchFoods', () => {
        it('should return search results with pagination', async () => {
            // Mock search results
            const mockFoods = [
                { food_id: 1, name: 'Apple', category_name: 'Fruits' }
            ];
            foodRepository.countSearchResults.mockResolvedValue(1);
            foodRepository.search.mockResolvedValue(mockFoods);

            // Call the function with search term and pagination
            const result = await foodService.searchFoods('apple', null, null, null, 1, 20);

            // Check that the result contains foods and pagination info
            expect(result).toEqual({
                foods: mockFoods,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 1,
                    totalPages: 1
                }
            });

            // Verify repository calls
            expect(foodRepository.countSearchResults).toHaveBeenCalledWith('apple', null, null, null);
            expect(foodRepository.search).toHaveBeenCalledWith('apple', null, null, null, 20, 0);
        });

        it('should calculate correct offset for pagination', async () => {
            // Mock repository responses
            foodRepository.countSearchResults.mockResolvedValue(50);
            foodRepository.search.mockResolvedValue([]);

            // Call with page 3, 10 items per page (offset should be 20)
            await foodService.searchFoods('apple', null, null, null, 3, 10);

            // Verify correct offset calculation: (page - 1) * limit = (3 - 1) * 10 = 20
            expect(foodRepository.search).toHaveBeenCalledWith('apple', null, null, null, 10, 20);
        });

        it('should calculate correct totalPages', async () => {
            // Mock 45 total results
            foodRepository.countSearchResults.mockResolvedValue(45);
            foodRepository.search.mockResolvedValue([]);

            // Call with 10 items per page
            const result = await foodService.searchFoods('apple', null, null, null, 1, 10);

            // 45 / 10 = 4.5, rounded up = 5 pages
            expect(result.pagination.totalPages).toBe(5);
        });

        it('should use default pagination values', async () => {
            // Mock repository responses
            foodRepository.countSearchResults.mockResolvedValue(1);
            foodRepository.search.mockResolvedValue([]);

            // Call without pagination values
            const result = await foodService.searchFoods('apple', null, null, null, null, null);

            // Check defaults are applied (page 1, limit 20)
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(20);
        });

        it('should throw error when search term is missing', async () => {
            // Call without search term - should throw validation error
            await expect(
                foodService.searchFoods(null, null, null, null, 1, 20)
            ).rejects.toThrow('Search term is required');
        });

        it('should throw error when search term is empty', async () => {
            // Call with whitespace-only search term - should throw validation error
            await expect(
                foodService.searchFoods('   ', null, null, null, 1, 20)
            ).rejects.toThrow('Search term is required');
        });

        it('should pass filters to repository', async () => {
            // Mock repository responses
            foodRepository.countSearchResults.mockResolvedValue(0);
            foodRepository.search.mockResolvedValue([]);

            // Call with category and calorie filters
            await foodService.searchFoods('apple', 5, 50, 200, 1, 20);

            // Verify filters are passed to repository
            expect(foodRepository.countSearchResults).toHaveBeenCalledWith('apple', 5, 50, 200);
            expect(foodRepository.search).toHaveBeenCalledWith('apple', 5, 50, 200, 20, 0);
        });
    });

    /**
     * getFoodById tests
     * Purpose: Test the getFoodById function of the foodService
     * Success: Returns food with nested nutrients structure
     * Failure: Throws error when foodId missing or food not found
     */
    describe('getFoodById', () => {
        it('should return food with nested nutrients', async () => {
            // Mock flat rows from database (one row per nutrient)
            const mockRows = [
                { food_id: 1, food_name: 'Apple', category_name: 'Fruits', nutrient_id: 1008, nutrient_name: 'Energy', unit_name: 'kcal', amount_per_100g: 52 },
                { food_id: 1, food_name: 'Apple', category_name: 'Fruits', nutrient_id: 1003, nutrient_name: 'Protein', unit_name: 'g', amount_per_100g: 0.26 }
            ];
            foodRepository.findByIdWithNutrients.mockResolvedValue(mockRows);

            // Call the function and check the result
            const result = await foodService.getFoodById(1);

            // Check that rows are transformed into nested structure
            expect(result).toEqual({
                food_id: 1,
                name: 'Apple',
                category: 'Fruits',
                nutrients: [
                    { nutrient_id: 1008, name: 'Energy', unit: 'kcal', amount_per_100g: 52 },
                    { nutrient_id: 1003, name: 'Protein', unit: 'g', amount_per_100g: 0.26 }
                ]
            });

            // Verify repository was called with correct ID
            expect(foodRepository.findByIdWithNutrients).toHaveBeenCalledWith(1);
        });

        it('should throw error when foodId is missing', async () => {
            // Call without foodId - should throw validation error
            await expect(
                foodService.getFoodById(null)
            ).rejects.toThrow('Food ID is required');
        });

        it('should throw error when food not found', async () => {
            // Mock empty result (no rows returned)
            foodRepository.findByIdWithNutrients.mockResolvedValue([]);

            // Call with non-existent ID - should throw error
            await expect(
                foodService.getFoodById(999)
            ).rejects.toThrow('Food not found');
        });
    });
});
