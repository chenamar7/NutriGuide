const challengesService = require('../../../src/services/challengesService');
const challengesRepository = require('../../../src/repositories/challengesRepository');

// Mock dependencies
jest.mock('../../../src/repositories/challengesRepository');

/**
 * Challenges Service Unit Tests
 * Tests challenges business logic
 */
describe('challengesService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * getRandomChallenge tests
     * Purpose: Test the getRandomChallenge function of the challengesService
     * Success: Returns random challenge with options
     * Failure: Returns error message
     */
    describe('getRandomChallenge', () => {
        it('should return random challenge with options', async () => {
            // Mock repository to return random challenge
            const mockChallenge = {
                challenge_id: 1,
                title: 'Vitamin C Quiz',
                description: 'Which fruit has the most Vitamin C?',
                category: 'Vitamins'
            };
            // Mock repository to return options
            const mockOptions = [
                { option_id: 1, option_text: 'Orange' },
                { option_id: 2, option_text: 'Apple' }
            ];
            challengesRepository.findRandom.mockResolvedValue(mockChallenge);
            challengesRepository.findOptionsByChallengeId.mockResolvedValue(mockOptions);

            // Call the function and check the result
            const result = await challengesService.getRandomChallenge(null, null);

            // Check that the result matches the mock challenge and options
            expect(result).toEqual({
                challenge_id: 1,
                title: 'Vitamin C Quiz',
                question: 'Which fruit has the most Vitamin C?',
                category: 'Vitamins',
                options: mockOptions
            });
        });

        it('should filter by category', async () => {
            // Mock repository to return random challenge
            const mockChallenge = { challenge_id: 2, title: 'Quiz', description: 'Question?', category: 'Minerals' };
            challengesRepository.findRandom.mockResolvedValue(mockChallenge);
            challengesRepository.findOptionsByChallengeId.mockResolvedValue([]);

            // Call the function and check the result
            await challengesService.getRandomChallenge('Minerals', null);

            // Verify repository was called
            expect(challengesRepository.findRandom).toHaveBeenCalledWith('Minerals', []);
        });

        it('should parse and exclude IDs from string', async () => {
            // Mock repository to return random challenge
            const mockChallenge = { challenge_id: 5, title: 'Quiz', description: 'Q?', category: 'Vitamins' };
            challengesRepository.findRandom.mockResolvedValue(mockChallenge);
            challengesRepository.findOptionsByChallengeId.mockResolvedValue([]);

            // Call the function and check the result
            await challengesService.getRandomChallenge(null, '1,2,3');

            // Verify repository was called
            expect(challengesRepository.findRandom).toHaveBeenCalledWith(null, [1, 2, 3]);
        });

        it('should throw error when no challenges available', async () => {
            // Mock repository to return null
            challengesRepository.findRandom.mockResolvedValue(null);

            // Call the function and check the result
            await expect(
                challengesService.getRandomChallenge(null, null)
            ).rejects.toThrow('No more challenges available');
        });
    });

    /**
     * getChallengeById tests
     * Purpose: Test the getChallengeById function of the challengesService
     * Success: Returns challenge with options
     * Failure: Returns error message
     */
    describe('getChallengeById', () => {
        it('should return challenge with options', async () => {
            // Mock repository to return challenge
            const mockChallenge = {
                challenge_id: 1,
                title: 'Vitamin C Quiz',
                description: 'Which fruit has the most Vitamin C?',
                category: 'Vitamins'
            };
            const mockOptions = [{ option_id: 1, option_text: 'Orange' }];
            challengesRepository.findById.mockResolvedValue(mockChallenge);
            challengesRepository.findOptionsByChallengeId.mockResolvedValue(mockOptions);

            // Call the function and check the result
            const result = await challengesService.getChallengeById(1);

            // Check that the result matches the mock challenge and options
            expect(result).toEqual({
                challenge_id: 1,
                title: 'Vitamin C Quiz',
                question: 'Which fruit has the most Vitamin C?',
                category: 'Vitamins',
                options: mockOptions
            });
        });

        it('should throw error when challengeId is missing', async () => {
            // Call the function and check the result - should throw error  
            await expect(
                challengesService.getChallengeById(null)
            ).rejects.toThrow('Challenge ID is required');
        });

        it('should throw error when challenge not found', async () => {
            // Mock repository to return null
            challengesRepository.findById.mockResolvedValue(null);

            // Call the function and check the result - should throw error
            await expect(
                challengesService.getChallengeById(999)
            ).rejects.toThrow('Challenge not found');
        });
    });

    /**
     * checkAnswer tests
     * Purpose: Test the checkAnswer function of the challengesService
     * Success: Returns correct answer result
     * Failure: Returns error message
     */
    describe('checkAnswer', () => {
        it('should return correct answer result', async () => {
            // Mock repository to return correct answer
            const mockAnswer = { correct_answer_id: 2, correct_answer_text: 'Orange' };
            challengesRepository.findCorrectAnswer.mockResolvedValue(mockAnswer);

            // Call the function and check the result
            const result = await challengesService.checkAnswer(1, 2, null);

            // Check that the result matches the mock answer
            expect(result).toEqual({
                correct: true,
                correct_answer_id: 2,
                correct_answer_text: 'Orange'
            });
        });

        it('should return incorrect answer result', async () => {
            // Mock repository to return correct answer
            const mockAnswer = { correct_answer_id: 2, correct_answer_text: 'Orange' };
            challengesRepository.findCorrectAnswer.mockResolvedValue(mockAnswer);

            // Call the function and check the result
            const result = await challengesService.checkAnswer(1, 1, null);

            // Check that the result matches the mock answer
            expect(result).toEqual({
                correct: false,
                correct_answer_id: 2,
                correct_answer_text: 'Orange'
            });
        });

        it('should update user stats on correct answer', async () => {
            // Mock repository to return correct answer
            const mockAnswer = { correct_answer_id: 2, correct_answer_text: 'Orange' };
            const mockStats = { challenge_score: 5, challenge_streak: 2, best_streak: 4 };
            challengesRepository.findCorrectAnswer.mockResolvedValue(mockAnswer);
            challengesRepository.findUserStats.mockResolvedValue(mockStats);
            challengesRepository.updateUserStats.mockResolvedValue(1);

            // Call the function and check the result
            await challengesService.checkAnswer(1, 2, 1);

            // Check that the result matches the mock answer
            expect(challengesRepository.updateUserStats).toHaveBeenCalledWith(1, 6, 3, 4);
        });

        it('should update best streak when current streak exceeds it', async () => {
            // Mock repository to return correct answer
            const mockAnswer = { correct_answer_id: 2, correct_answer_text: 'Orange' };
            const mockStats = { challenge_score: 5, challenge_streak: 4, best_streak: 4 };
            challengesRepository.findCorrectAnswer.mockResolvedValue(mockAnswer);
            challengesRepository.findUserStats.mockResolvedValue(mockStats);
            challengesRepository.updateUserStats.mockResolvedValue(1);

            // Call the function and check the result
            await challengesService.checkAnswer(1, 2, 1);

            // Check that the result matches the mock answer
            expect(challengesRepository.updateUserStats).toHaveBeenCalledWith(1, 6, 5, 5);
        });

        it('should reset streak on wrong answer', async () => {
            // Mock repository to return correct answer
            const mockAnswer = { correct_answer_id: 2, correct_answer_text: 'Orange' };
            const mockStats = { challenge_score: 5, challenge_streak: 3, best_streak: 4 };
            challengesRepository.findCorrectAnswer.mockResolvedValue(mockAnswer);
            challengesRepository.findUserStats.mockResolvedValue(mockStats);
            challengesRepository.updateUserStats.mockResolvedValue(1);

            // Call the function and check the result
            await challengesService.checkAnswer(1, 1, 1);

            // Check that the result matches the mock answer
            expect(challengesRepository.updateUserStats).toHaveBeenCalledWith(1, 5, 0, 4);
        });

        it('should throw error when challengeId is missing', async () => {
            await expect(
                challengesService.checkAnswer(null, 2, null)
            ).rejects.toThrow('Challenge ID is required');
        });

        it('should throw error when optionId is missing', async () => {
            await expect(
                challengesService.checkAnswer(1, null, null)
            ).rejects.toThrow('Option ID is required');
        });

        it('should throw error when challenge not found', async () => {
            // Mock repository to return null
            challengesRepository.findCorrectAnswer.mockResolvedValue(null);

            // Call the function and check the result - should throw error
            await expect(
                challengesService.checkAnswer(999, 1, null)
            ).rejects.toThrow('Challenge not found');
        });
    });

    /**
     * getStats tests
     * Purpose: Test the getStats function of the challengesService
     * Success: Returns user stats
     * Failure: Returns error message
     */
    describe('getStats', () => {
        it('should return user stats', async () => {
            // Mock repository to return user stats
            const mockStats = { challenge_score: 10, challenge_streak: 3, best_streak: 5 };
            challengesRepository.findUserStats.mockResolvedValue(mockStats);
            challengesRepository.count.mockResolvedValue(50);

            // Call the function and check the result
            const result = await challengesService.getStats(1);

            // Check that the result matches the mock stats
            expect(result).toEqual({
                score: 10,
                current_streak: 3,
                best_streak: 5,
                total_challenges: 50
            });
        });

        it('should return zero stats for new user', async () => {
            // Mock repository to return null
            challengesRepository.findUserStats.mockResolvedValue(null);

            // Call the function and check the result
            const result = await challengesService.getStats(1);

            // Check that the result matches the mock stats
            expect(result).toEqual({
                score: 0,
                current_streak: 0,
                best_streak: 0
            });
        });

        it('should handle null values in stats', async () => {
            // Mock repository to return null values
            const mockStats = { challenge_score: null, challenge_streak: null, best_streak: null };
            challengesRepository.findUserStats.mockResolvedValue(mockStats);
            challengesRepository.count.mockResolvedValue(50);

            // Call the function and check the result
            const result = await challengesService.getStats(1);

            // Check that the result matches the mock stats
            expect(result).toEqual({
                score: 0,
                current_streak: 0,
                best_streak: 0,
                total_challenges: 50
            });
        });

        it('should throw error when userId is missing', async () => {
            // Call the function and check the result - should throw error
            await expect(
                challengesService.getStats(null)
            ).rejects.toThrow('User ID is required');
        });
    });

    /**
     * getChallengeCount tests
     * Purpose: Test the getChallengeCount function of the challengesService
     * Success: Returns total challenge count
     * Failure: Returns error message
     */
    describe('getChallengeCount', () => {
        it('should return total challenge count', async () => {
            // Mock repository to return total challenge count
            challengesRepository.count.mockResolvedValue(50);

            // Call the function and check the result
            const result = await challengesService.getChallengeCount(null);

            // Check that the result matches the mock count
            expect(result).toBe(50);
            expect(challengesRepository.count).toHaveBeenCalledWith(null);
        });

        it('should return count filtered by category', async () => {
            // Mock repository to return count filtered by category
            challengesRepository.count.mockResolvedValue(15);

            // Call the function and check the result
            const result = await challengesService.getChallengeCount('Vitamins');

            // Check that the result matches the mock count
            expect(result).toBe(15);
            expect(challengesRepository.count).toHaveBeenCalledWith('Vitamins');
        });
    });

    /**
     * getCategories tests
     * Purpose: Test the getCategories function of the challengesService
     * Success: Returns all categories
     * Failure: Returns error message
     */
    describe('getCategories', () => {
        it('should return all categories', async () => {
            // Mock repository to return all categories
            const mockCategories = [{ category: 'Minerals' }, { category: 'Vitamins' }];
            challengesRepository.findAllCategories.mockResolvedValue(mockCategories);

            // Call the function and check the result
            const result = await challengesService.getCategories();

            // Check that the result matches the mock categories
            expect(result).toEqual(mockCategories);
            expect(challengesRepository.findAllCategories).toHaveBeenCalled();
        });
    });
});
