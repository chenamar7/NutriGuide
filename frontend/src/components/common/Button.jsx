import React from 'react';

/**
 * Button Component
 * 
 * Reusable button with variants: primary (green gradient) and secondary (brown)
 * 
 * Usage:
 *   <Button>Get Started</Button>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button disabled>Loading...</Button>
 */

export const Button = ({
    variant = 'primary',
    children,
    className = '',
    disabled = false,
    type = 'button',
    ...rest
}) => {
    const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

    return (
        <button
            type={type}
            className={`${baseClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={disabled}
            {...rest}
        >
            {children}
        </button>
    );
};
