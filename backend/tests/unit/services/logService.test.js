const logService = require('../../../src/services/logService');
const logRepository = require('../../../src/repositories/logRepository');
const foodRepository = require('../../../src/repositories/foodRepository');

// Mock dependencies
jest.mock('../../../src/repositories/logRepository');
jest.mock('../../../src/repositories/foodRepository');

/**
 * Log Service Unit Tests
 * Tests food log business logic
 */
describe('logService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * logFood tests
     * Purpose: Test the logFood function of the logService
     * Success: Creates log entry and returns log data
     * Failure: Throws error for validation failures or missing food
     */
    describe('logFood', () => {
        it('should log food entry successfully', async () => {
            // Mock successful food existence check and log creation
            foodRepository.existsById.mockResolvedValue(true);
            logRepository.create.mockResolvedValue(1);

            // Call the function and check the result
            const result = await logService.logFood(1, 100, 150, null);

            // Check that the result contains expected log data
            expect(result).toMatchObject({
                log_id: 1,
                user_id: 1,
                food_id: 100,
                serving_size_grams: 150
            });
            expect(result.date_eaten).toBeDefined();

            // Verify repository calls
            expect(foodRepository.existsById).toHaveBeenCalledWith(100);
            expect(logRepository.create).toHaveBeenCalled();
        });

        it('should use provided date when specified', async () => {
            // Mock successful responses
            foodRepository.existsById.mockResolvedValue(true);
            logRepository.create.mockResolvedValue(1);
            const testDate = new Date('2024-01-15');

            // Call with specific date
            const result = await logService.logFood(1, 100, 150, testDate);

            // Check that the provided date is used
            expect(result.date_eaten).toEqual(testDate);
        });

        it('should throw error when foodId is missing', async () => {
            // Call without foodId - should throw validation error
            await expect(
                logService.logFood(1, null, 150, null)
            ).rejects.toThrow('Food ID and serving size are required');
        });

        it('should throw error when serving size is missing', async () => {
            // Call without serving size - should throw validation error
            await expect(
                logService.logFood(1, 100, null, null)
            ).rejects.toThrow('Food ID and serving size are required');
        });

        it('should throw error when serving size is zero', async () => {
            // 0 is falsy so triggers the 'required' error first
            await expect(
                logService.logFood(1, 100, 0, null)
            ).rejects.toThrow('Food ID and serving size are required');
        });

        it('should throw error when serving size is negative', async () => {
            // Negative serving size - should throw validation error
            await expect(
                logService.logFood(1, 100, -50, null)
            ).rejects.toThrow('Serving size must be positive');
        });

        it('should throw error when food does not exist', async () => {
            // Mock that food doesn't exist
            foodRepository.existsById.mockResolvedValue(false);

            // Call with non-existent foodId - should throw error
            await expect(
                logService.logFood(1, 999, 150, null)
            ).rejects.toThrow('Food not found');
        });
    });

    /**
     * getFoodLog tests
     * Purpose: Test the getFoodLog function of the logService
     * Success: Returns log entries for specified date
     * Failure: N/A (returns empty array when no logs)
     */
    describe('getFoodLog', () => {
        it('should return log entries for specified date', async () => {
            // Mock log entries
            const mockLogs = [
                { log_id: 1, food_name: 'Apple', serving_size_grams: 150 }
            ];
            logRepository.findByUserAndDate.mockResolvedValue(mockLogs);

            // Call the function with specific date
            const result = await logService.getFoodLog(1, '2024-01-15');

            // Check that the result matches mock logs
            expect(result).toEqual(mockLogs);

            // Verify repository was called with correct arguments
            expect(logRepository.findByUserAndDate).toHaveBeenCalledWith(1, '2024-01-15');
        });

        it('should default to today when date not provided', async () => {
            // Mock empty logs
            logRepository.findByUserAndDate.mockResolvedValue([]);
            const today = new Date().toISOString().split('T')[0];

            // Call without date - should default to today
            await logService.getFoodLog(1, null);

            // Verify today's date is used
            expect(logRepository.findByUserAndDate).toHaveBeenCalledWith(1, today);
        });
    });

    /**
     * deleteLogEntry tests
     * Purpose: Test the deleteLogEntry function of the logService
     * Success: Deletes log entry and returns success message
     * Failure: Throws error when logId missing or entry not found/unauthorized
     */
    describe('deleteLogEntry', () => {
        it('should delete log entry successfully', async () => {
            // Mock successful deletion
            logRepository.deleteById.mockResolvedValue(1);

            // Call the function and check the result
            const result = await logService.deleteLogEntry(1, 5);

            // Check success message
            expect(result).toEqual({ message: 'Log entry deleted successfully' });

            // Verify repository was called with correct arguments
            expect(logRepository.deleteById).toHaveBeenCalledWith(5, 1);
        });

        it('should throw error when logId is missing', async () => {
            // Call without logId - should throw validation error
            await expect(
                logService.deleteLogEntry(1, null)
            ).rejects.toThrow('Log ID is required');
        });

        it('should throw error when log entry not found or unauthorized', async () => {
            // Mock deletion returned 0 (no rows affected)
            logRepository.deleteById.mockResolvedValue(0);

            // Call with non-existent/unauthorized log - should throw error
            await expect(
                logService.deleteLogEntry(1, 999)
            ).rejects.toThrow('Log entry not found or does not belong to you');
        });
    });

    /**
     * updateLogEntry tests
     * Purpose: Test the updateLogEntry function of the logService
     * Success: Updates serving size and returns updated log entry
     * Failure: Throws error for validation failures or entry not found/unauthorized
     */
    describe('updateLogEntry', () => {
        it('should update log entry and return updated data', async () => {
            // Mock successful update and retrieval
            const mockLog = { log_id: 1, serving_size_grams: 200, food_name: 'Apple' };
            logRepository.updateServingSize.mockResolvedValue(1);
            logRepository.findById.mockResolvedValue(mockLog);

            // Call the function with new serving size
            const result = await logService.updateLogEntry(1, 5, 200);

            // Check that the result matches the updated log
            expect(result).toEqual(mockLog);

            // Verify repository calls
            expect(logRepository.updateServingSize).toHaveBeenCalledWith(5, 1, 200);
            expect(logRepository.findById).toHaveBeenCalledWith(5);
        });

        it('should throw error when logId is missing', async () => {
            // Call without logId - should throw validation error
            await expect(
                logService.updateLogEntry(1, null, 200)
            ).rejects.toThrow('Log ID is required');
        });

        it('should throw error when serving size is missing', async () => {
            // Call without serving size - should throw validation error
            await expect(
                logService.updateLogEntry(1, 5, null)
            ).rejects.toThrow('Serving size must be a positive number');
        });

        it('should throw error when serving size is zero', async () => {
            // Zero serving size - should throw validation error
            await expect(
                logService.updateLogEntry(1, 5, 0)
            ).rejects.toThrow('Serving size must be a positive number');
        });

        it('should throw error when serving size is negative', async () => {
            // Negative serving size - should throw validation error
            await expect(
                logService.updateLogEntry(1, 5, -50)
            ).rejects.toThrow('Serving size must be a positive number');
        });

        it('should throw error when log entry not found or unauthorized', async () => {
            // Mock update returned 0 (no rows affected)
            logRepository.updateServingSize.mockResolvedValue(0);

            // Call with non-existent/unauthorized log - should throw error
            await expect(
                logService.updateLogEntry(1, 999, 200)
            ).rejects.toThrow('Log entry not found or does not belong to you');
        });
    });

    /**
     * getLogHistory tests
     * Purpose: Test the getLogHistory function of the logService
     * Success: Returns log entries for past X days
     * Failure: Throws error when days is missing, zero, or negative
     */
    describe('getLogHistory', () => {
        it('should return log history for past X days', async () => {
            // Mock log history entries
            const mockLogs = [
                { log_id: 1, date: '2024-01-15', food_name: 'Apple' },
                { log_id: 2, date: '2024-01-14', food_name: 'Banana' }
            ];
            logRepository.findByUserAndDateRange.mockResolvedValue(mockLogs);

            // Call the function with 7 days
            const result = await logService.getLogHistory(1, 7);

            // Check that the result matches mock logs
            expect(result).toEqual(mockLogs);

            // Verify repository was called
            expect(logRepository.findByUserAndDateRange).toHaveBeenCalled();
        });

        it('should throw error when days is missing', async () => {
            // Call without days - should throw validation error
            await expect(
                logService.getLogHistory(1, null)
            ).rejects.toThrow('Days is required and must be a positive number');
        });

        it('should throw error when days is zero', async () => {
            // Zero days - should throw validation error
            await expect(
                logService.getLogHistory(1, 0)
            ).rejects.toThrow('Days is required and must be a positive number');
        });

        it('should throw error when days is negative', async () => {
            // Negative days - should throw validation error
            await expect(
                logService.getLogHistory(1, -5)
            ).rejects.toThrow('Days is required and must be a positive number');
        });
    });
});
