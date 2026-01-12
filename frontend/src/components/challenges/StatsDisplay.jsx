import React from 'react';

/**
 * StatsDisplay Component - Vertical sidebar version
 * Clean, professional design without emojis
 */
export const StatsDisplay = ({ score = 0, currentStreak = 0, bestStreak = 0 }) => {
    const statItems = [
        {
            label: 'Total Score',
            value: score,
            color: 'var(--color-brown)',
            bgColor: 'var(--color-brown-subtle)'
        },
        {
            label: 'Current Streak',
            value: currentStreak,
            color: 'var(--color-green-dark)',
            bgColor: 'var(--color-green-subtle)'
        },
        {
            label: 'Best Streak',
            value: bestStreak,
            color: '#B45309',
            bgColor: '#FEF3C7'
        },
    ];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '4px'
            }}>
                Your Stats
            </h3>
            {statItems.map(stat => (
                <div
                    key={stat.label}
                    style={{
                        backgroundColor: stat.bgColor,
                        borderRadius: '12px',
                        padding: '16px 20px',
                        border: `1px solid ${stat.color}20`
                    }}
                >
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px'
                    }}>
                        {stat.label}
                    </div>
                    <div style={{
                        fontSize: '28px',
                        fontWeight: '700',
                        color: stat.color,
                        lineHeight: 1
                    }}>
                        {stat.value}
                    </div>
                </div>
            ))}
        </div>
    );
};