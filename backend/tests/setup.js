/**
 * Global Test Setup
 * Common mock patterns and helpers for unit tests
 */

// Set test environment variables BEFORE any imports
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.NODE_ENV = 'test';

// Mock the database module to prevent real connections during tests
jest.mock('../src/config/db', () => ({
    pool: {
        query: jest.fn(),
        getConnection: jest.fn().mockResolvedValue({
            release: jest.fn()
        })
    },
    query: jest.fn()
}));

// Mock the queries/index module to prevent file system access
jest.mock('../src/queries/index', () => ({
    loadQuery: jest.fn().mockReturnValue('SELECT 1')
}));

// Suppress console output during tests (optional - comment out for debugging)
// global.console = {
//     ...console,
//     log: jest.fn(),
//     debug: jest.fn(),
//     info: jest.fn(),
//     warn: jest.fn()
// };
