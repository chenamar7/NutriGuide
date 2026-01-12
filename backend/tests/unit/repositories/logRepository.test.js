const logRepository = require('../../../src/repositories/logRepository');
const base = require('../../../src/repositories/baseRepository');

// Mock the base repository
jest.mock('../../../src/repositories/baseRepository');

/**
 * Log Repository Unit Tests
 * Tests all food log database operations
 */
describe('logRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * create tests
     * Purpose: Test the create function of the logRepository
     * Success: Returns the inserted log_id
     * Failure: N/A (database constraint failures handled at DB level)
     */
    describe('create', () => {
        it('should create new log entry and return log_id', async () => {
            // Mock the base repository to return the inserted log ID
            base.insert.mockResolvedValue(1);
            const testDate = new Date('2024-01-15');

            // Call the function and check the result
            const result = await logRepository.create(1, 100, testDate, 150);

            // Check that the result matches the mock inserted log ID
            expect(result).toBe(1);

            // Check that the base repository was called with the correct arguments
            expect(base.insert).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO User_Food_Log'),
                [1, 100, testDate, 150]
            );
        });
    });

    /**
     * findByUserAndDate tests
     * Purpose: Test the findByUserAndDate function of the logRepository
     * Success: Returns an array of log entries for the user on the given date
     * Failure: Returns empty array when no logs for date
     */
    describe('findByUserAndDate', () => {
        it('should return log entries for user and date', async () => {
            // Mock an array of log entry objects
            const mockLogs = [
                { log_id: 1, date_eaten: '2024-01-15', serving_size_grams: 150, food_id: 100, food_name: 'Apple', category_name: 'Fruits' },
                { log_id: 2, date_eaten: '2024-01-15', serving_size_grams: 200, food_id: 101, food_name: 'Banana', category_name: 'Fruits' }
            ];
            base.findAll.mockResolvedValue(mockLogs);

            // Call the function and check the result
            const result = await logRepository.findByUserAndDate(1, '2024-01-15');

            // Check that the result matches the mock logs array
            expect(result).toEqual(mockLogs);

            // Check that the base repository was called with the correct arguments
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('user_id = ? AND DATE(ufl.date_eaten) = ?'),
                [1, '2024-01-15']
            );
        });

        it('should return empty array when no logs for date', async () => {
            // Mock the base repository to return empty array
            base.findAll.mockResolvedValue([]);

            // Call the function and check the result
            const result = await logRepository.findByUserAndDate(1, '2024-01-01');

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });

    /**
     * deleteById tests
     * Purpose: Test the deleteById function of the logRepository
     * Success: Returns affected rows count (1 when deleted)
     * Failure: Returns 0 when log entry not found or doesn't belong to user
     */
    describe('deleteById', () => {
        it('should delete log entry and return affected rows', async () => {
            // Mock the base repository to return affected rows count
            base.modify.mockResolvedValue(1);

            // Call the function and check the result
            const result = await logRepository.deleteById(1, 5);

            // Check that the result matches the expected affected rows count
            expect(result).toBe(1);

            // Check that the base repository was called with the correct arguments
            expect(base.modify).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM User_Food_Log'),
                [1, 5]
            );
        });

        it('should return 0 when log entry not found', async () => {
            // Mock the base repository to return 0 (no rows affected)
            base.modify.mockResolvedValue(0);

            // Call the function and check the result
            const result = await logRepository.deleteById(999, 1);

            // Check that the result is 0
            expect(result).toBe(0);
        });
    });

    /**
     * updateServingSize tests
     * Purpose: Test the updateServingSize function of the logRepository
     * Success: Returns affected rows count (1 when updated)
     * Failure: Returns 0 when log entry not found or doesn't belong to user
     */
    describe('updateServingSize', () => {
        it('should update serving size and return affected rows', async () => {
            // Mock the base repository to return affected rows count
            base.modify.mockResolvedValue(1);

            // Call the function and check the result
            const result = await logRepository.updateServingSize(1, 5, 200);

            // Check that the result matches the expected affected rows count
            expect(result).toBe(1);

            // Check that the base repository was called with the correct arguments
            expect(base.modify).toHaveBeenCalledWith(
                expect.stringContaining('SET serving_size_grams = ?'),
                [200, 1, 5]
            );
        });

        it('should return 0 when log entry not found', async () => {
            // Mock the base repository to return 0 (no rows affected)
            base.modify.mockResolvedValue(0);

            // Call the function and check the result
            const result = await logRepository.updateServingSize(999, 1, 200);

            // Check that the result is 0
            expect(result).toBe(0);
        });
    });

    /**
     * findById tests
     * Purpose: Test the findById function of the logRepository
     * Success: Returns a log entry object when the ID exists
     * Failure: Returns null when the ID does not exist
     */
    describe('findById', () => {
        it('should return log entry by ID', async () => {
            // Mock a log entry object
            const mockLog = {
                log_id: 1,
                date_eaten: '2024-01-15',
                serving_size_grams: 150,
                food_id: 100,
                food_name: 'Apple'
            };
            base.findOne.mockResolvedValue(mockLog);

            // Call the function and check the result
            const result = await logRepository.findById(1);

            // Check that the result matches the mock log entry
            expect(result).toEqual(mockLog);

            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('log_id = ?'),
                [1]
            );
        });

        it('should return null when log entry not found', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await logRepository.findById(999);

            // Check that the result is null
            expect(result).toBeNull();
        });
    });

    /**
     * findByUserAndDateRange tests
     * Purpose: Test the findByUserAndDateRange function of the logRepository
     * Success: Returns an array of log entries within the date range
     * Failure: Returns empty array when no logs in range
     */
    describe('findByUserAndDateRange', () => {
        it('should return log entries for date range', async () => {
            // Mock an array of log entry objects
            const mockLogs = [
                { log_id: 1, date: '2024-01-15', serving_size_grams: 150, food_id: 100, food_name: 'Apple' },
                { log_id: 2, date: '2024-01-14', serving_size_grams: 200, food_id: 101, food_name: 'Banana' }
            ];
            base.findAll.mockResolvedValue(mockLogs);

            // Call the function and check the result
            const result = await logRepository.findByUserAndDateRange(1, '2024-01-10');

            // Check that the result matches the mock logs array
            expect(result).toEqual(mockLogs);

            // Check that the base repository was called with the correct arguments
            expect(base.findAll).toHaveBeenCalledWith(
                expect.stringContaining('DATE(ufl.date_eaten) >= ?'),
                [1, '2024-01-10']
            );
        });

        it('should return empty array when no logs in range', async () => {
            // Mock the base repository to return empty array
            base.findAll.mockResolvedValue([]);

            // Call the function and check the result
            const result = await logRepository.findByUserAndDateRange(1, '2025-01-01');

            // Check that the result is an empty array
            expect(result).toEqual([]);
        });
    });
});
