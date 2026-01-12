/**
 * Food Recommendation Filters Configuration
 * 
 * Edit these lists to improve recommendation quality.
 * The SQL query will use these values dynamically.
 */

module.exports = {
    // Keywords to exclude (foods containing these words are filtered out)
    blacklistKeywords: [
        'candy', 'soda', 'chips', 'fried', 'syrup', 'frosting', 'topping',
        'sauce', 'gravy', 'spread', 'dressing', 'dip', 'marinade',
        'powder', 'concentrate', 'dried', 'dehydrated',
        'butter', 'lard', 'shortening', 'margarine',
        'drink', 'beverage',
        'baby food', 'infant', 'formula',
        'imitation', 'artificial', 'supplement'
    ],

    // Calorie density range (kcal per 100g)
    calorieRange: { min: 80, max: 330 },

    // Max food name length (longer = more processed)
    maxNameLength: 80,

    // Minimum gaps a food must address
    minGapsAddressed: 2,

    // Whitelisted categories
    allowedCategories: [
        'Poultry Products',
        'Beef Products', 
        'Pork Products',
        'Lamb, Veal, and Game Products',
        'Finfish and Shellfish Products',
        'Vegetables and Vegetable Products',
        'Fruits and Fruit Juices',
        'Cereal Grains and Pasta',
        'Dairy and Egg Products',
        'Legumes and Legume Products',
        'Nut and Seed Products',
        'Meals, Entrees, and Side Dishes'
    ],

    // Max recommendations to return
    maxRecommendations: 10
};

