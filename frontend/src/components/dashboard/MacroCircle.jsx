import React from 'react';

/**
 * MacroCircle Component
 * 
 * Circular progress ring showing macro consumption vs target
 * Uses green/brown gradient like our Loading component
 * 
 * Usage:
 *   <MacroCircle label="Protein" consumed={75} target={100} unit="g" />
 */

export const MacroCircle = ({
    label,
    consumed = 0,
    target = 100,
    unit = 'g',
    size = 120,
    emoji = ''
}) => {
    // Calculate percentage (cap at 100%)
    const percentage = Math.min(Math.round((consumed / target) * 100), 100);

    // Circle dimensions
    const strokeWidth = 7;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Color based on percentage
    const getColor = () => {
        if (percentage >= 80) return '#22C55E'; // Green - on track
        if (percentage >= 50) return '#F59E0B'; // Yellow - getting there
        return '#8B5A2B'; // Brown - needs attention
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px'
        }}>
            {/* SVG Circle */}
            <div style={{ position: 'relative', width: size, height: size }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle with gradient */}
                    <defs>
                        <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#22C55E" />
                            <stop offset="50%" stopColor="#16A34A" />
                            <stop offset="100%" stopColor="#8B5A2B" />
                        </linearGradient>
                    </defs>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#gradient-${label})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>

                {/* Center text */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: getColor()
                    }}>
                        {percentage}%
                    </div>
                </div>
            </div>

            {/* Label */}
            <div style={{
                marginTop: '12px',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    {emoji && <span>{emoji}</span>}
                    {label}
                </div>
                <div style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    marginTop: '4px'
                }}>
                    {consumed}{unit} / {target}{unit}
                </div>
            </div>
        </div>
    );
};
