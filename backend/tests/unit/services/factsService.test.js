const factsService = require('../../../src/services/factsService');
const factsRepository = require('../../../src/repositories/factsRepository');

// Mock dependencies
jest.mock('../../../src/repositories/factsRepository');

/**
 * Facts Service Unit Tests
 * Tests facts business logic
 */
describe('factsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * getRandomFact tests
     * Purpose: Test the getRandomFact function of the factsService
     * Success: Returns a random fact, optionally filtered by category
     * Failure: Throws error when no facts found
     */
    describe('getRandomFact', () => {
        it('should return random fact', async () => {
            // Mock a random fact from database
            const mockFact = {
                fact_id: 1,
                content: 'Vitamin C boosts immunity',
                category: 'Vitamins'
            };
            factsRepository.findRandom.mockResolvedValue(mockFact);

            // Call the function and check the result
            const result = await factsService.getRandomFact();

            // Check that the result matches the mock fact
            expect(result).toEqual(mockFact);

            // Verify repository was called without category filter
            expect(factsRepository.findRandom).toHaveBeenCalledWith(undefined);
        });

        it('should return random fact filtered by category', async () => {
            // Mock a random fact from specific category
            const mockFact = {
                fact_id: 5,
                content: 'Iron helps blood oxygenation',
                category: 'Minerals'
            };
            factsRepository.findRandom.mockResolvedValue(mockFact);

            // Call the function with category filter
            const result = await factsService.getRandomFact('Minerals');

            // Check that the result matches the mock fact
            expect(result).toEqual(mockFact);

            // Verify repository was called with category filter
            expect(factsRepository.findRandom).toHaveBeenCalledWith('Minerals');
        });

        it('should throw error when no facts found', async () => {
            // Mock repository to return null
            factsRepository.findRandom.mockResolvedValue(null);

            // Call should throw error
            await expect(
                factsService.getRandomFact()
            ).rejects.toThrow('No facts found');
        });
    });

    /**
     * getAllFacts tests
     * Purpose: Test the getAllFacts function of the factsService
     * Success: Returns all facts, optionally filtered by category
     * Failure: N/A (returns empty array when no facts)
     */
    describe('getAllFacts', () => {
        it('should return all facts', async () => {
            // Mock an array of facts
            const mockFacts = [
                { fact_id: 1, content: 'Fact 1', category: 'Vitamins' },
                { fact_id: 2, content: 'Fact 2', category: 'Minerals' }
            ];
            factsRepository.findAll.mockResolvedValue(mockFacts);

            // Call the function and check the result
            const result = await factsService.getAllFacts();

            // Check that the result matches the mock facts
            expect(result).toEqual(mockFacts);

            // Verify repository was called without filter
            expect(factsRepository.findAll).toHaveBeenCalledWith(undefined);
        });

        it('should return facts filtered by category', async () => {
            // Mock facts from specific category
            const mockFacts = [
                { fact_id: 1, content: 'Fact 1', category: 'Vitamins' }
            ];
            factsRepository.findAll.mockResolvedValue(mockFacts);

            // Call the function with category filter
            const result = await factsService.getAllFacts('Vitamins');

            // Check that the result matches the mock facts
            expect(result).toEqual(mockFacts);

            // Verify repository was called with category filter
            expect(factsRepository.findAll).toHaveBeenCalledWith('Vitamins');
        });
    });

    /**
     * getCategories tests
     * Purpose: Test the getCategories function of the factsService
     * Success: Returns all categories with fact counts
     * Failure: N/A (returns empty array when no categories)
     */
    describe('getCategories', () => {
        it('should return all categories with count', async () => {
            // Mock categories with counts
            const mockCategories = [
                { category: 'Minerals', count: 10 },
                { category: 'Vitamins', count: 15 }
            ];
            factsRepository.findAllCategories.mockResolvedValue(mockCategories);

            // Call the function and check the result
            const result = await factsService.getCategories();

            // Check that the result matches the mock categories
            expect(result).toEqual(mockCategories);

            // Verify repository was called
            expect(factsRepository.findAllCategories).toHaveBeenCalled();
        });
    });

    /**
     * getFactById tests
     * Purpose: Test the getFactById function of the factsService
     * Success: Returns fact by ID
     * Failure: Throws error when factId missing or fact not found
     */
    describe('getFactById', () => {
        it('should return fact by ID', async () => {
            // Mock a fact by ID
            const mockFact = {
                fact_id: 1,
                content: 'Vitamin C boosts immunity',
                category: 'Vitamins'
            };
            factsRepository.findById.mockResolvedValue(mockFact);

            // Call the function and check the result
            const result = await factsService.getFactById(1);

            // Check that the result matches the mock fact
            expect(result).toEqual(mockFact);

            // Verify repository was called with correct ID
            expect(factsRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should throw error when factId is missing', async () => {
            // Call without factId - should throw validation error
            await expect(
                factsService.getFactById(null)
            ).rejects.toThrow('Fact ID is required');
        });

        it('should throw error when fact not found', async () => {
            // Mock repository to return null
            factsRepository.findById.mockResolvedValue(null);

            // Call with non-existent ID - should throw error
            await expect(
                factsService.getFactById(999)
            ).rejects.toThrow('Fact not found');
        });
    });
});
