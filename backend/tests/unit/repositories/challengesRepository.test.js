const challengesRepository = require('../../../src/repositories/challengesRepository');
const base = require('../../../src/repositories/baseRepository');

// Mock the base repository
jest.mock('../../../src/repositories/baseRepository');

/**
 * Challenges Repository Unit Tests
 * Tests all challenges database operations
 */
describe('challengesRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * findRandom tests
     * Purpose: Test the findRandom function of the challengesRepository
     * Success: Returns a random challenge, with optional category filter and exclusions
     * Failure: Returns null when no challenges are available
     */
    describe('findRandom', () => {
        it('should return random challenge without filters', async () => {
            // Mock a challenge object
            const mockChallenge = {
                challenge_id: 1,
                title: 'Vitamin C Quiz',
                description: 'Which fruit has the most Vitamin C?',
                category: 'Vitamins'
            };
            base.findOne.mockResolvedValue(mockChallenge);

            // Call the function without filters
            const result = await challengesRepository.findRandom(null, null);

            // Check that the result matches the mock challenge
            expect(result).toEqual(mockChallenge);

            // Check that the query uses ORDER BY RAND() for randomness
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('ORDER BY RAND()'),
                []
            );
        });

        it('should filter by category', async () => {
            // Mock a challenge from specific category
            const mockChallenge = { challenge_id: 2, title: 'Mineral Quiz', category: 'Minerals' };
            base.findOne.mockResolvedValue(mockChallenge);

            // Call the function with category filter
            const result = await challengesRepository.findRandom('Minerals', null);

            // Check that the result matches the mock challenge
            expect(result).toEqual(mockChallenge);

            // Check that the query includes category filter
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('category = ?'),
                ['Minerals']
            );
        });

        it('should exclude specified IDs', async () => {
            // Mock a challenge not in the excluded list
            const mockChallenge = { challenge_id: 5, title: 'New Quiz' };
            base.findOne.mockResolvedValue(mockChallenge);

            // Call the function with exclude IDs
            const result = await challengesRepository.findRandom(null, [1, 2, 3]);

            // Check that the result matches the mock challenge
            expect(result).toEqual(mockChallenge);

            // Check that the query excludes specified IDs
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('challenge_id NOT IN'),
                [1, 2, 3]
            );
        });

        it('should combine category and exclude filters', async () => {
            // Mock a challenge matching both filters
            const mockChallenge = { challenge_id: 5, title: 'New Quiz', category: 'Vitamins' };
            base.findOne.mockResolvedValue(mockChallenge);

            // Call the function with both category and exclude filters
            const result = await challengesRepository.findRandom('Vitamins', [1, 2]);

            // Check that the result matches the mock challenge
            expect(result).toEqual(mockChallenge);

            // Check that the query includes both conditions
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('category = ?'),
                expect.arrayContaining(['Vitamins', 1, 2])
            );
        });

        it('should return null when no challenges available', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await challengesRepository.findRandom(null, null);

            // Check that the result is null
            expect(result).toBeNull();
        });
    });

    /**
     * findById tests
     * Purpose: Test the findById function of the challengesRepository
     * Success: Returns a challenge object when the ID exists
     * Failure: Returns null when the ID does not exist
     */
    describe('findById', () => {
        it('should return challenge by ID', async () => {
            // Mock a challenge object
            const mockChallenge = {
                challenge_id: 1,
                title: 'Vitamin C Quiz',
                description: 'Which fruit has the most Vitamin C?',
                category: 'Vitamins'
            };
            base.findOne.mockResolvedValue(mockChallenge);

            // Call the function and check the result
            const result = await challengesRepository.findById(1);

            // Check that the result matches the mock challenge
            expect(result).toEqual(mockChallenge);

            // Check that the base repository was called with correct arguments
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('challenge_id = ?'),
                [1]
            );
        });

        it('should return null when challenge not found', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await challengesRepository.findById(999);

            // Check that the result is null
            expect(result).toBeNull();
        });
    });

    /**
     * findOptionsByChallengeId tests
     * Purpose: Test the findOptionsByChallengeId function of the challengesRepository
     * Success: Returns an array of options for the given challenge
     * Failure: Returns empty array when challenge has no options
     */
    describe('findOptionsByChallengeId', () => {
        it('should return options for challenge', async () => {
            // Mock an array of option objects
            const mockOptions = [
                { option_id: 1, option_text: 'Orange' },
                { option_id: 2, option_text: 'Apple' },
                { option_id: 3, option_text: 'Banana' }
            ];
            base.findAll.mockResolvedValue(mockOptions);

            // Call the function and check the result
            const result = await challengesRepository.findOptionsByChallengeId(1);

            // Check that the result matches the mock options
            expect(result).toEqual(mockOptions);

            // Check that the base repository was called with correct arguments
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('challenge_id = ?'),
                [1]
            );
        });
    });

    /**
     * findAllCategories tests
     * Purpose: Test the findAllCategories function of the challengesRepository
     * Success: Returns an array of distinct challenge categories
     * Failure: Returns empty array when no categories exist
     */
    describe('findAllCategories', () => {
        it('should return all categories', async () => {
            // Mock an array of category objects
            const mockCategories = [
                { category: 'Minerals' },
                { category: 'Vitamins' }
            ];
            base.findAll.mockResolvedValue(mockCategories);

            // Call the function and check the result
            const result = await challengesRepository.findAllCategories();

            // Check that the result matches the mock categories
            expect(result).toEqual(mockCategories);

            // Check that the query uses DISTINCT for unique categories
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('DISTINCT category')
            );
        });
    });

    /**
     * count tests
     * Purpose: Test the count function of the challengesRepository
     * Success: Returns total count of challenges, optionally filtered by category
     * Failure: N/A (returns 0 when no challenges)
     */
    describe('count', () => {
        it('should return total count without filter', async () => {
            // Mock the count result
            base.findOne.mockResolvedValue({ total: 50 });

            // Call the function without filter
            const result = await challengesRepository.count(null);

            // Check that the result matches the expected count
            expect(result).toBe(50);

            // Check that the query counts all challenges
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('COUNT(*)'),
                []
            );
        });

        it('should return count filtered by category', async () => {
            // Mock the count result
            base.findOne.mockResolvedValue({ total: 15 });

            // Call the function with category filter
            const result = await challengesRepository.count('Vitamins');

            // Check that the result matches the expected count
            expect(result).toBe(15);

            // Check that the query includes category filter
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('category = ?'),
                ['Vitamins']
            );
        });
    });

    /**
     * findCorrectAnswer tests
     * Purpose: Test the findCorrectAnswer function of the challengesRepository
     * Success: Returns the correct answer ID and text for a challenge
     * Failure: Returns null when challenge not found
     */
    describe('findCorrectAnswer', () => {
        it('should return correct answer for challenge', async () => {
            // Mock the correct answer object
            const mockAnswer = {
                correct_answer_id: 2,
                correct_answer_text: 'Orange'
            };
            base.findOne.mockResolvedValue(mockAnswer);

            // Call the function and check the result
            const result = await challengesRepository.findCorrectAnswer(1);

            // Check that the result matches the mock answer
            expect(result).toEqual(mockAnswer);

            // Check that the query retrieves correct answer info
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('correct_answer_id'),
                [1]
            );
        });

        it('should return null when challenge not found', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await challengesRepository.findCorrectAnswer(999);

            // Check that the result is null
            expect(result).toBeNull();
        });
    });

    /**
     * findUserStats tests
     * Purpose: Test the findUserStats function of the challengesRepository
     * Success: Returns user's challenge score, streak, and best streak
     * Failure: Returns null when user has no stats
     */
    describe('findUserStats', () => {
        it('should return user challenge stats', async () => {
            // Mock user stats object
            const mockStats = {
                challenge_score: 10,
                challenge_streak: 3,
                best_streak: 5
            };
            base.findOne.mockResolvedValue(mockStats);

            // Call the function and check the result
            const result = await challengesRepository.findUserStats(1);

            // Check that the result matches the mock stats
            expect(result).toEqual(mockStats);

            // Check that the base repository was called with correct arguments
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('user_id = ?'),
                [1]
            );
        });
    });

    /**
     * updateUserStats tests
     * Purpose: Test the updateUserStats function of the challengesRepository
     * Success: Returns affected rows count (1 when updated)
     * Failure: Returns 0 when user not found
     */
    describe('updateUserStats', () => {
        it('should update user stats and return affected rows', async () => {
            // Mock the affected rows count
            base.modify.mockResolvedValue(1);

            // Call the function with new stats
            const result = await challengesRepository.updateUserStats(1, 15, 5, 10);

            // Check that the result matches the expected affected rows
            expect(result).toBe(1);

            // Check that the base repository was called with correct arguments
            expect(base.modify).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE User_Profiles'),
                [15, 5, 10, 1]
            );
        });
    });
});
