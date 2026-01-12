const profileRepository = require('../../../src/repositories/profileRepository');
const base = require('../../../src/repositories/baseRepository');

// Mock the base repository
jest.mock('../../../src/repositories/baseRepository');

/**
 * Profile Repository Unit Tests
 * Tests all profile-related database operations
 */
describe('profileRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * findByUserId tests
     * Purpose: Test the findByUserId function of the profileRepository
     * Success: Returns a profile object when the user exists
     * Failure: Returns null when the user does not exist
     */
    describe('findByUserId', () => {
        it('should return profile when user exists', async () => {
            // Mock a profile object
            const mockProfile = {
                profile_id: 1,
                user_id: 1,
                birth_date: '1990-01-01',
                gender: 'Male',
                height_cm: 180,
                weight_kg: 75,
                activity_level: 'Moderate',
                goal: 'Maintain',
                target_calories: 2500,
                target_protein_g: 150,
                target_carbs_g: 300,
                target_fat_g: 68
            };
            base.findOne.mockResolvedValue(mockProfile);

            // Call the function and check the result
            const result = await profileRepository.findByUserId(1);

            // Check that the result matches the mock profile object
            expect(result).toEqual(mockProfile);

            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('user_id = ?'),
                [1]
            );
        });

        it('should return null when user does not exist', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await profileRepository.findByUserId(999);

            // Check that the result is null
            expect(result).toBeNull();
        });
    });

    /**
     * create tests
     * Purpose: Test the create function of the profileRepository
     * Success: Returns the inserted profile ID
     * Failure: N/A (database constraint failures handled at DB level)
     */
    describe('create', () => {
        it('should create empty profile and return profile_id', async () => {
            // Mock the base repository to return the inserted profile ID
            const mockInsertId = 1;
            base.insert.mockResolvedValue(mockInsertId);

            // Call the function and check the result
            const result = await profileRepository.create(5);

            // Check that the result matches the mock inserted profile ID
            expect(result).toBe(mockInsertId);

            // Check that the base repository was called with the correct arguments
            expect(base.insert).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO User_Profiles'),
                [5]
            );
        });
    });

    /**
     * update tests
     * Purpose: Test the update function of the profileRepository
     * Success: Returns the affected rows count (1 when updated)
     * Failure: Returns 0 when profile does not exist
     */
    describe('update', () => {
        it('should update profile with all fields', async () => {
            // Mock the base repository to return the affected rows count
            base.modify.mockResolvedValue(1);

            // Create test data with all profile fields
            const data = {
                birth_date: '1990-05-15',
                gender: 'Male',
                height_cm: 180,
                weight_kg: 75,
                activity_level: 'Moderate',
                goal: 'Loss'
            };

            // Call the function and check the result
            const result = await profileRepository.update(1, data);

            // Check that the result matches the expected affected rows count
            expect(result).toBe(1);

            // Check that the base repository was called with the correct arguments
            expect(base.modify).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE User_Profiles'),
                ['1990-05-15', 'Male', 180, 75, 'Moderate', 'Loss', 1]
            );
        });

        it('should update profile with partial fields', async () => {
            // Mock the base repository to return the affected rows count
            base.modify.mockResolvedValue(1);

            // Create test data with only one field (weight_kg)
            const data = {
                weight_kg: 72
            };

            // Call the function and check the result
            const result = await profileRepository.update(1, data);

            // Check that the result matches the expected affected rows count
            expect(result).toBe(1);

            // Check that COALESCE is used to only update provided fields
            expect(base.modify).toHaveBeenCalledWith(
                expect.stringContaining('COALESCE'),
                [null, null, null, 72, null, null, 1]
            );
        });

        it('should return 0 when profile does not exist', async () => {
            // Mock the base repository to return 0 (no rows affected)
            base.modify.mockResolvedValue(0);

            // Call the function and check the result
            const result = await profileRepository.update(999, { weight_kg: 72 });

            // Check that the result is 0
            expect(result).toBe(0);
        });
    });

    /**
     * updateTargets tests
     * Purpose: Test the updateTargets function of the profileRepository
     * Success: Returns the affected rows count (1 when updated)
     * Failure: Returns 0 when profile does not exist
     */
    describe('updateTargets', () => {
        it('should update calculated macro targets', async () => {
            // Mock the base repository to return the affected rows count
            base.modify.mockResolvedValue(1);

            // Call the function and check the result
            const result = await profileRepository.updateTargets(1, 2500, 150, 300, 68);

            // Check that the result matches the expected affected rows count
            expect(result).toBe(1);

            // Check that the base repository was called with the correct arguments
            expect(base.modify).toHaveBeenCalledWith(
                expect.stringContaining('target_calories'),
                [2500, 150, 300, 68, 1]
            );
        });

        it('should return 0 when profile does not exist', async () => {
            // Mock the base repository to return 0 (no rows affected)
            base.modify.mockResolvedValue(0);

            // Call the function and check the result
            const result = await profileRepository.updateTargets(999, 2500, 150, 300, 68);

            // Check that the result is 0
            expect(result).toBe(0);
        });
    });
});
