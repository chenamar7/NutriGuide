const adminRepository = require('../../../src/repositories/adminRepository');
const base = require('../../../src/repositories/baseRepository');

// Mock the base repository
jest.mock('../../../src/repositories/baseRepository');

/**
 * Admin Repository Unit Tests
 * Tests admin analytics database operations
 */
describe('adminRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * getDashboardStats tests
     * Purpose: Test the getDashboardStats function of the adminRepository
     * Success: Returns dashboard statistics from SQL file
     * Failure: Returns empty array when no data exists
     */
    describe('getDashboardStats', () => {
        it('should return dashboard statistics from SQL file', async () => {
            // Mock dashboard statistics
            const mockStats = [
                { total_users: 100, total_logs: 5000, active_today: 25 }
            ];
            base.executeFromFile.mockResolvedValue(mockStats);

            // Call the function and check the result
            const result = await adminRepository.getDashboardStats();

            // Check that the result matches the mock statistics
            expect(result).toEqual(mockStats);

            // Check that the query is loaded from the correct SQL file
            expect(base.executeFromFile).toHaveBeenCalledWith('adminDashboard');
        });

        it('should return empty array when no data exists', async () => {
            // Mock the base repository to return empty array
            base.executeFromFile.mockResolvedValue([]);

            // Call the function and check the result
            const result = await adminRepository.getDashboardStats();

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * getPopularCategories tests
     * Purpose: Test the getPopularCategories function of the adminRepository
     * Success: Returns popular categories grouped by user goal
     * Failure: Returns empty array when no data exists
     */
    describe('getPopularCategories', () => {
        it('should return popular categories by goal', async () => {
            // Mock popular categories data
            const mockCategories = [
                { goal: 'Loss', category_name: 'Vegetables', log_count: 500 },
                { goal: 'Gain', category_name: 'Protein', log_count: 400 }
            ];
            base.executeFromFile.mockResolvedValue(mockCategories);

            // Call the function and check the result
            const result = await adminRepository.getPopularCategories();

            // Check that the result matches the mock categories
            expect(result).toEqual(mockCategories);

            // Check that the query is loaded from the correct SQL file
            expect(base.executeFromFile).toHaveBeenCalledWith('adminCategories');
        });
    });

    /**
     * getDeficiencies tests
     * Purpose: Test the getDeficiencies function of the adminRepository
     * Success: Returns nutrient deficiency report across all users
     * Failure: Returns empty array when no deficiencies found
     */
    describe('getDeficiencies', () => {
        it('should return nutrient deficiency report', async () => {
            // Mock nutrient deficiency data
            const mockDeficiencies = [
                { nutrient_name: 'Vitamin D', avg_deficit: -50 },
                { nutrient_name: 'Iron', avg_deficit: -30 }
            ];
            base.executeFromFile.mockResolvedValue(mockDeficiencies);

            // Call the function and check the result
            const result = await adminRepository.getDeficiencies();

            // Check that the result matches the mock deficiencies
            expect(result).toEqual(mockDeficiencies);

            // Check that the query is loaded from the correct SQL file
            expect(base.executeFromFile).toHaveBeenCalledWith('adminDeficiencies');
        });

        it('should return empty array when no deficiencies found', async () => {
            // Mock the base repository to return empty array
            base.executeFromFile.mockResolvedValue([]);

            // Call the function and check the result
            const result = await adminRepository.getDeficiencies();

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });
});
