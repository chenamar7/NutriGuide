const { query } = require('../config/db');
const { loadQuery } = require('../queries/index');

/**
 * Base Repository
 * Provides database query execution methods
 * All repositories use these helpers for consistent DB access
 * 
 * This abstraction makes it easy to switch databases:
 * - Only this layer needs changes for different DB drivers
 * - SQL dialect differences can be handled here
 * - Services remain unchanged when switching databases
 */

/**
 * Execute a raw SQL query
 */
const execute = async (sql, params = []) => {
    return await query(sql, params);
};

/**
 * Execute a SQL query from a .sql file
 */
const executeFromFile = async (queryName, params = []) => {
    const sql = loadQuery(queryName);
    return await query(sql, params);
};

/**
 * Execute a query and return the first row
 * Returns null if no results
 */
const findOne = async (sql, params = []) => {
    const results = await query(sql, params);
    return results.length > 0 ? results[0] : null;
};

/**
 * Execute a query and return all rows
 */
const findAll = async (sql, params = []) => {
    return await query(sql, params);
};

/**
 * Insert a record and return the inserted ID
 */
const insert = async (sql, params = []) => {
    const result = await query(sql, params);
    return result.insertId;
};

/**
 * Update or Delete and return affected rows count
 */
const modify = async (sql, params = []) => {
    const result = await query(sql, params);
    return result.affectedRows;
};

module.exports = {
    execute,
    executeFromFile,
    findOne,
    findAll,
    insert,
    modify
};

