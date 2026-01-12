/**
 * Load Challenges Script
 * Loads nutrition quiz challenges into the database
 * 
 * Run from project root: node scripts/load_challenges.js
 */

const path = require('path');
const fs = require('fs');

// Use modules from backend's node_modules
const backendNodeModules = path.join(__dirname, '..', 'backend', 'node_modules');

// Load environment variables from backend/.env
require(path.join(backendNodeModules, 'dotenv')).config({ 
    path: path.join(__dirname, '..', 'backend', '.env') 
});

const mysql = require(path.join(backendNodeModules, 'mysql2', 'promise'));

const loadChallenges = async () => {
    console.log('Loading nutrition challenges into database...\n');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nutri_guide_db'
    });

    try {
        // Load challenges data
        const challengesPath = path.join(__dirname, 'challenges_data.json');
        const challengesData = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));

        console.log(`Found ${challengesData.length} challenges to load\n`);

        // Clear existing data (delete options first due to foreign key)
        await connection.execute('DELETE FROM Challenge_Options');
        await connection.execute('DELETE FROM Challenges');
        console.log('Cleared existing challenges\n');

        let inserted = 0;

        for (const challenge of challengesData) {
            // Step 1: Insert the challenge with category (without correct_answer_id yet)
            const [challengeResult] = await connection.execute(
                `INSERT INTO Challenges (title, description, category) VALUES (?, ?, ?)`,
                [challenge.title, challenge.question, challenge.category]
            );
            const challengeId = challengeResult.insertId;

            // Step 2: Insert all options
            const optionIds = [];
            for (const optionText of challenge.options) {
                const [optionResult] = await connection.execute(
                    `INSERT INTO Challenge_Options (challenge_id, option_text) VALUES (?, ?)`,
                    [challengeId, optionText]
                );
                optionIds.push(optionResult.insertId);
            }

            // Step 3: Update challenge with correct_answer_id
            const correctOptionId = optionIds[challenge.correct];
            await connection.execute(
                `UPDATE Challenges SET correct_answer_id = ? WHERE challenge_id = ?`,
                [correctOptionId, challengeId]
            );

            inserted++;
        }

        console.log(`Successfully inserted ${inserted} challenges!\n`);
        
        // Show summary
        console.log('Challenges summary:');
        console.log('-'.repeat(40));
        
        const [summary] = await connection.execute(`
            SELECT 
                COUNT(*) as total_challenges,
                (SELECT COUNT(*) FROM Challenge_Options) as total_options
            FROM Challenges
        `);
        
        console.log(`Total challenges: ${summary[0].total_challenges}`);
        console.log(`Total options: ${summary[0].total_options}`);
        console.log(`Average options per challenge: ${(summary[0].total_options / summary[0].total_challenges).toFixed(1)}`);

        // Show category breakdown
        console.log('\nBy category:');
        const [categories] = await connection.execute(`
            SELECT category, COUNT(*) as count
            FROM Challenges
            GROUP BY category
            ORDER BY category
        `);
        for (const cat of categories) {
            console.log(`  ${cat.category}: ${cat.count}`);
        }

    } catch (error) {
        console.error('Error loading challenges:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
        console.log('\nDatabase connection closed');
    }
};

loadChallenges();

