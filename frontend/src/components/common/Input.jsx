import React from 'react';

/**
 * Input Component
 * 
 * Styled form input with label, green/brown theme
 * 
 * Usage:
 *   <Input label="Email" type="email" placeholder="Enter email" />
 *   <Input label="Password" type="password" error="Required" />
 */

export const Input = ({
    label,
    error,
    className = '',
    id,
    ...rest
}) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div style={{ marginBottom: '24px' }} className={className}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={inputId}
                    style={{
                        display: 'block',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#16A34A',
                        marginBottom: '8px',
                        letterSpacing: '0.5px'
                    }}
                >
                    {label}
                </label>
            )}

            {/* Input Box */}
            <input
                id={inputId}
                style={{
                    width: '100%',
                    padding: '14px 16px',
                    fontSize: '15px',
                    border: error ? '2px solid #EF4444' : '2px solid #E5E7EB',
                    borderRadius: '10px',
                    backgroundColor: '#FAFAFA',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = '#22C55E';
                    e.target.style.backgroundColor = '#F0FDF4';
                    e.target.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.15)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = error ? '#EF4444' : '#E5E7EB';
                    e.target.style.backgroundColor = '#FAFAFA';
                    e.target.style.boxShadow = 'none';
                }}
                {...rest}
            />

            {/* Error Message */}
            {error && (
                <p style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    color: '#EF4444',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <span>⚠️</span> {error}
                </p>
            )}
        </div>
    );
};
