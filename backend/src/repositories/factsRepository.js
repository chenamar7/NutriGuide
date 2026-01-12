const base = require('./baseRepository');

/**
 * Facts Repository
 * Handles all daily facts database operations
 */

/**
 * Get a random fact (optionally filtered by category)
 */
const findRandom = async (category) => {
    // Build SQL query dynamically
    let sql = `
        SELECT * 
        FROM Daily_Facts`;
    let params = [];

    // Add category condition if provided
    if (category) {
        sql += ` WHERE category = ?`;
        params.push(category);
    }

    // Add randomness to the query
    sql += ` ORDER BY RAND() LIMIT 1`;

    // Execute query and return first result
    return await base.findOne(sql, params);
};

/**
 * Get all facts (optionally filtered by category)
 */
const findAll = async (category) => {
    // Build SQL query dynamically
    let sql = `
        SELECT * 
        FROM Daily_Facts`;
    let params = [];

    // Add category condition if provided
    if (category) {
        sql += ` WHERE category = ?`;
        params.push(category);
    }

    sql += ` ORDER BY category, fact_id`;

    return await base.findAll(sql, params);
};

/**
 * Get all available categories with count
 */
const findAllCategories = async () => {
    return await base.findAll(`
        SELECT DISTINCT category, COUNT(*) as count 
        FROM Daily_Facts 
        GROUP BY category 
        ORDER BY category
    `);
};

/**
 * Get fact by ID
 */
const findById = async (factId) => {
    return await base.findOne(`
        SELECT * 
        FROM Daily_Facts 
        WHERE fact_id = ?`,
        [factId]
    );
};

module.exports = {
    findRandom,
    findAll,
    findAllCategories,
    findById
};

