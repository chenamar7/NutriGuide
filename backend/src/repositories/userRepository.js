const base = require('./baseRepository');

/**
 * User Repository
 * Handles all user-related database operations
 */

/**
 * Find user by email
 */
const findByEmail = async (email) => {
    return await base.findOne(`
        SELECT user_id, username, email, password_hash, is_admin 
        FROM Users 
        WHERE email = ?`,
        [email]
    );
};

/**
 * Find user by username
 */
const findByUsername = async (username) => {
    return await base.findOne(`
        SELECT user_id, username, email, password_hash, is_admin 
        FROM Users 
        WHERE username = ?`,
        [username]
    );
};

/**
 * Check if user exists by email or username
 */
const existsByEmailOrUsername = async (email, username) => {
    const result = await base.findOne(`
        SELECT user_id 
        FROM Users 
        WHERE email = ? OR username = ?`,
        [email, username]
    );
    return result !== null;
};

/**
 * Create new user
 * Returns the new user_id
 */
const create = async (username, email, passwordHash) => {
    return await base.insert(`
        INSERT INTO Users (username, email, password_hash, created_at, is_admin) 
        VALUES (?, ?, ?, NOW(), FALSE)`,
        [username, email, passwordHash]
    );
};

/**
 * Find user by ID
 */
const findById = async (userId) => {
    return await base.findOne(`
        SELECT user_id, username, email, is_admin, created_at 
        FROM Users 
        WHERE user_id = ?`,
        [userId]
    );
};

/**
 * Delete user by ID
 * Returns number of rows deleted
 */
const deleteById = async (userId) => {
    return await base.modify(`
        DELETE FROM Users 
        WHERE user_id = ?`,
        [userId]
    );
};

module.exports = {
    findByEmail,
    findByUsername,
    existsByEmailOrUsername,
    create,
    findById,
    deleteById
};

