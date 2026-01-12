import api from './client';

/**
 * Auth API
 * 
 * User registration, login, and session management
 * Backend: /api/auth
 */

/**
 * Register a new user account
 * @param {string} username - Unique username (3-50 chars)
 * @param {string} email - Valid email address
 * @param {string} password - Password (min 6 chars)
 * @returns {Promise<Object>} { message, user }
 */
export const register = async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password });
    return data;
};

/**
 * Login with credentials
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} { token, user }
 */
export const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
};

/**
 * Get current logged-in user info
 * Requires valid JWT in localStorage
 * @returns {Promise<Object>} User object with id, username, email, isAdmin
 */
export const getMe = async () => {
    const { data } = await api.get('/auth/me');
    return data.user;
};

/**
 * Delete a user (admin only)
 * @param {number} userId - ID of user to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteUser = async (userId) => {
    const { data } = await api.delete(`/auth/${userId}`);
    return data;
};
