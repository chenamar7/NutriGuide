const adminService = require('../../../src/services/adminService');
const adminRepository = require('../../../src/repositories/adminRepository');

// Mock dependencies
jest.mock('../../../src/repositories/adminRepository');

/**
 * Admin Service Unit Tests
 * Tests admin business logic
 */
describe('adminService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * getDashboard tests
     * Purpose: Test the getDashboard function of the adminService
     * Success: Returns dashboard statistics
     * Failure: Returns empty array when no data exists
     */
    describe('getDashboard', () => {
        it('should return dashboard statistics', async () => {
            // Mock dashboard statistics from repository
            const mockStats = [
                { total_users: 100, total_logs: 5000, active_today: 25 }
            ];
            adminRepository.getDashboardStats.mockResolvedValue(mockStats);

            // Call the function and check the result
            const result = await adminService.getDashboard();

            // Check that the result matches the mock statistics
            expect(result).toEqual(mockStats);

            // Verify repository was called
            expect(adminRepository.getDashboardStats).toHaveBeenCalled();
        });

        it('should return empty array when no data exists', async () => {
            // Mock repository to return empty array
            adminRepository.getDashboardStats.mockResolvedValue([]);

            // Call the function and check the result
            const result = await adminService.getDashboard();

            // Check that the result is empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * getPopularCategories tests
     * Purpose: Test the getPopularCategories function of the adminService
     * Success: Returns popular food categories by user goal
     * Failure: N/A (returns empty array when no data)
     */
    describe('getPopularCategories', () => {
        it('should return popular categories by goal', async () => {
            // Mock popular categories data
            const mockCategories = [
                { goal: 'Loss', category_name: 'Vegetables', log_count: 500 },
                { goal: 'Gain', category_name: 'Protein', log_count: 400 }
            ];
            adminRepository.getPopularCategories.mockResolvedValue(mockCategories);

            // Call the function and check the result
            const result = await adminService.getPopularCategories();

            // Check that the result matches the mock categories
            expect(result).toEqual(mockCategories);

            // Verify repository was called
            expect(adminRepository.getPopularCategories).toHaveBeenCalled();
        });
    });

    /**
     * getDeficiencies tests
     * Purpose: Test the getDeficiencies function of the adminService
     * Success: Returns nutrient deficiency report
     * Failure: Returns empty array when no deficiencies found
     */
    describe('getDeficiencies', () => {
        it('should return nutrient deficiency report', async () => {
            // Mock deficiency report data
            const mockDeficiencies = [
                { nutrient_name: 'Vitamin D', avg_deficit: -50 },
                { nutrient_name: 'Iron', avg_deficit: -30 }
            ];
            adminRepository.getDeficiencies.mockResolvedValue(mockDeficiencies);

            // Call the function and check the result
            const result = await adminService.getDeficiencies();

            // Check that the result matches the mock deficiencies
            expect(result).toEqual(mockDeficiencies);

            // Verify repository was called
            expect(adminRepository.getDeficiencies).toHaveBeenCalled();
        });

        it('should return empty array when no deficiencies found', async () => {
            // Mock repository to return empty array
            adminRepository.getDeficiencies.mockResolvedValue([]);

            // Call the function and check the result
            const result = await adminService.getDeficiencies();

            // Check that the result is empty array
            expect(result).toEqual([]);
        });
    });
});
