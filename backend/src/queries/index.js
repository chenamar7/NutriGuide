const fs = require('fs');
const path = require('path');
const foodFilters = require('../config/foodFilters');

/**
 * Query Loader
 * Loads SQL files and replaces placeholders with config values
 */

const queryCache = {};

/**
 * Load a SQL query from file
 * For foodOptimizer, replaces placeholders with config values
 */
const loadQuery = (queryName) => {
    // Check cache
    if (queryCache[queryName]) {
        return queryCache[queryName];
    }

    // Read file
    const filePath = path.join(__dirname, `${queryName}.sql`);
    let sql;
    
    try {
        sql = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        throw new Error(`Failed to load query '${queryName}': ${error.message}`);
    }

    // For foodOptimizer, replace placeholders with config values
    if (queryName === 'foodOptimizer') {
        sql = applyFoodFilters(sql);
    }

    // Cache and return
    queryCache[queryName] = sql;
    return sql;
};

/**
 * Replace placeholders in SQL with values from foodFilters config
 */
const applyFoodFilters = (sql) => {
    // Build categories list: 'Category1', 'Category2', ...
    const categories = foodFilters.allowedCategories
        .map(cat => `'${cat}'`)
        .join(', ');

    // Build blacklist conditions: AND LOWER(f.name) NOT LIKE '%word%'
    const blacklist = foodFilters.blacklistKeywords
        .map(word => `AND LOWER(f.name) NOT LIKE '%${word.toLowerCase()}%'`)
        .join('\n      ');

    // Replace all placeholders
    return sql
        .replaceAll('{{CATEGORIES}}', categories)
        .replaceAll('{{CAL_MIN}}', foodFilters.calorieRange.min)
        .replaceAll('{{CAL_MAX}}', foodFilters.calorieRange.max)
        .replaceAll('{{MAX_NAME_LEN}}', foodFilters.maxNameLength)
        .replaceAll('{{MIN_GAPS}}', foodFilters.minGapsAddressed)
        .replaceAll('{{LIMIT}}', foodFilters.maxRecommendations)
        .replaceAll('{{BLACKLIST}}', blacklist);
};

/**
 * Clear cache (useful if config changes at runtime)
 */
const clearCache = () => {
    Object.keys(queryCache).forEach(key => delete queryCache[key]);
};

module.exports = { loadQuery, clearCache };