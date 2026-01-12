/**
 * NutriGuide Database Initialization Script
 * 
 * This script sets up the entire database from scratch:
 * 1. Creates all tables (drops existing ones)
 * 2. Loads USDA food data via ETL
 * 3. Loads nutrition facts
 * 4. Loads quiz challenges
 * 
 * Run from project root: node scripts/init_db_data.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Use modules from backend's node_modules
const backendNodeModules = path.join(__dirname, '..', 'backend', 'node_modules');
require(path.join(backendNodeModules, 'dotenv')).config({
    path: path.join(__dirname, '..', 'backend', '.env')
});
const mysql = require(path.join(backendNodeModules, 'mysql2', 'promise'));

const log = (msg) => console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
const logStep = (step, name) => {
    console.log('\n' + '='.repeat(50));
    console.log(`  STEP ${step}: ${name}`);
    console.log('='.repeat(50) + '\n');
};

const runCommand = (command, description) => {
    log(`Running: ${description}`);
    try {
        execSync(command, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            shell: true
        });
        log(`Completed: ${description}\n`);
        return true;
    } catch (error) {
        console.error(`Failed: ${description}`);
        console.error(error.message);
        return false;
    }
};

const initDatabase = async () => {
    console.log('\n' + '='.repeat(50));
    console.log('  NUTRI-GUIDE DATABASE INITIALIZATION');
    console.log('='.repeat(50));
    console.log('\nThis will DROP all existing tables and reload all data.\n');

    const startTime = Date.now();

    // ========================================
    // STEP 1: Create Schema
    // ========================================
    logStep(1, 'CREATE DATABASE SCHEMA');

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        const schemaPath = path.join(__dirname, 'create_schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        await connection.query(schemaSql);
        log('Schema created successfully!');

        // Verify tables
        const [tables] = await connection.query('SHOW TABLES FROM nutri_guide_db');
        log(`Created ${tables.length} tables`);

        await connection.end();
    } catch (error) {
        console.error('Failed to create schema:', error.message);
        process.exit(1);
    }

    // ========================================
    // STEP 2: Load USDA Data (ETL)
    // ========================================
    logStep(2, 'LOAD USDA FOOD DATA');

    if (!runCommand('python scripts/etl_sr_legacy.py', 'USDA ETL Script')) {
        console.error('\nETL failed! Make sure:');
        console.error('  1. Python is installed');
        console.error('  2. pandas and pymysql are installed (pip install pandas pymysql)');
        console.error('  3. USDA data files are in usda_data_sr_legacy/ folder');
        process.exit(1);
    }

    // ========================================
    // STEP 3: Load Facts
    // ========================================
    logStep(3, 'LOAD NUTRITION FACTS');

    if (!runCommand('node scripts/load_facts.js', 'Facts Loader')) {
        process.exit(1);
    }

    // ========================================
    // STEP 4: Load Challenges
    // ========================================
    logStep(4, 'LOAD QUIZ CHALLENGES');

    if (!runCommand('node scripts/load_challenges.js', 'Challenges Loader')) {
        process.exit(1);
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(50));
    console.log('  INITIALIZATION COMPLETE!');
    console.log('='.repeat(50));

    // Get final counts
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'nutri_guide_db'
        });

        const counts = {};
        const tables = ['Food_Categories', 'Nutrients', 'Foods', 'Food_Nutrients',
            'Daily_Facts', 'Challenges', 'Challenge_Options'];

        for (const table of tables) {
            const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
            counts[table] = rows[0].count;
        }

        console.log('\nDatabase Contents:');
        console.log('-'.repeat(40));
        console.log(`  Food Categories:    ${counts.Food_Categories}`);
        console.log(`  Nutrients:          ${counts.Nutrients}`);
        console.log(`  Foods:              ${counts.Foods.toLocaleString()}`);
        console.log(`  Food Nutrients:     ${counts.Food_Nutrients.toLocaleString()}`);
        console.log(`  Daily Facts:        ${counts.Daily_Facts}`);
        console.log(`  Challenges:         ${counts.Challenges}`);
        console.log(`  Challenge Options:  ${counts.Challenge_Options}`);
        console.log('-'.repeat(40));

        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        console.log(`  TOTAL RECORDS:      ${total.toLocaleString()}`);

        await connection.end();
    } catch (error) {
        console.error('Could not get summary:', error.message);
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nCompleted in ${elapsed} seconds`);
    console.log('\nYou can now start the backend: cd backend && npm start\n');
};

initDatabase();

