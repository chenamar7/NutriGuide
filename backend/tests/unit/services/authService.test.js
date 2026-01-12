const authService = require('../../../src/services/authService');
const userRepository = require('../../../src/repositories/userRepository');
const profileRepository = require('../../../src/repositories/profileRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../../src/repositories/userRepository');
jest.mock('../../../src/repositories/profileRepository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

/**
 * Auth Service Unit Tests
 * Tests authentication business logic
 */
describe('authService', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * register tests
     * Purpose: Test the register function of the authService
     * Success: Creates new user and profile, returns user info
     * Failure: Throws error for validation failures or duplicate user
     */
    describe('register', () => {
        it('should register new user successfully', async () => {
            // Mock repository responses for successful registration
            userRepository.existsByEmailOrUsername.mockResolvedValue(false);
            bcrypt.hash.mockResolvedValue('hashedpassword123');
            userRepository.create.mockResolvedValue(1);
            profileRepository.create.mockResolvedValue(1);

            // Call the function with valid credentials
            const result = await authService.register(
                'testuser',
                'test@example.com',
                'password123'
            );

            // Check that the result contains expected user info
            expect(result).toEqual({
                userId: 1,
                username: 'testuser',
                email: 'test@example.com'
            });

            // Verify all repository calls were made correctly
            expect(userRepository.existsByEmailOrUsername).toHaveBeenCalledWith(
                'test@example.com',
                'testuser'
            );
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(userRepository.create).toHaveBeenCalledWith(
                'testuser',
                'test@example.com',
                'hashedpassword123'
            );
            expect(profileRepository.create).toHaveBeenCalledWith(1);
        });

        it('should throw error when username is missing', async () => {
            // Call without username - should throw validation error
            await expect(
                authService.register(null, 'test@example.com', 'password123')
            ).rejects.toThrow('Username, email, and password are required');
        });

        it('should throw error when email is missing', async () => {
            // Call without email - should throw validation error
            await expect(
                authService.register('testuser', null, 'password123')
            ).rejects.toThrow('Username, email, and password are required');
        });

        it('should throw error when password is missing', async () => {
            // Call without password - should throw validation error
            await expect(
                authService.register('testuser', 'test@example.com', null)
            ).rejects.toThrow('Username, email, and password are required');
        });

        it('should throw error when password is too short', async () => {
            // Call with password less than 6 characters
            await expect(
                authService.register('testuser', 'test@example.com', '12345')
            ).rejects.toThrow('Password must be at least 6 characters');
        });

        it('should throw error when user already exists', async () => {
            // Mock that user already exists
            userRepository.existsByEmailOrUsername.mockResolvedValue(true);

            // Call with existing credentials - should throw error
            await expect(
                authService.register('testuser', 'test@example.com', 'password123')
            ).rejects.toThrow('User with this email or username already exists');
        });
    });

    /**
     * login tests
     * Purpose: Test the login function of the authService
     * Success: Returns JWT token and user info for valid credentials
     * Failure: Throws error for invalid credentials or missing fields
     */
    describe('login', () => {
        it('should login user successfully and return token', async () => {
            // Mock a valid user from database
            const mockUser = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                is_admin: 0
            };
            userRepository.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock-jwt-token');

            // Call the function with valid credentials
            const result = await authService.login('test@example.com', 'password123');

            // Check that the result contains token and user info
            expect(result).toEqual({
                token: 'mock-jwt-token',
                user: {
                    userId: 1,
                    username: 'testuser',
                    email: 'test@example.com',
                    isAdmin: false
                }
            });

            // Verify all calls were made correctly
            expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(jwt.sign).toHaveBeenCalledWith(
                {
                    userId: 1,
                    username: 'testuser',
                    isAdmin: false
                },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
        });

        it('should login admin user and set isAdmin to true', async () => {
            // Mock an admin user from database
            const mockAdminUser = {
                user_id: 2,
                username: 'admin',
                email: 'admin@example.com',
                password_hash: 'hashedpassword',
                is_admin: 1
            };
            userRepository.findByEmail.mockResolvedValue(mockAdminUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('admin-jwt-token');

            // Call the function with admin credentials
            const result = await authService.login('admin@example.com', 'adminpass');

            // Check that isAdmin flag is true
            expect(result.user.isAdmin).toBe(true);
        });

        it('should throw error when email is missing', async () => {
            // Call without email - should throw validation error
            await expect(
                authService.login(null, 'password123')
            ).rejects.toThrow('Email and password are required');
        });

        it('should throw error when password is missing', async () => {
            // Call without password - should throw validation error
            await expect(
                authService.login('test@example.com', null)
            ).rejects.toThrow('Email and password are required');
        });

        it('should throw error when user not found', async () => {
            // Mock that user does not exist
            userRepository.findByEmail.mockResolvedValue(null);

            // Call with non-existent email - should throw error
            await expect(
                authService.login('nonexistent@example.com', 'password123')
            ).rejects.toThrow('Invalid email or password');
        });

        it('should throw error when password is incorrect', async () => {
            // Mock a valid user but wrong password
            const mockUser = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                is_admin: 0
            };
            userRepository.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            // Call with wrong password - should throw error
            await expect(
                authService.login('test@example.com', 'wrongpassword')
            ).rejects.toThrow('Invalid email or password');
        });
    });

    /**
     * getCurrentUser tests
     * Purpose: Test the getCurrentUser function of the authService
     * Success: Returns user info for valid userId
     * Failure: Throws error when user not found
     */
    describe('getCurrentUser', () => {
        it('should return current user info', async () => {
            // Mock a valid user from database
            const mockUser = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                is_admin: 0,
                created_at: new Date('2024-01-01')
            };
            userRepository.findById.mockResolvedValue(mockUser);

            // Call the function and check the result
            const result = await authService.getCurrentUser(1);

            // Check that the result contains expected user info
            expect(result).toEqual({
                userId: 1,
                username: 'testuser',
                email: 'test@example.com',
                isAdmin: false,
                createdAt: mockUser.created_at
            });

            // Verify repository was called correctly
            expect(userRepository.findById).toHaveBeenCalledWith(1);
        });

        it('should return isAdmin true for admin users', async () => {
            // Mock an admin user from database
            const mockAdminUser = {
                user_id: 2,
                username: 'admin',
                email: 'admin@example.com',
                is_admin: 1,
                created_at: new Date('2024-01-01')
            };
            userRepository.findById.mockResolvedValue(mockAdminUser);

            // Call the function and check isAdmin flag
            const result = await authService.getCurrentUser(2);

            // Check that isAdmin is true
            expect(result.isAdmin).toBe(true);
        });

        it('should throw error when user not found', async () => {
            // Mock that user does not exist
            userRepository.findById.mockResolvedValue(null);

            // Call with non-existent userId - should throw error
            await expect(
                authService.getCurrentUser(999)
            ).rejects.toThrow('User not found');
        });
    });

    /**
     * deleteUser tests
     * Purpose: Test the deleteUser function of the authService
     * Success: Deletes user and returns success message
     * Failure: Throws error when userId missing or user not found
     */
    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            // Mock successful deletion (1 row affected)
            userRepository.deleteById.mockResolvedValue(1);

            // Call the function and check the result
            const result = await authService.deleteUser(1);

            // Check that success message is returned
            expect(result).toEqual({
                message: 'User and all related data deleted successfully'
            });

            // Verify repository was called correctly
            expect(userRepository.deleteById).toHaveBeenCalledWith(1);
        });

        it('should throw error when userId is missing', async () => {
            // Call without userId - should throw validation error
            await expect(
                authService.deleteUser(null)
            ).rejects.toThrow('User ID is required');
        });

        it('should throw error when user not found', async () => {
            // Mock that deletion affected 0 rows
            userRepository.deleteById.mockResolvedValue(0);

            // Call with non-existent userId - should throw error
            await expect(
                authService.deleteUser(999)
            ).rejects.toThrow('User not found');
        });
    });
});
