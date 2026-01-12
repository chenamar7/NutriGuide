const analysisRepository = require('../../../src/repositories/analysisRepository');
const base = require('../../../src/repositories/baseRepository');

// Mock the base repository
jest.mock('../../../src/repositories/baseRepository');

/**
 * Analysis Repository Unit Tests
 * Tests gap analysis and recommendation database operations
 */
describe('analysisRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * getGapAnalysis tests
     * Purpose: Test the getGapAnalysis function of the analysisRepository
     * Success: Returns macro comparison data (consumed vs target)
     * Failure: Returns empty array when no data exists
     */
    describe('getGapAnalysis', () => {
        it('should return gap analysis from SQL file', async () => {
            // Mock gap analysis results
            const mockResults = [
                { macro_name: 'Protein', target: 150, consumed: 80, deficit: 70, percent: 53 },
                { macro_name: 'Carbs', target: 300, consumed: 250, deficit: 50, percent: 83 }
            ];
            base.executeFromFile.mockResolvedValue(mockResults);

            // Call the function and check the result
            const result = await analysisRepository.getGapAnalysis(1, '2024-01-15');

            // Check that the result matches the mock gap analysis
            expect(result).toEqual(mockResults);

            // Check that the query is loaded from the correct SQL file with params
            expect(base.executeFromFile).toHaveBeenCalledWith(
                'gapAnalysis',
                [1, '2024-01-15', 1, 1, 1, 1]
            );
        });

        it('should return empty array when no data', async () => {
            // Mock the base repository to return empty array
            base.executeFromFile.mockResolvedValue([]);

            // Call the function and check the result
            const result = await analysisRepository.getGapAnalysis(1, '2024-01-15');

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * getFoodRecommendations tests
     * Purpose: Test the getFoodRecommendations function of the analysisRepository
     * Success: Returns optimized food recommendations based on nutrient gaps
     * Failure: N/A (returns empty array when no recommendations)
     */
    describe('getFoodRecommendations', () => {
        it('should return food recommendations from SQL file', async () => {
            // Mock food recommendation results
            const mockRecommendations = [
                { food_id: 1, name: 'Chicken Breast', efficiency_score: 95 },
                { food_id: 2, name: 'Greek Yogurt', efficiency_score: 85 }
            ];
            base.executeFromFile.mockResolvedValue(mockRecommendations);

            // Call the function with deficit values
            const result = await analysisRepository.getFoodRecommendations(50, 20, 100, 1);

            // Check that the result matches the mock recommendations
            expect(result).toEqual(mockRecommendations);

            // Check that the query is loaded from the correct SQL file with params
            expect(base.executeFromFile).toHaveBeenCalledWith(
                'foodOptimizer',
                [50, 20, 100, 1]
            );
        });
    });

    /**
     * getWeeklyTrends tests
     * Purpose: Test the getWeeklyTrends function of the analysisRepository
     * Success: Returns week-over-week comparison of macro intake
     * Failure: Returns empty array for new user with no data
     */
    describe('getWeeklyTrends', () => {
        it('should return weekly trends from SQL file', async () => {
            // Mock weekly trends data
            const mockTrends = [
                { macro_name: 'Protein', this_week_avg: 120, last_week_avg: 100, change: 20 }
            ];
            base.executeFromFile.mockResolvedValue(mockTrends);

            // Call the function and check the result
            const result = await analysisRepository.getWeeklyTrends(1);

            // Check that the result matches the mock trends
            expect(result).toEqual(mockTrends);

            // Check that the query is loaded from the correct SQL file
            expect(base.executeFromFile).toHaveBeenCalledWith('weeklyTrends', [1, 1]);
        });

        it('should return empty array for new user', async () => {
            // Mock the base repository to return empty array
            base.executeFromFile.mockResolvedValue([]);

            // Call the function and check the result
            const result = await analysisRepository.getWeeklyTrends(1);

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * getStreak tests
     * Purpose: Test the getStreak function of the analysisRepository
     * Success: Returns user's logging streak information
     * Failure: Returns null when no logging history exists
     */
    describe('getStreak', () => {
        it('should return streak data from SQL file', async () => {
            // Mock streak data
            const mockStreak = {
                current_streak: 5,
                longest_streak: 10,
                last_logged_date: '2024-01-15'
            };
            base.executeFromFile.mockResolvedValue([mockStreak]);

            // Call the function and check the result
            const result = await analysisRepository.getStreak(1);

            // Check that the result matches the mock streak (first element returned)
            expect(result).toEqual(mockStreak);

            // Check that the query is loaded from the correct SQL file
            expect(base.executeFromFile).toHaveBeenCalledWith('streakTracker', [1, 1]);
        });

        it('should return null when no results', async () => {
            // Mock the base repository to return empty array
            base.executeFromFile.mockResolvedValue([]);

            // Call the function and check the result
            const result = await analysisRepository.getStreak(1);

            // Check that the result is null
            expect(result).toBeNull();
        });
    });

    /**
     * getEffectiveFoods tests
     * Purpose: Test the getEffectiveFoods function of the analysisRepository
     * Success: Returns foods that contributed most to nutrient intake
     * Failure: Returns empty array when no data exists
     */
    describe('getEffectiveFoods', () => {
        it('should return effective foods from SQL file', async () => {
            // Mock effective foods data
            const mockFoods = [
                { food_name: 'Chicken Breast', total_contribution: 500 },
                { food_name: 'Eggs', total_contribution: 300 }
            ];
            base.executeFromFile.mockResolvedValue(mockFoods);

            // Call the function and check the result
            const result = await analysisRepository.getEffectiveFoods(1);

            // Check that the result matches the mock foods
            expect(result).toEqual(mockFoods);

            // Check that the query is loaded from the correct SQL file
            expect(base.executeFromFile).toHaveBeenCalledWith('effectiveFoods', [1, 1]);
        });
    });
});
