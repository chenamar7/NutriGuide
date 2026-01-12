const foodRepository = require('../../../src/repositories/foodRepository');
const base = require('../../../src/repositories/baseRepository');

// Mock the base repository
jest.mock('../../../src/repositories/baseRepository');

/**
 * Food Repository Unit Tests
 * Tests all food-related database operations
 */
describe('foodRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * findAllCategories tests
     * Purpose: Test the findAllCategories function of the foodRepository
     * Success: Returns an array of food category objects
     * Failure: Returns empty array when no categories exist
     */
    describe('findAllCategories', () => {
        it('should return all food categories', async () => {
            // Mock an array of category objects
            const mockCategories = [
                { category_id: 1, category_name: 'Dairy' },
                { category_id: 2, category_name: 'Fruits' },
                { category_id: 3, category_name: 'Vegetables' }
            ];
            base.findAll.mockResolvedValue(mockCategories);

            // Call the function and check the result
            const result = await foodRepository.findAllCategories();

            // Check that the result matches the mock categories array
            expect(result).toEqual(mockCategories);

            // Check that the base repository was called with the correct arguments
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('Food_Categories')
            );
        });

        it('should return empty array when no categories exist', async () => {
            // Mock the base repository to return empty array
            base.findAll.mockResolvedValue([]);

            // Call the function and check the result
            const result = await foodRepository.findAllCategories();

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * countSearchResults tests
     * Purpose: Test the countSearchResults function of the foodRepository
     * Success: Returns the total count of foods matching search criteria
     * Failure: N/A (returns 0 when no matches)
     */
    describe('countSearchResults', () => {
        it('should return count for basic search', async () => {
            // Mock the base repository to return count result
            base.findOne.mockResolvedValue({ total: 25 });

            // Call the function with basic search term only
            const result = await foodRepository.countSearchResults('apple', null, null, null);

            // Check that the result matches the expected count
            expect(result).toBe(25);

            // Check that the query uses LIKE pattern for search
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('COUNT(*)'),
                ['%apple%']
            );
        });

        it('should include category filter in query', async () => {
            // Mock the base repository to return count result
            base.findOne.mockResolvedValue({ total: 10 });

            // Call the function with category filter
            const result = await foodRepository.countSearchResults('apple', 5, null, null);

            // Check that the result matches the expected count
            expect(result).toBe(10);

            // Check that the query includes category filter
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('food_category_id = ?'),
                ['%apple%', 5]
            );
        });

        it('should include calorie filters in query', async () => {
            // Mock the base repository to return count result
            base.findOne.mockResolvedValue({ total: 5 });

            // Call the function with min and max calorie filters
            const result = await foodRepository.countSearchResults('apple', null, 50, 200);

            // Check that the result matches the expected count
            expect(result).toBe(5);

            // Check that the query includes calorie range filters
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('amount_per_100g >= ?'),
                expect.arrayContaining(['%apple%', 50, 200])
            );
        });
    });

    /**
     * search tests
     * Purpose: Test the search function of the foodRepository
     * Success: Returns paginated array of foods matching search criteria
     * Failure: Returns empty array when no matches
     */
    describe('search', () => {
        it('should return paginated search results', async () => {
            // Mock an array of food objects
            const mockFoods = [
                { food_id: 1, name: 'Apple', category_name: 'Fruits' },
                { food_id: 2, name: 'Apple Juice', category_name: 'Beverages' }
            ];
            base.findAll.mockResolvedValue(mockFoods);

            // Call the function with pagination parameters
            const result = await foodRepository.search('apple', null, null, null, 20, 0);

            // Check that the result matches the mock foods array
            expect(result).toEqual(mockFoods);

            // Check that the query includes LIMIT and OFFSET for pagination
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('LIMIT ? OFFSET ?'),
                expect.arrayContaining(['%apple%', 'apple%', 20, 0])
            );
        });

        it('should include all filters in query', async () => {
            // Mock an array of food objects
            const mockFoods = [{ food_id: 1, name: 'Apple', category_name: 'Fruits' }];
            base.findAll.mockResolvedValue(mockFoods);

            // Call the function with all filters (category, min_cal, max_cal)
            const result = await foodRepository.search('apple', 2, 50, 100, 10, 20);

            // Check that the result matches the mock foods array
            expect(result).toEqual(mockFoods);

            // Check that the query includes all filters
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('food_category_id = ?'),
                expect.arrayContaining(['%apple%', 2, 50, 100])
            );
        });

        it('should return empty array when no matches', async () => {
            // Mock the base repository to return empty array
            base.findAll.mockResolvedValue([]);

            // Call the function with a search term that won't match
            const result = await foodRepository.search('zzzzzzz', null, null, null, 20, 0);

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * findByIdWithNutrients tests
     * Purpose: Test the findByIdWithNutrients function of the foodRepository
     * Success: Returns array of rows with food info and all nutrients
     * Failure: Returns empty array when food not found
     */
    describe('findByIdWithNutrients', () => {
        it('should return food with all nutrients', async () => {
            // Mock array of rows (one per nutrient, all with same food info)
            const mockRows = [
                { food_id: 1, food_name: 'Apple', category_name: 'Fruits', nutrient_id: 1008, nutrient_name: 'Energy', unit_name: 'kcal', amount_per_100g: 52 },
                { food_id: 1, food_name: 'Apple', category_name: 'Fruits', nutrient_id: 1003, nutrient_name: 'Protein', unit_name: 'g', amount_per_100g: 0.26 }
            ];
            base.findAll.mockResolvedValue(mockRows);

            // Call the function and check the result
            const result = await foodRepository.findByIdWithNutrients(1);

            // Check that the result matches the mock rows
            expect(result).toEqual(mockRows);

            // Check that the base repository was called with the correct arguments
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('f.food_id = ?'),
                [1]
            );
        });

        it('should return empty array when food not found', async () => {
            // Mock the base repository to return empty array
            base.findAll.mockResolvedValue([]);

            // Call the function and check the result
            const result = await foodRepository.findByIdWithNutrients(999);

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * existsById tests
     * Purpose: Test the existsById function of the foodRepository
     * Success: Returns true when the food exists
     * Failure: Returns false when the food does not exist
     */
    describe('existsById', () => {
        it('should return true when food exists', async () => {
            // Mock the base repository to return a food object
            base.findOne.mockResolvedValue({ food_id: 1 });

            // Call the function and check the result
            const result = await foodRepository.existsById(1);

            // Check that the result is true
            expect(result).toBe(true);

            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('food_id = ?'),
                [1]
            );
        });

        it('should return false when food does not exist', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await foodRepository.existsById(999);

            // Check that the result is false
            expect(result).toBe(false);
        });
    });
});
