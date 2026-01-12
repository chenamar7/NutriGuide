import api from './client';

/**
 * Profile API
 * 
 * User profile data and target calculations
 */

/**
 * Get user's profile with nutrition targets
 * @returns {Promise<Object>} Profile data
 */
export const getProfile = async () => {
    const { data } = await api.get('/profile');
    return data.profile;
};

/**
 * Update user's profile
 * @param {Object} profileData - Profile fields to update
 * @returns {Promise<Object>} Updated profile
 */
export const updateProfile = async (profileData) => {
    const { data } = await api.put('/profile', profileData);
    return data.profile;
};

/**
 * Calculate nutrition targets based on profile
 * @returns {Promise<Object>} Calculated targets
 */
export const calculateTargets = async () => {
    const { data } = await api.post('/profile/calculate');
    return data;
};
