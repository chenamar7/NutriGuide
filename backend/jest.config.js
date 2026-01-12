/**
 * Jest Configuration
 * Unit testing setup for NutriGuide backend
 */
module.exports = {
    // Use Node test environment
    testEnvironment: 'node',

    // Test file patterns
    testMatch: [
        '**/tests/unit/**/*.test.js'
    ],

    // Setup file for global mocks and helpers
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Coverage configuration
    collectCoverageFrom: [
        'src/services/**/*.js',
        'src/repositories/**/*.js',
        '!src/repositories/baseRepository.js'
    ],

    // Coverage output directory
    coverageDirectory: 'coverage',

    // Clear mocks between tests
    clearMocks: true,

    // Verbose output for better debugging
    verbose: true
};
