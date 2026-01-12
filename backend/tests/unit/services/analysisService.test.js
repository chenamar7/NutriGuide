const analysisService = require('../../../src/services/analysisService');
const analysisRepository = require('../../../src/repositories/analysisRepository');

// Mock dependencies
jest.mock('../../../src/repositories/analysisRepository');

/**
 * Analysis Service Unit Tests
 * Tests analysis business logic including gap analysis and recommendations
 */
describe('analysisService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * getGapAnalysis tests
     * Purpose: Test the getGapAnalysis function of the analysisService
     * Success: Returns gap analysis for specified date
     * Failure: Returns error message when user has no targets set
     */
    describe('getGapAnalysis', () => {
        it('should return gap analysis for specified date', async () => {
            // Mock gap analysis data
            const mockResults = [
                { macro_name: 'Protein', target: 150, consumed: 80, deficit: 70, percent: 53 },
                { macro_name: 'Carbs', target: 300, consumed: 250, deficit: 50, percent: 83 }
            ];
            analysisRepository.getGapAnalysis.mockResolvedValue(mockResults);

            // Call the function and check the result
            const result = await analysisService.getGapAnalysis(1, '2024-01-15');

            // Check that the result matches the mock results
            expect(result).toEqual({
                date: '2024-01-15',
                macros: mockResults
            });
            expect(analysisRepository.getGapAnalysis).toHaveBeenCalledWith(1, '2024-01-15');
        });

        it('should default to today when date not provided', async () => {
            // Mock gap analysis data
            const mockResults = [{ macro_name: 'Protein', target: 150 }];
            analysisRepository.getGapAnalysis.mockResolvedValue(mockResults);
            const today = new Date().toISOString().split('T')[0];

            // Call the function and check the result
            await analysisService.getGapAnalysis(1, null);

            // Check that the repository was called with today's date
            expect(analysisRepository.getGapAnalysis).toHaveBeenCalledWith(1, today);
        });

        it('should throw error when user has no targets set', async () => {
            // Mock repository to return empty array
            analysisRepository.getGapAnalysis.mockResolvedValue([]);

            // Call the function and check the result
            await expect(
                analysisService.getGapAnalysis(1, '2024-01-15')
            ).rejects.toThrow('Please set your macro targets first');
        });

        it('should throw error when target is null', async () => {
            // Mock repository to return array with null target
            analysisRepository.getGapAnalysis.mockResolvedValue([{ macro_name: 'Protein', target: null }]);

            // Call the function and check the result
            await expect(
                analysisService.getGapAnalysis(1, '2024-01-15')
            ).rejects.toThrow('Please set your macro targets first');
        });
    });

    /**
     * getRecommendations tests
     * Purpose: Test the getRecommendations function of the analysisService
     * Success: Returns recommendations when user has deficits
     * Failure: Returns empty array when no deficits found
     */
    describe('getRecommendations', () => {
        it('should return recommendations when user has deficits', async () => {
            // Mock gap analysis data
            const mockGapResults = [
                { macro_name: 'Protein', target: 150, consumed: 80, deficit: 70, percent: 53 },
                { macro_name: 'Fat', target: 68, consumed: 50, deficit: 18, percent: 74 },
                { macro_name: 'Carbs', target: 300, consumed: 250, deficit: 50, percent: 83 }
            ];
            // Mock food recommendations data
            const mockRecommendations = [
                { food_id: 1, name: 'Chicken Breast', efficiency_score: 95 }
            ];
            // Mock repository to return gap analysis and food recommendations
            analysisRepository.getGapAnalysis.mockResolvedValue(mockGapResults);
            analysisRepository.getFoodRecommendations.mockResolvedValue(mockRecommendations);

            // Call the function and check the result
            const result = await analysisService.getRecommendations(1);

            // Check that the result matches the mock gap results and recommendations
            expect(result.gaps).toEqual({ protein: 70, fat: 18, carbs: 50 });
            expect(result.recommendations).toEqual(mockRecommendations);
        });

        it('should return success message when all targets are met', async () => {
            // Mock gap analysis data
            const mockGapResults = [
                { macro_name: 'Protein', target: 150, consumed: 160, deficit: -10, percent: 107 },
                { macro_name: 'Fat', target: 68, consumed: 70, deficit: -2, percent: 103 },
                { macro_name: 'Carbs', target: 300, consumed: 320, deficit: -20, percent: 107 }
            ];
            // Mock repository to return gap analysis data
            analysisRepository.getGapAnalysis.mockResolvedValue(mockGapResults);

            // Call the function and check the result
            const result = await analysisService.getRecommendations(1);

            // Check that the result matches the mock gap results and recommendations
            expect(result.message).toBe("You've met all your macro targets for today!");
            expect(result.recommendations).toEqual([]);
        });
    });

    /**
     * getWeeklyTrends tests
     * Purpose: Test the getWeeklyTrends function of the analysisService
     * Success: Returns weekly trends for specified user
     * Failure: Returns empty array when no trends found
     */
    describe('getWeeklyTrends', () => {
        it('should return weekly trends', async () => {
            // Mock trends data
            const mockTrends = [
                { macro_name: 'Protein', this_week_avg: 120, last_week_avg: 100, change: 20 }
            ];
            // Mock repository to return trends data
            analysisRepository.getWeeklyTrends.mockResolvedValue(mockTrends);

            // Call the function and check the result
            const result = await analysisService.getWeeklyTrends(1);

            // Check that the result matches the mock trends data
            expect(result).toEqual({ trends: mockTrends });
            expect(analysisRepository.getWeeklyTrends).toHaveBeenCalledWith(1);
        });

        it('should return message for new user with no data', async () => {
            // Mock repository to return empty array
            analysisRepository.getWeeklyTrends.mockResolvedValue([]);

            // Call the function and check the result
            const result = await analysisService.getWeeklyTrends(1);

            // Check that the result matches the mock trends data
            expect(result.message).toBe('Not enough data yet. Keep logging to see trends!');
            expect(result.trends).toEqual([]);
        });
    });

    /**
     * getStreak tests
     * Purpose: Test the getStreak function of the analysisService
     * Success: Returns streak information for specified user
     * Failure: Returns empty object when no streak found
     */
    describe('getStreak', () => {
        it('should return streak information', async () => {
            // Mock streak data
            const mockStreak = {
                current_streak: 5,
                longest_streak: 10,
                last_logged_date: '2024-01-15',
                streak_status: 'active'
            };
            analysisRepository.getStreak.mockResolvedValue(mockStreak);

            // Call the function and check the result
            const result = await analysisService.getStreak(1);

            // Check that the result matches the mock streak data
            expect(result).toEqual(mockStreak);
            expect(analysisRepository.getStreak).toHaveBeenCalledWith(1);
        });

        it('should return zero streak for user with no logs', async () => {
            // Mock repository to return null
            analysisRepository.getStreak.mockResolvedValue(null);

            // Call the function and check the result
            const result = await analysisService.getStreak(1);

            // Check that the result matches the mock streak data
            expect(result).toEqual({
                current_streak: 0,
                longest_streak: 0,
                last_logged_date: null,
                streak_status: 'no_logs'
            });
        });

        it('should return zero streak when current_streak is null', async () => {
            // Mock repository to return null
            analysisRepository.getStreak.mockResolvedValue({ current_streak: null });

            // Call the function and check the result
            const result = await analysisService.getStreak(1);

            // Check that the result matches the mock streak data
            expect(result).toEqual({
                current_streak: 0,
                longest_streak: 0,
                last_logged_date: null,
                streak_status: 'no_logs'
            });
        });
    });

    /**
     * getEffectiveFoods tests
     * Purpose: Test the getEffectiveFoods function of the analysisService
     * Success: Returns effective foods with default nutrient
     * Failure: Returns empty array when no effective foods found
     */
    describe('getEffectiveFoods', () => {
        it('should return effective foods with default nutrient', async () => {
            // Mock effective foods data
            const mockFoods = [
                { food_name: 'Chicken Breast', total_contribution: 500 }
            ];
            analysisRepository.getEffectiveFoods.mockResolvedValue(mockFoods);

            // Call the function and check the result
            const result = await analysisService.getEffectiveFoods(1, null, 30);

            // Check that the result matches the mock effective foods data
            expect(result).toEqual({
                nutrient: 'Protein',
                period_days: 30,
                top_foods: mockFoods
            });
        });

        it('should accept valid nutrient IDs', async () => {
            // Mock repository to return empty array
            analysisRepository.getEffectiveFoods.mockResolvedValue([]);

            // Call the function and check the result
            const result = await analysisService.getEffectiveFoods(1, 1008, 30);

            // Check that the result matches the mock effective foods data
            expect(result.nutrient).toBe('Calories');
        });

        it('should throw error for invalid nutrient ID', async () => {
            await expect(
                analysisService.getEffectiveFoods(1, 9999, 30)
            ).rejects.toThrow('Invalid nutrient ID');
        });

        it('should default to 30 days when daysBack is not provided', async () => {
            // Mock repository to return empty array
            analysisRepository.getEffectiveFoods.mockResolvedValue([]);

            // Call the function and check the result
            const result = await analysisService.getEffectiveFoods(1, 1003, null);

            // Check that the result matches the mock effective foods data
            expect(result.period_days).toBe(30);
        });
    });

    /**
     * NUTRIENT_IDS constant test
     * Purpose: Test the NUTRIENT_IDS constant of the analysisService
     * Success: Returns correct nutrient ID constants
     * Failure: N/A
     */
    describe('NUTRIENT_IDS', () => {
        it('should export correct nutrient ID constants', () => {
            expect(analysisService.NUTRIENT_IDS).toEqual({
                CALORIES: 1008,
                PROTEIN: 1003,
                FAT: 1004,
                CARBS: 1005
            });
        });
    });
});
