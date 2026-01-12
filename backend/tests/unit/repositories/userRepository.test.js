const userRepository = require('../../../src/repositories/userRepository');
const base = require('../../../src/repositories/baseRepository');

// Mock the base repository
jest.mock('../../../src/repositories/baseRepository');

/**
 * User Repository Unit Tests
 * Tests all user-related database operations
 */
describe('userRepository', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * findByEmail tests
     * Purpose: Test the findByEmail function of the userRepository
     * Success: Returns a user object when the email exists
     * Failure: Returns null when the email does not exist
     */
    describe('findByEmail', () => {
        it('should return user when email exists', async () => {
            // Mock a user object
            const mockUser = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                is_admin: 0
            };
            base.findOne.mockResolvedValue(mockUser);

            // Call the function and check the result
            const result = await userRepository.findByEmail('test@example.com');

            // Check that the result matches the mock user object
            expect(result).toEqual(mockUser);
            
            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledTimes(1);
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                ['test@example.com']
            );
        });

        it('should return null when email does not exist', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await userRepository.findByEmail('nonexistent@example.com');

            // Check that the result is null
            expect(result).toBeNull();
            
            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledTimes(1);
        });
    });

    /**
     * findByUsername tests
     * Purpose: Test the findByUsername function of the userRepository
     * Success: Returns a user object when the username exists
     * Failure: Returns null when the username does not exist
     */
    describe('findByUsername', () => {
        it('should return user when username exists', async () => {
            // Mock a user object
            const mockUser = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                password_hash: 'hashedpassword',
                is_admin: 0
            };
            base.findOne.mockResolvedValue(mockUser);

            // Call the function and check the result
            const result = await userRepository.findByUsername('testuser');

            // Check that the result matches the mock user object
            expect(result).toEqual(mockUser);
            
            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledTimes(1);
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('username = ?'),
                ['testuser']
            );
        });

        it('should return null when username does not exist', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await userRepository.findByUsername('nonexistent');

            // Check that the result is null
            expect(result).toBeNull();
            
            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledTimes(1);
        });
    });

    /**
     * existsByEmailOrUsername tests
     * Purpose: Test the existsByEmailOrUsername function of the userRepository
     * Success: Returns true when the user exists
     * Failure: Returns false when the user does not exist
     */
    describe('existsByEmailOrUsername', () => {
        it('should return true when user exists', async () => {
            // Mock the base repository to return a user object
            base.findOne.mockResolvedValue({ user_id: 1 });

            // Call the function and check the result
            const result = await userRepository.existsByEmailOrUsername(
                'test@example.com',
                'testuser'
            );

            // Check that the result is true
            expect(result).toBe(true);
            
            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledTimes(1);
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('email = ? OR username = ?'),
                ['test@example.com', 'testuser']
            );
        });

        it('should return false when user does not exist', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await userRepository.existsByEmailOrUsername(
                'new@example.com',
                'newuser'
            );

            // Check that the result is false
            expect(result).toBe(false);
        });
    });

    /**
     * create tests
     * Purpose: Test the create function of the userRepository
     * Success: Returns the inserted user ID
     * Failure: Returns null when the user does not exist
     */
    describe('create', () => {
        it('should insert new user and return user_id', async () => {
            // Mock the base repository to return the inserted user ID
            const mockInsertId = 5;
            base.insert.mockResolvedValue(mockInsertId);

            // Call the function and check the result
            const result = await userRepository.create(
                'newuser',
                'new@example.com',
                'hashedpassword123'
            );

            // Check that the result matches the mock inserted user ID
            expect(result).toBe(mockInsertId);
            
            // Check that the base repository was called with the correct arguments
            expect(base.insert).toHaveBeenCalledTimes(1);
            expect(base.insert).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO Users'),
                ['newuser', 'new@example.com', 'hashedpassword123']
            );
        });
    });

    /**
     * findById tests
     * Purpose: Test the findById function of the userRepository
     * Success: Returns a user object when the ID exists
     * Failure: Returns null when the ID does not exist
     */
    describe('findById', () => {
        it('should return user when ID exists', async () => {
            // Mock a user object
            const mockUser = {
                user_id: 1,
                username: 'testuser',
                email: 'test@example.com',
                is_admin: 0,
                created_at: new Date()
            };
            base.findOne.mockResolvedValue(mockUser);

            // Call the function and check the result
            const result = await userRepository.findById(1);

            // Check that the result matches the mock user object
            expect(result).toEqual(mockUser);
            
            // Check that the base repository was called with the correct arguments
            expect(base.findOne).toHaveBeenCalledWith(
                expect.stringContaining('user_id = ?'),
                [1]
            );
        });

        it('should return null when ID does not exist', async () => {
            // Mock the base repository to return null
            base.findOne.mockResolvedValue(null);

            // Call the function and check the result
            const result = await userRepository.findById(999);

            // Check that the result is null
            expect(result).toBeNull();
        });
    });

    /**
     * deleteById tests
     * Purpose: Test the deleteById function of the userRepository
     * Success: Returns the affected rows count
     * Failure: Returns 0 when the ID does not exist
     */
    describe('deleteById', () => {
        it('should delete user and return affected rows count', async () => {
            // Mock the base repository to return the affected rows count
            base.modify.mockResolvedValue(1);

            // Call the function and check the result
            const result = await userRepository.deleteById(1);

            // Check that the result matches the mock affected rows count
            expect(result).toBe(1);
            
            // Check that the base repository was called with the correct arguments
            expect(base.modify).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM Users'),
                [1]
            );
        });

        it('should return 0 when user does not exist', async () => {
            // Mock the base repository to return 0
            base.modify.mockResolvedValue(0);

            // Call the function and check the result
            const result = await userRepository.deleteById(999);

            // Check that the result is 0
            expect(result).toBe(0);
        });
    });
});
