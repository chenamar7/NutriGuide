const factsRepository = require('../../../src/repositories/factsRepository');
const base = require('../../../src/repositories/baseRepository');

// Mock the base repository
jest.mock('../../../src/repositories/baseRepository');

/**
 * Facts Repository Unit Tests
 * Tests all facts-related database operations
 */
describe('factsRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * findRandom tests
     * Purpose: Test the findRandom function of the factsRepository
     * Success: Returns a random fact object, optionally filtered by category
     * Failure: Returns null when no facts exist
     */
    describe('findRandom', () => {
        it('should return random fact without category filter', async () => {
            // Mock a fact object
            const mockFact = {
                fact_id: 1,
                content: 'Vitamin C boosts immunity',
                category: 'Vitamins'
            };
            base.findOne.mockResolvedValue(mockFact);

            // Call the function and check the result
            const result = await factsRepository.findRandom();

            // Check that the result matches the mock fact object
            expect(result).toEqual(mockFact);

            // Check that the query uses ORDER BY RAND() for randomness
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('ORDER BY RAND()'),
                []
            );
        });

        it('should return random fact with category filter', async () => {
            // Mock a fact object from specific category
            const mockFact = {
                fact_id: 5,
                content: 'Iron helps blood oxygenation',
                category: 'Minerals'
            };
            base.findOne.mockResolvedValue(mockFact);

            // Call the function with category filter
            const result = await factsRepository.findRandom('Minerals');

            // Check that the result matches the mock fact object
            expect(result).toEqual(mockFact);

            // Check that the query includes category filter
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('WHERE category = ?'),
                ['Minerals']
            );
        });

        it('should return null when no facts exist', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await factsRepository.findRandom();

            // Check that the result is null
            expect(result).toBeNull();
        });
    });

    /**
     * findAll tests
     * Purpose: Test the findAll function of the factsRepository
     * Success: Returns an array of facts, optionally filtered by category
     * Failure: Returns empty array when no facts exist
     */
    describe('findAll', () => {
        it('should return all facts without category filter', async () => {
            // Mock an array of fact objects
            const mockFacts = [
                { fact_id: 1, content: 'Fact 1', category: 'Vitamins' },
                { fact_id: 2, content: 'Fact 2', category: 'Minerals' }
            ];
            base.findAll.mockResolvedValue(mockFacts);

            // Call the function and check the result
            const result = await factsRepository.findAll();

            // Check that the result matches the mock facts array
            expect(result).toEqual(mockFacts);

            // Check that the base repository was called with the correct arguments
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('FROM Daily_Facts'),
                []
            );
        });

        it('should return facts filtered by category', async () => {
            // Mock an array of fact objects for specific category
            const mockFacts = [
                { fact_id: 1, content: 'Fact 1', category: 'Vitamins' },
                { fact_id: 3, content: 'Fact 3', category: 'Vitamins' }
            ];
            base.findAll.mockResolvedValue(mockFacts);

            // Call the function with category filter
            const result = await factsRepository.findAll('Vitamins');

            // Check that the result matches the mock facts array
            expect(result).toEqual(mockFacts);

            // Check that the query includes category filter
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('WHERE category = ?'),
                ['Vitamins']
            );
        });

        it('should return empty array when no facts exist', async () => {
            // Mock the base repository to return empty array
            base.findAll.mockResolvedValue([]);

            // Call the function and check the result
            const result = await factsRepository.findAll();

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * findAllCategories tests
     * Purpose: Test the findAllCategories function of the factsRepository
     * Success: Returns an array of categories with counts
     * Failure: Returns empty array when no categories exist
     */
    describe('findAllCategories', () => {
        it('should return all categories with count', async () => {
            // Mock an array of category objects with counts
            const mockCategories = [
                { category: 'Minerals', count: 10 },
                { category: 'Vitamins', count: 15 }
            ];
            base.findAll.mockResolvedValue(mockCategories);

            // Call the function and check the result
            const result = await factsRepository.findAllCategories();

            // Check that the result matches the mock categories array
            expect(result).toEqual(mockCategories);

            // Check that the query uses GROUP BY for counting
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('GROUP BY category')
            );
        });

        it('should return empty array when no categories exist', async () => {
            // Mock the base repository to return empty array
            base.findAll.mockResolvedValue([]);

            // Call the function and check the result
            const result = await factsRepository.findAllCategories();

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * findById tests
     * Purpose: Test the findById function of the factsRepository
     * Success: Returns a fact object when the ID exists
     * Failure: Returns null when the ID does not exist
     */
    describe('findById', () => {
        it('should return fact when ID exists', async () => {
            // Mock a fact object
            const mockFact = {
                fact_id: 1,
                content: 'Vitamin C boosts immunity',
                category: 'Vitamins'
            };
            base.findOne.mockResolvedValue(mockFact);

            // Call the function and check the result
            const result = await factsRepository.findById(1);

            // Check that the result matches the mock fact object
            expect(result).toEqual(mockFact);

            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('fact_id = ?'),
                [1]
            );
        });

        it('should return null when ID does not exist', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await factsRepository.findById(999);

            // Check that the result is null
            expect(result).toBeNull();
        });
    });
});
