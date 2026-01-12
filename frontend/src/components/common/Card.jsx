import React from 'react';

/**
 * Card Component
 * 
 * Container with white background, shadow, and hover effect
 * 
 * Variants:
 *   - default: gray border, subtle shadow
 *   - green: green border with green shadow
 *   - brown: brown border with brown shadow
 * 
 * Usage:
 *   <Card>Default card content</Card>
 *   <Card variant="green">Green accent card</Card>
 *   <Card variant="brown">Brown accent card</Card>
 */

export const Card = ({ children, variant = 'default', className = '' }) => {
    const variantClass = {
        default: 'card',
        green: 'card-green',
        brown: 'card-brown'
    };

    return (
        <div className={`${variantClass[variant] || 'card'} ${className}`}>
            {children}
        </div>
    );
};
