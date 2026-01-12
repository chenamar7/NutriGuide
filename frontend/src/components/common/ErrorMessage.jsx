import React from 'react';

/**
 * ErrorMessage Component
 * 
 * Eye-catching error/warning alert with yellow background and icon
 * 
 * Usage:
 *   <ErrorMessage message="Something went wrong" />
 */

export const ErrorMessage = ({ message, className = '' }) => {
    if (!message) return null;

    return (
        <div
            className={className}
            style={{
                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                border: '2px solid #F59E0B',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                animation: 'shake 0.5s ease-in-out'
            }}
        >
            <span style={{
                fontSize: '24px',
                flexShrink: 0
            }}>
                ⚠️
            </span>
            <span style={{
                color: '#92400E',
                fontWeight: '500',
                fontSize: '15px'
            }}>
                {message}
            </span>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
                    20%, 40%, 60%, 80% { transform: translateX(2px); }
                }
            `}</style>
        </div>
    );
};
