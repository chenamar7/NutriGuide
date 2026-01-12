import React from 'react';

/**
 * StreakBadge Component
 * 
 * Shows user's food logging streak with dynamic visuals
 * - Low streak: Freezing/icy look ❄️
 * - High streak (7+): Maximum fire glow 🔥
 * 
 * Usage:
 *   <StreakBadge currentStreak={5} longestStreak={12} status="active" />
 */

export const StreakBadge = ({ currentStreak = 0, longestStreak = 0, status = 'active' }) => {
    // Visual intensity based on streak (0-7 scale, max at 7)
    const getIntensity = () => {
        if (currentStreak >= 7) return 'blazing';  // 7+ days - MAX FIRE
        if (currentStreak >= 5) return 'hot';      // 5-6 days
        if (currentStreak >= 3) return 'warm';     // 3-4 days
        if (currentStreak >= 1) return 'cold';     // 1-2 days
        return 'frozen';                            // 0 days - ICE
    };

    const intensity = getIntensity();

    const themes = {
        blazing: {
            gradient: 'linear-gradient(135deg, #F97316 0%, #EA580C 40%, #DC2626 100%)',
            emoji: '🔥',
            textColor: 'white',
            shadow: '0 4px 25px rgba(249, 115, 22, 0.5)',
            borderColor: 'rgba(255,255,255,0.3)',
            glow: true
        },
        hot: {
            gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
            emoji: '🔥',
            textColor: 'white',
            shadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
            borderColor: 'rgba(255,255,255,0.2)',
            glow: false
        },
        warm: {
            gradient: 'linear-gradient(135deg, #A67C52 0%, #8B5A2B 50%, #6B4423 100%)',
            emoji: '🔥',
            textColor: 'white',
            shadow: '0 4px 12px rgba(139, 90, 43, 0.3)',
            borderColor: 'rgba(255,255,255,0.15)',
            glow: false
        },
        cold: {
            gradient: 'linear-gradient(135deg, #94A3B8 0%, #64748B 50%, #475569 100%)',
            emoji: '🥶',
            textColor: 'white',
            shadow: '0 4px 12px rgba(100, 116, 139, 0.3)',
            borderColor: 'rgba(255,255,255,0.1)',
            glow: false
        },
        frozen: {
            gradient: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 50%, #7DD3FC 100%)',
            emoji: '❄️',
            textColor: '#1E40AF',
            shadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
            borderColor: 'rgba(30, 64, 175, 0.2)',
            glow: false
        }
    };

    const theme = themes[intensity];

    const getMessage = () => {
        if (status !== 'active' && currentStreak === 0) return "Log today to thaw your streak!";
        if (intensity === 'blazing') return "Maximum streak power! 🔥";
        if (intensity === 'hot') return "You're on fire!";
        if (intensity === 'warm') return "Keep it going!";
        if (intensity === 'cold') return "Warming up...";
        return "Start logging to heat up!";
    };

    return (
        <div style={{
            background: theme.gradient,
            borderRadius: '10px',
            padding: '16px 18px',
            color: theme.textColor,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.borderColor}`
        }}>
            {/* Background emoji */}
            <div style={{
                position: 'absolute',
                top: '-5px',
                right: '5px',
                fontSize: '70px',
                opacity: 0.15,
                filter: theme.glow ? 'drop-shadow(0 0 20px rgba(255,200,0,0.8))' : 'none'
            }}>
                {theme.emoji}
            </div>

            {/* Main content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Streak display */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                }}>
                    <span style={{
                        fontSize: '40px',
                        filter: theme.glow ? 'drop-shadow(0 0 12px rgba(255,200,0,0.6))' : 'none',
                        animation: theme.glow ? 'pulse 1.5s ease-in-out infinite' : 'none'
                    }}>
                        {theme.emoji}
                    </span>
                    <div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            lineHeight: 1
                        }}>
                            {currentStreak}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            opacity: 0.9
                        }}>
                            day logging streak
                        </div>
                    </div>
                </div>

                {/* Message */}
                <div style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    opacity: 0.85,
                    marginBottom: '12px'
                }}>
                    {getMessage()}
                </div>

                {/* Stats row */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    paddingTop: '12px',
                    borderTop: `1px solid ${theme.borderColor}`
                }}>
                    <div>
                        <div style={{ fontSize: '18px', fontWeight: '700' }}>
                            🏆 {longestStreak}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: '500' }}>
                            Best Streak
                        </div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            {currentStreak >= 3 ? (
                                <><span style={{ color: '#4ADE80' }}>●</span> Active</>
                            ) : (
                                <><span style={{ color: intensity === 'frozen' ? '#0a0a0aff' : '#F87171' }}>●</span> {intensity === 'frozen' ? 'Inactive' : 'Building...'}</>
                            )}
                        </div>
                        <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: '500' }}>
                            Status
                        </div>
                    </div>
                </div>
            </div>

            {/* Pulse animation for blazing */}
            {theme.glow && (
                <style>{`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.1); }
                    }
                `}</style>
            )}
        </div>
    );
};
