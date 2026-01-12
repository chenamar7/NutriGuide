const profileRepository = require('../repositories/profileRepository');

/**
 * Get user profile
 */
const getProfile = async (userId) => {
    const profile = await profileRepository.findByUserId(userId);
    
    // No profile found- throw error
    if (!profile) {
        throw new Error('Profile not found');
    }
    
    return profile;
};

/**
 * Update user profile
 * Uses COALESCE to only update provided fields
 */
const updateProfile = async (userId, data) => {
    await profileRepository.update(userId, data);
    return getProfile(userId);
};

/**
 * Calculate and save macro targets
 * Uses Mifflin-St Jeor formula for BMR, then calculates TDEE and macros
 */
const calculateTargets = async (userId) => {
    const profile = await getProfile(userId);
    
    // Validation
    if (!profile.birth_date || !profile.gender || !profile.height_cm || !profile.weight_kg) {
        throw new Error('Please complete your profile first (birth_date, gender, height, weight)');
    }
    if (!profile.activity_level || !profile.goal) {
        throw new Error('Please set your activity level and goal first');
    }
    
    // Calculate precise age (accounting for month and day)
    const birthDate = new Date(profile.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;  // Birthday hasn't occurred yet this year
    }

    // BMR (Mifflin-St Jeor formula) which is the amount of calories needed to maintain the current weight
    let bmr;
    if (profile.gender === 'Male') {
        bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * age) + 5;
    } else {
        bmr = (10 * profile.weight_kg) + (6.25 * profile.height_cm) - (5 * age) - 161;
    }

    // TDEE = BMR × Activity Multiplier which is the amount of calories needed to maintain the current weight plus the activity level
    let tdee;
    switch (profile.activity_level) {
        case 'Light':    tdee = bmr * 1.375; break;
        case 'Moderate': tdee = bmr * 1.55;  break;
        case 'Heavy':    tdee = bmr * 1.725; break;
        default:         tdee = bmr * 1.55;
    }

    // Adjust calories for goal which is the amount of calories needed to maintain the current weight plus the activity level plus the goal
    let targetCalories;
    switch (profile.goal) {
        case 'Loss':     targetCalories = Math.round(tdee - 500); break;
        case 'Gain':     targetCalories = Math.round(tdee + 500); break;
        default:         targetCalories = Math.round(tdee);
    }

    // Calculate macros (protein 2g/kg, fat 0.9g/kg, carbs fill remaining)
    const proteinG = Math.round(profile.weight_kg * 2);
    const fatG = Math.round(profile.weight_kg * 0.9);
    // Prevent negative carbs if protein + fat calories exceed target
    const carbsG = Math.max(0, Math.round((targetCalories - (proteinG * 4) - (fatG * 9)) / 4));

    // Save to database
    await profileRepository.updateTargets(userId, targetCalories, proteinG, carbsG, fatG);

    return {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        target_calories: targetCalories,
        target_protein_g: proteinG,
        target_carbs_g: carbsG,
        target_fat_g: fatG
    };
};

module.exports = {
    getProfile,
    updateProfile,
    calculateTargets
};
