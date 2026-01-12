import React from 'react';

/**
 * DailyFactCard Component
 * 
 * Displays a random nutrition fact with a faded brown theme
 * 
 * Usage:
 *   <DailyFactCard fact="Vitamin D is produced when your skin is exposed to sunlight" category="Vitamins" />
 */

export const DailyFactCard = ({ fact, category = 'Nutrition' }) => {
    if (!fact) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #F5E6D3 0%, #EDE0D4 50%, #E6D5C3 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '2px solid #D4C4B0',
            boxShadow: '0 4px 12px rgba(139, 90, 43, 0.1)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative background element */}
            <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                fontSize: '120px',
                opacity: 0.08,
                transform: 'rotate(15deg)'
            }}>
                💡
            </div>

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px'
            }}>
                <span style={{ fontSize: '28px' }}>💡</span>
                <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#6B4423'
                }}>
                    Did you know?
                </h3>
            </div>

            {/* Fact text */}
            <p style={{
                margin: 0,
                fontSize: '16px',
                lineHeight: '1.6',
                color: '#5D4037',
                fontWeight: '500'
            }}>
                {fact}
            </p>

            {/* Category badge */}
            <div style={{
                marginTop: '16px',
                display: 'inline-block',
                padding: '6px 14px',
                backgroundColor: 'rgba(139, 90, 43, 0.15)',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#8B5A2B'
            }}>
                📚 {category}
            </div>
        </div>
    );
};
