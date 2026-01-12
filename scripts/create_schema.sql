-- ######################################################################
-- # NUTRI-GUIDE DATABASE SCHEMA (SQL Script for MySQL)
-- # Team: Omri Nahum & Chen Amar (Computer Science Workshop)
-- # Goal: Educational nutrition web application.
-- # Data Strategy: SR Legacy Foods & Grams-Only Logging.
-- ######################################################################

-- Database Creation and Selection
CREATE DATABASE IF NOT EXISTS nutri_guide_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nutri_guide_db;

-- ======================================================================
-- DROP EXISTING TABLES (for clean re-installation)
-- Order matters due to foreign key constraints
-- ======================================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Challenge_Options;
DROP TABLE IF EXISTS Challenges;
DROP TABLE IF EXISTS Daily_Facts;
DROP TABLE IF EXISTS User_Food_Log;
DROP TABLE IF EXISTS User_Profiles;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Food_Nutrients;
DROP TABLE IF EXISTS Foods;
DROP TABLE IF EXISTS Nutrients;
DROP TABLE IF EXISTS Food_Categories;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------
-- 1. CORE LAYER: USDA DATA (Source of truth for food and nutrients)
-- ----------------------------------------------------------------------

-- 1.1. Food_Categories (Dictionary Table)
-- Uses USDA's curated 28 food categories from SR Legacy dataset.
CREATE TABLE Food_Categories (
    category_id INT PRIMARY KEY,
    category_name VARCHAR(255) NOT NULL COMMENT 'e.g., Dairy and Egg Products, Fruits and Fruit Juices'
);

-- 1.2. Nutrients (Dictionary Table for relevant nutrients)
-- Only 34 filtered nutrients are loaded here.
CREATE TABLE Nutrients (
    nutrient_id INT PRIMARY KEY,
    nutrient_name VARCHAR(255) NOT NULL COMMENT 'e.g., Protein, Vitamin C',
    unit_name VARCHAR(50) NOT NULL COMMENT 'e.g., g, mg, ug'
);

-- 1.3. Foods (The main list of food items)
-- Generic food items from USDA SR Legacy dataset (7,793 curated foods).
CREATE TABLE Foods (
    food_id INT PRIMARY KEY COMMENT 'Maps to USDA FDC ID',
    name VARCHAR(255) NOT NULL COMMENT 'Food item name (e.g., Milk, whole, 3.25% milkfat)',
    food_category_id INT,
    FOREIGN KEY (food_category_id) REFERENCES Food_Categories(category_id),
    -- Index for search queries
    INDEX idx_foods_name (name)
);

-- 1.4. Food_Nutrients (The massive M:M linking table)
-- This table is crucial for meeting the 100K+ record requirement.
CREATE TABLE Food_Nutrients (
    food_nutrient_id INT PRIMARY KEY AUTO_INCREMENT COMMENT 'Surrogate Key for optimized query performance on a large table',
    food_id INT NOT NULL,
    nutrient_id INT NOT NULL,
    amount_per_100g DECIMAL(10, 3) NOT NULL COMMENT 'Nutrient value per 100g/mL (grams-only standard)',
    FOREIGN KEY (food_id) REFERENCES Foods(food_id),
    FOREIGN KEY (nutrient_id) REFERENCES Nutrients(nutrient_id),
    -- Constraint to prevent duplicate nutrient entries for the same food
    UNIQUE KEY uk_food_nutrient (food_id, nutrient_id)
);


-- ----------------------------------------------------------------------
-- 2. APPLICATION LAYER: USER DATA
-- ----------------------------------------------------------------------

-- 2.1. Users (Authentication and basic user details)
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password storage',
    created_at DATETIME NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'TRUE for admin users, FALSE for regular users'
);

-- 2.2. User_Profiles (1:1 relationship with Users)
-- Uses ENUM for data integrity in calculation fields.
CREATE TABLE User_Profiles (
    user_id INT PRIMARY KEY,
    birth_date DATE,
    gender ENUM('Male', 'Female', 'Other') COMMENT 'Restricted values for calculations',
    height_cm INT CHECK (height_cm > 0),
    weight_kg DECIMAL(5, 2) CHECK (weight_kg > 0),
    activity_level ENUM('Light', 'Moderate', 'Heavy') COMMENT 'BMR calculation factor',
    goal ENUM('Maintain', 'Loss', 'Gain') COMMENT 'Dietary goal',
    target_calories INT CHECK (target_calories > 0),
    target_protein_g INT,
    target_carbs_g INT,
    target_fat_g INT,
    -- Gamification: Challenge progress tracking
    challenge_score INT DEFAULT 0 COMMENT 'Total correct answers',
    challenge_streak INT DEFAULT 0 COMMENT 'Current consecutive correct answers',
    best_streak INT DEFAULT 0 COMMENT 'Highest streak ever achieved',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- 2.3. User_Food_Log (Records user consumption)
-- All amounts are stored in grams, as per the design decision.
CREATE TABLE User_Food_Log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    food_id INT NOT NULL,
    date_eaten DATETIME NOT NULL,
    serving_size_grams DECIMAL(10, 2) NOT NULL CHECK (serving_size_grams > 0) COMMENT 'The amount consumed, entered by user in grams',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (food_id) REFERENCES Foods(food_id),
    -- Index for common query: get user's logs by date
    INDEX idx_user_date (user_id, date_eaten)
);

-- ----------------------------------------------------------------------
-- 3. CONTENT LAYER: EDUCATIONAL FEATURES
-- ----------------------------------------------------------------------

-- 3.1. Daily_Facts (Repository for educational facts)
CREATE TABLE Daily_Facts (
    fact_id INT PRIMARY KEY AUTO_INCREMENT,
    fact_text TEXT NOT NULL,
    category VARCHAR(50) COMMENT 'e.g., Iron, Vitamins'
);

-- 3.2. Challenges (The Quiz/Question itself)
-- Note: correct_answer_id references Challenge_Options, creating a circular dependency.
-- We include the column here but add the FK constraint after Challenge_Options is created.
CREATE TABLE Challenges (
    challenge_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL COMMENT 'The text of the multiple-choice question',
    category VARCHAR(50) COMMENT 'e.g., Vitamins, Minerals, Macros, Food Sources, General',
    correct_answer_id INT DEFAULT NULL COMMENT 'Points to the correct option_id (FK added below)'
);

-- 3.3. Challenge_Options (The possible answers for each Challenge)
CREATE TABLE Challenge_Options (
    option_id INT PRIMARY KEY AUTO_INCREMENT,
    challenge_id INT NOT NULL,
    option_text VARCHAR(255) NOT NULL COMMENT 'e.g., "Spinach", "Banana"',
    FOREIGN KEY (challenge_id) REFERENCES Challenges(challenge_id) ON DELETE CASCADE
);

-- 3.4. Add FK constraint from Challenges to Challenge_Options
-- (Must be done after both tables exist due to circular reference)
ALTER TABLE Challenges
ADD CONSTRAINT fk_correct_answer 
FOREIGN KEY (correct_answer_id) REFERENCES Challenge_Options(option_id)
ON DELETE SET NULL;







