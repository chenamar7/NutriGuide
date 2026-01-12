import React from 'react';

/**
 * Loading Component
 * 
 * Colorful gradient spinner with green and brown
 * 
 * Usage:
 *   <Loading />
 *   <Loading size="lg" text="Loading..." />
 */

export const Loading = ({ size = 'md', text = '' }) => {
    const sizes = {
        sm: { width: 28, border: 4 },
        md: { width: 44, border: 5 },
        lg: { width: 60, border: 6 }
    };

    const { width, border } = sizes[size] || sizes.md;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '20px'
        }}>
            {/* Gradient Spinner Container */}
            <div style={{
                width: `${width}px`,
                height: `${width}px`,
                borderRadius: '50%',
                background: `conic-gradient(
                    from 0deg,
                    #22C55E 0deg,
                    #16A34A 90deg,
                    #8B5A2B 180deg,
                    #6B4423 270deg,
                    #22C55E 360deg
                )`,
                animation: 'spin 1s linear infinite',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
            }}>
                {/* Inner white circle to create ring effect */}
                <div style={{
                    width: `${width - border * 2}px`,
                    height: `${width - border * 2}px`,
                    borderRadius: '50%',
                    backgroundColor: '#FAFAF8'
                }} />
            </div>

            {/* Text */}
            {text && (
                <p style={{
                    color: '#16A34A',
                    fontSize: '14px',
                    fontWeight: '600',
                    margin: 0,
                    letterSpacing: '0.5px'
                }}>
                    {text}
                </p>
            )}

            {/* Animation keyframes */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
