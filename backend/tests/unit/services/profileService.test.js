const profileService = require('../../../src/services/profileService');
const profileRepository = require('../../../src/repositories/profileRepository');

// Mock dependencies
jest.mock('../../../src/repositories/profileRepository');

/**
 * Profile Service Unit Tests
 * Tests profile business logic including macro calculations
 */
describe('profileService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * getProfile tests
     * Purpose: Test the getProfile function of the profileService
     * Success: Returns user profile data
     * Failure: Throws error when profile not found
     */
    describe('getProfile', () => {
        it('should return user profile', async () => {
            // Mock a profile object from database
            const mockProfile = {
                profile_id: 1,
                user_id: 1,
                birth_date: '1990-01-01',
                gender: 'Male',
                height_cm: 180,
                weight_kg: 75
            };
            profileRepository.findByUserId.mockResolvedValue(mockProfile);

            // Call the function and check the result
            const result = await profileService.getProfile(1);

            // Check that the result matches the mock profile
            expect(result).toEqual(mockProfile);

            // Verify repository was called correctly
            expect(profileRepository.findByUserId).toHaveBeenCalledWith(1);
        });

        it('should throw error when profile not found', async () => {
            // Mock repository to return null
            profileRepository.findByUserId.mockResolvedValue(null);

            // Call with non-existent userId - should throw error
            await expect(
                profileService.getProfile(999)
            ).rejects.toThrow('Profile not found');
        });
    });

    /**
     * updateProfile tests
     * Purpose: Test the updateProfile function of the profileService
     * Success: Updates profile and returns updated data
     * Failure: N/A (validation handled at route level)
     */
    describe('updateProfile', () => {
        it('should update profile and return updated data', async () => {
            // Mock updated profile object
            const mockProfile = {
                profile_id: 1,
                user_id: 1,
                birth_date: '1990-01-01',
                gender: 'Male',
                height_cm: 180,
                weight_kg: 72
            };
            profileRepository.update.mockResolvedValue(1);
            profileRepository.findByUserId.mockResolvedValue(mockProfile);

            // Call the function with update data
            const result = await profileService.updateProfile(1, { weight_kg: 72 });

            // Check that the result matches the updated profile
            expect(result).toEqual(mockProfile);

            // Verify repository calls
            expect(profileRepository.update).toHaveBeenCalledWith(1, { weight_kg: 72 });
            expect(profileRepository.findByUserId).toHaveBeenCalledWith(1);
        });
    });

    /**
     * calculateTargets tests
     * Purpose: Test the calculateTargets function of the profileService
     * Success: Calculates BMR, TDEE, and macro targets based on profile data
     * Failure: Throws error when required profile data is missing
     */
    describe('calculateTargets', () => {
        it('should calculate targets for male with moderate activity', async () => {
            // Mock a complete profile for calculation
            const mockProfile = {
                profile_id: 1,
                user_id: 1,
                birth_date: '1990-01-15',
                gender: 'Male',
                height_cm: 180,
                weight_kg: 75,
                activity_level: 'Moderate',
                goal: 'Maintain'
            };
            profileRepository.findByUserId.mockResolvedValue(mockProfile);
            profileRepository.updateTargets.mockResolvedValue(1);

            // Call the function and check the result
            const result = await profileService.calculateTargets(1);

            // Check that all expected properties are present
            expect(result).toHaveProperty('bmr');
            expect(result).toHaveProperty('tdee');
            expect(result).toHaveProperty('target_calories');
            expect(result).toHaveProperty('target_protein_g');
            expect(result).toHaveProperty('target_carbs_g');
            expect(result).toHaveProperty('target_fat_g');

            // Verify specific calculations (protein = 2g/kg, fat = 0.9g/kg)
            expect(result.target_protein_g).toBe(150); // 75 * 2
            expect(result.target_fat_g).toBe(68); // Math.round(75 * 0.9)

            // Verify repository was called to save targets
            expect(profileRepository.updateTargets).toHaveBeenCalled();
        });

        it('should calculate targets for female with light activity', async () => {
            // Mock a female profile with different parameters
            const mockProfile = {
                profile_id: 1,
                user_id: 2,
                birth_date: '1995-06-20',
                gender: 'Female',
                height_cm: 165,
                weight_kg: 60,
                activity_level: 'Light',
                goal: 'Loss'
            };
            profileRepository.findByUserId.mockResolvedValue(mockProfile);
            profileRepository.updateTargets.mockResolvedValue(1);

            // Call the function and check the result
            const result = await profileService.calculateTargets(2);

            // Verify protein and fat calculations for female
            expect(result.target_protein_g).toBe(120); // 60 * 2
            expect(result.target_fat_g).toBe(54); // Math.round(60 * 0.9)

            // Loss goal should reduce calories by 500
            expect(profileRepository.updateTargets).toHaveBeenCalled();
        });

        it('should calculate targets for heavy activity with gain goal', async () => {
            // Mock a profile with heavy activity and gain goal
            const mockProfile = {
                profile_id: 1,
                user_id: 3,
                birth_date: '1988-03-10',
                gender: 'Male',
                height_cm: 175,
                weight_kg: 80,
                activity_level: 'Heavy',
                goal: 'Gain'
            };
            profileRepository.findByUserId.mockResolvedValue(mockProfile);
            profileRepository.updateTargets.mockResolvedValue(1);

            // Call the function and check the result
            const result = await profileService.calculateTargets(3);

            // Verify calculations
            expect(result.target_protein_g).toBe(160); // 80 * 2
            expect(result.target_fat_g).toBe(72); // Math.round(80 * 0.9)

            // Gain goal should increase calories by 500
            expect(profileRepository.updateTargets).toHaveBeenCalled();
        });

        it('should throw error when birth_date is missing', async () => {
            // Mock profile with missing birth_date
            const mockProfile = {
                profile_id: 1,
                user_id: 1,
                birth_date: null,
                gender: 'Male',
                height_cm: 180,
                weight_kg: 75
            };
            profileRepository.findByUserId.mockResolvedValue(mockProfile);

            // Call should throw validation error
            await expect(
                profileService.calculateTargets(1)
            ).rejects.toThrow('Please complete your profile first');
        });

        it('should throw error when gender is missing', async () => {
            // Mock profile with missing gender
            const mockProfile = {
                profile_id: 1,
                user_id: 1,
                birth_date: '1990-01-01',
                gender: null,
                height_cm: 180,
                weight_kg: 75
            };
            profileRepository.findByUserId.mockResolvedValue(mockProfile);

            // Call should throw validation error
            await expect(
                profileService.calculateTargets(1)
            ).rejects.toThrow('Please complete your profile first');
        });

        it('should throw error when activity_level is missing', async () => {
            // Mock profile with missing activity_level
            const mockProfile = {
                profile_id: 1,
                user_id: 1,
                birth_date: '1990-01-01',
                gender: 'Male',
                height_cm: 180,
                weight_kg: 75,
                activity_level: null,
                goal: 'Maintain'
            };
            profileRepository.findByUserId.mockResolvedValue(mockProfile);

            // Call should throw validation error
            await expect(
                profileService.calculateTargets(1)
            ).rejects.toThrow('Please set your activity level and goal first');
        });

        it('should throw error when goal is missing', async () => {
            // Mock profile with missing goal
            const mockProfile = {
                profile_id: 1,
                user_id: 1,
                birth_date: '1990-01-01',
                gender: 'Male',
                height_cm: 180,
                weight_kg: 75,
                activity_level: 'Moderate',
                goal: null
            };
            profileRepository.findByUserId.mockResolvedValue(mockProfile);

            // Call should throw validation error
            await expect(
                profileService.calculateTargets(1)
            ).rejects.toThrow('Please set your activity level and goal first');
        });
    });
});
