const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const profileRepository = require('../repositories/profileRepository');

/**
 * Register new user
 * Creates user account and empty profile
 */
const register = async (username, email, password) => {
    // Validation
    if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
    }
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }

    // Check for existing user
    const userExists = await userRepository.existsByEmailOrUsername(email, username);
    if (userExists) {
        throw new Error('User with this email or username already exists');
    }

    // Hash password with bcrypt (salt is auto-generated)
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into database
    const userId = await userRepository.create(username, email, passwordHash);

    // Create empty profile for user to fill later
    await profileRepository.create(userId);

    return { userId, username, email };
};

/**
 * Login user
 * Validates credentials and returns JWT token
 */
const login = async (email, password) => {
    // Validation
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    // Get user from database
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
        throw new Error('Invalid email or password');
    }

    // Generate JWT with user info in payload
    const token = jwt.sign(
        {
            userId: user.user_id,
            username: user.username,
            isAdmin: user.is_admin === 1
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    return {
        token,
        user: {
            userId: user.user_id,
            username: user.username,
            email: user.email,
            isAdmin: user.is_admin === 1
        }
    };
};

/**
 * Get current user info
 * userId is from decoded JWT token
 */
const getCurrentUser = async (userId) => {
    // Get user from database
    const user = await userRepository.findById(userId);

    // Validation
    if (!user) {
        throw new Error('User not found');
    }

    // Return user info
    return {
        userId: user.user_id,
        username: user.username,
        email: user.email,
        isAdmin: user.is_admin === 1,
        createdAt: user.created_at
    };
};

/**
 * Delete user account (admin only)
 * Related data (profile, logs) deleted via ON DELETE CASCADE
 */
const deleteUser = async (userId) => {
    if (!userId) {
        throw new Error('User ID is required');
    }

    const rowsDeleted = await userRepository.deleteById(userId);

    if (rowsDeleted === 0) {
        throw new Error('User not found');
    }

    return { message: 'User and all related data deleted successfully' };
};

module.exports = {
    register,
    login,
    getCurrentUser,
    deleteUser
};
