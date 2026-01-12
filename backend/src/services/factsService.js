const factsRepository = require('../repositories/factsRepository');

/**
 * Get a random fact (optionally filtered by category)
 */
const getRandomFact = async (category) => {
    const fact = await factsRepository.findRandom(category);

    // No facts found- throw error
    if (!fact) {
        throw new Error('No facts found');
    }

    return fact;
};

/**
 * Get all facts (optionally filtered by category)
 */
const getAllFacts = async (category) => {
    return await factsRepository.findAll(category);
};

/**
 * Get all available categories with count
 */
const getCategories = async () => {
    return await factsRepository.findAllCategories();
};

/**
 * Get fact by ID
 */
const getFactById = async (factId) => {
    // Validation
    if (!factId) {
        throw new Error('Fact ID is required');
    }

    const fact = await factsRepository.findById(factId);

    // No fact found- throw error
    if (!fact) {
        throw new Error('Fact not found');
    }

    return fact;
};

module.exports = {
    getRandomFact,
    getAllFacts,
    getCategories,
    getFactById
};
