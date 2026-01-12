import React from 'react';

/**
 * MacroStatsBar Component
 * 
 * Compact horizontal display of macro progress
 */

export const MacroStatsBar = ({ totals = {}, targets = {} }) => {
    const safeTotal = (key) => Number(totals[key]) || 0;
    const safeTarget = (key, defaultVal) => Number(targets[key]) || defaultVal;

    const macros = [
        { 
            key: 'calories', 
            label: 'Calories', 
            value: safeTotal('calories'), 
            target: safeTarget('calories', 2000), 
            unit: 'kcal',
            icon: '🔥',
            color: '#16A34A'
        },
        { 
            key: 'protein', 
            label: 'Protein', 
            value: safeTotal('protein'), 
            target: safeTarget('protein', 125), 
            unit: 'g',
            icon: '🥩',
            color: '#DC2626'
        },
        { 
            key: 'carbs', 
            label: 'Carbs', 
            value: safeTotal('carbs'), 
            target: safeTarget('carbs', 250), 
            unit: 'g',
            icon: '🍞',
            color: '#EA580C'
        },
        { 
            key: 'fat', 
            label: 'Fat', 
            value: safeTotal('fat'), 
            target: safeTarget('fat', 70), 
            unit: 'g',
            icon: '🥑',
            color: '#65A30D'
        }
    ];

    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            padding: '12px 16px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
        }}>
            {macros.map((macro) => {
                const rawPercentage = macro.target > 0 ? (macro.value / macro.target) * 100 : 0;
                const percentage = Math.min(Math.round(rawPercentage), 100);
                const displayPercentage = Math.round(rawPercentage);
                const isOver = rawPercentage > 100;
                
                return (
                    <div 
                        key={macro.key}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '10px 8px',
                            borderRadius: '8px',
                            background: `${macro.color}08`
                        }}
                    >
                        {/* Icon & Label */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '12px' }}>{macro.icon}</span>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                color: '#6B7280',
                                textTransform: 'uppercase'
                            }}>
                                {macro.label}
                            </span>
                        </div>

                        {/* Value */}
                        <div style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: macro.color,
                            lineHeight: 1
                        }}>
                            {Math.round(macro.value)}
                            <span style={{ 
                                fontSize: '11px', 
                                fontWeight: '500',
                                opacity: 0.7
                            }}>
                                {macro.unit}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                            width: '100%',
                            height: '4px',
                            borderRadius: '2px',
                            background: '#E5E7EB',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${percentage}%`,
                                height: '100%',
                                borderRadius: '2px',
                                background: isOver ? '#EF4444' : macro.color,
                                transition: 'width 0.3s ease'
                            }} />
                        </div>

                        {/* Target */}
                        <div style={{
                            fontSize: '9px',
                            color: '#9CA3AF'
                        }}>
                            <span style={{ fontWeight: '600', color: isOver ? '#EF4444' : macro.color }}>
                                {displayPercentage}%
                            </span>
                            {' '}of {macro.target}{macro.unit}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
