import React, { useState } from 'react';

/**
 * FoodEntryCard Component
 * 
 * Clean food entry row with inline macro display
 */

export const FoodEntryCard = ({ entry, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Simple food emoji based on name
    const getFoodEmoji = () => {
        const name = (entry.food_name || entry.name || '').toLowerCase();
        if (name.includes('chicken')) return '🍗';
        if (name.includes('beef') || name.includes('steak')) return '🥩';
        if (name.includes('fish') || name.includes('salmon')) return '🐟';
        if (name.includes('egg')) return '🥚';
        if (name.includes('bread')) return '🍞';
        if (name.includes('rice')) return '🍚';
        if (name.includes('pasta') || name.includes('noodle')) return '🍝';
        if (name.includes('salad') || name.includes('lettuce')) return '🥗';
        if (name.includes('apple')) return '🍎';
        if (name.includes('banana')) return '🍌';
        if (name.includes('orange')) return '🍊';
        if (name.includes('milk')) return '🥛';
        if (name.includes('cheese')) return '🧀';
        if (name.includes('pizza')) return '🍕';
        if (name.includes('burger')) return '🍔';
        if (name.includes('sandwich')) return '🥪';
        if (name.includes('soup')) return '🍲';
        if (name.includes('pie')) return '🥧';
        if (name.includes('cake') || name.includes('cookie')) return '🍪';
        if (name.includes('coffee')) return '☕';
        if (name.includes('tea')) return '🍵';
        return '🍽️';
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                background: isHovered ? '#FAFAFA' : 'white',
                borderRadius: '10px',
                border: `1px solid ${isHovered ? '#D1D5DB' : '#E5E7EB'}`,
                transition: 'all 0.15s ease'
            }}
        >
            {/* Food Emoji */}
            <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: '#F9FAFB',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0
            }}>
                {getFoodEmoji()}
            </div>

            {/* Food Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1F2937',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {entry.food_name || entry.name}
                </div>
                <div style={{
                    fontSize: '12px',
                    color: '#9CA3AF'
                }}>
                    {Math.round(entry.serving_size_grams || 100)}g
                </div>
            </div>

            {/* Macros - Inline Pills */}
            <div style={{
                display: 'flex',
                gap: '6px',
                alignItems: 'center'
            }}>
                {/* Calories */}
                <div style={{
                    background: '#16A34A',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    minWidth: '60px',
                    textAlign: 'center'
                }}>
                    <span style={{ fontSize: '14px', fontWeight: '700' }}>
                        {Math.round(entry.calories)}
                    </span>
                    <span style={{ fontSize: '9px', marginLeft: '2px', opacity: 0.85 }}>
                        cal
                    </span>
                </div>

                {/* P/C/F inline */}
                <div style={{
                    display: 'flex',
                    gap: '4px'
                }}>
                    <div style={{
                        background: '#FEF2F2',
                        color: '#DC2626',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        minWidth: '36px',
                        textAlign: 'center'
                    }}>
                        {Math.round(entry.protein_g || 0)}p
                    </div>
                    <div style={{
                        background: '#FFF7ED',
                        color: '#EA580C',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        minWidth: '36px',
                        textAlign: 'center'
                    }}>
                        {Math.round(entry.carbs_g || 0)}c
                    </div>
                    <div style={{
                        background: '#F7FEE7',
                        color: '#65A30D',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        minWidth: '36px',
                        textAlign: 'center'
                    }}>
                        {Math.round(entry.fat_g || 0)}f
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{
                display: 'flex',
                gap: '4px',
                opacity: isHovered ? 1 : 0,
                transition: 'opacity 0.15s ease'
            }}>
                <button
                    onClick={() => onEdit(entry)}
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F3F4F6';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                    }}
                    title="Edit"
                >
                    ✏️
                </button>
                <button
                    onClick={() => onDelete(entry)}
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: '1px solid #E5E7EB',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FEE2E2';
                        e.currentTarget.style.borderColor = '#EF4444';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                    }}
                    title="Delete"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};
