import React from 'react';
import { FoodEntryCard } from './FoodEntryCard';

/**
 * MealSection Component
 * 
 * Sharp, refined meal groupings with clean headers
 */

const MEAL_CONFIG = {
    morning: { 
        label: 'Breakfast', 
        icon: '☀️', 
        color: '#F59E0B',
        timeRange: '5am - 11am'
    },
    lunch: { 
        label: 'Lunch', 
        icon: '🌤️', 
        color: '#16A34A',
        timeRange: '11am - 2pm'
    },
    afternoon: { 
        label: 'Afternoon', 
        icon: '🌅', 
        color: '#3B82F6',
        timeRange: '2pm - 5pm'
    },
    dinner: { 
        label: 'Dinner', 
        icon: '🌙', 
        color: '#7C3AED',
        timeRange: '5pm - 9pm'
    },
    lateNight: { 
        label: 'Late Night', 
        icon: '🌃', 
        color: '#6366F1',
        timeRange: '9pm - 5am'
    }
};

export const MealSection = ({ mealType, entries, onEdit, onDelete }) => {
    const config = MEAL_CONFIG[mealType] || MEAL_CONFIG.lunch;

    if (entries.length === 0) return null;

    const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0);

    return (
        <div style={{ marginBottom: '28px' }}>
            {/* Meal Header - Sharp Line Design */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '14px',
                paddingBottom: '10px',
                borderBottom: '2px solid #F3F4F6'
            }}>
                {/* Icon Badge */}
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: `${config.color}15`,
                    border: `1px solid ${config.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                }}>
                    {config.icon}
                </div>

                {/* Label & Time */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: config.color,
                        letterSpacing: '-0.3px'
                    }}>
                        {config.label}
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: '#9CA3AF',
                        fontWeight: '500'
                    }}>
                        {config.timeRange}
                    </div>
                </div>

                {/* Total Calories Badge */}
                <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: config.color,
                    background: `${config.color}10`,
                    border: `1px solid ${config.color}25`,
                    padding: '6px 12px',
                    borderRadius: '6px'
                }}>
                    {Math.round(totalCalories)} kcal
                </div>
            </div>

            {/* Food Entries */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {entries.map((entry) => (
                    <FoodEntryCard
                        key={entry.log_id}
                        entry={entry}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </div>
    );
};
