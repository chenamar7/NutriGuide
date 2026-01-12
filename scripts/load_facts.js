/**
 * Script to load nutrition facts into the Daily_Facts table
 * Run: node scripts/load_facts.js
 */

const path = require('path');
const fs = require('fs');

// Use backend's node_modules
const mysql = require(path.join(__dirname, '../backend/node_modules/mysql2/promise'));
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ 
    path: path.join(__dirname, '../backend/.env') 
});

const loadFacts = async () => {
    console.log(' Loading nutrition facts into database...\n');

    // Create connection
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nutri_guide_db'
    });

    try {
        // Read facts from JSON file
        const factsPath = path.join(__dirname, 'facts_data.json');
        const factsData = JSON.parse(fs.readFileSync(factsPath, 'utf8'));

        console.log(` Found ${factsData.length} facts to load\n`);

        // Clear existing facts (optional - comment out to append instead)
        await connection.execute('DELETE FROM Daily_Facts');
        console.log('  Cleared existing facts\n');

        // Insert facts
        let inserted = 0;
        const categoryCounts = {};

        for (const fact of factsData) {
            await connection.execute(
                'INSERT INTO Daily_Facts (fact_text, category) VALUES (?, ?)',
                [fact.fact_text, fact.category]
            );
            inserted++;
            
            // Count by category
            categoryCounts[fact.category] = (categoryCounts[fact.category] || 0) + 1;
        }

        console.log(` Successfully inserted ${inserted} facts!\n`);
        console.log(' Facts by category:');
        console.log('─'.repeat(30));
        
        Object.entries(categoryCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`   ${category.padEnd(15)} ${count}`);
            });

        console.log('─'.repeat(30));
        console.log(`   ${'TOTAL'.padEnd(15)} ${inserted}\n`);

    } catch (error) {
        console.error(' Error loading facts:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
        console.log(' Database connection closed');
    }
};

loadFacts();

