import React from 'react';

/**
 * OptionButton Component - Quiz answer option
 * 
 * Props:
 *   - text: the answer text
 *   - isSelected: is this option currently selected?
 *   - isCorrect: after reveal, was this the correct answer?
 *   - isWrong: after reveal, was this selected but wrong?
 *   - isRevealed: has the answer been revealed?
 *   - onClick: handler when clicked
 *   - disabled: prevent clicks (after answering)
 *   - optionLabel: A, B, C, D label
 */
export const OptionButton = ({ 
    text, 
    isSelected = false, 
    isCorrect = false, 
    isWrong = false,
    isRevealed = false,
    onClick, 
    disabled = false,
    optionLabel = 'A'
}) => {
    // Determine styling based on state
    const getStyles = () => {
        const base = {
            width: '100%',
            padding: '16px 20px',
            borderRadius: '12px',
            border: '2px solid',
            cursor: disabled ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '16px',
            fontWeight: '500',
            textAlign: 'left',
            transition: 'all 0.2s ease',
            opacity: disabled && !isSelected && !isCorrect ? 0.6 : 1,
        };

        // After answer revealed
        if (isRevealed) {
            if (isCorrect) {
                return {
                    ...base,
                    backgroundColor: '#DCFCE7',
                    borderColor: 'var(--color-green)',
                    color: 'var(--color-green-dark)',
                };
            }
            if (isWrong) {
                return {
                    ...base,
                    backgroundColor: '#FEE2E2',
                    borderColor: 'var(--color-danger)',
                    color: 'var(--color-danger)',
                };
            }
            // Not selected, not correct - dim it
            return {
                ...base,
                backgroundColor: '#F9FAFB',
                borderColor: '#E5E7EB',
                color: 'var(--color-text-muted)',
            };
        }

        // Before answer revealed
        if (isSelected) {
            return {
                ...base,
                backgroundColor: '#F0FDF4',
                borderColor: 'var(--color-green)',
                color: 'var(--color-green-dark)',
                transform: 'scale(1.02)',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)',
            };
        }

        // Default state
        return {
            ...base,
            backgroundColor: 'white',
            borderColor: '#E5E7EB',
            color: 'var(--color-text)',
        };
    };

    const getLabelStyles = () => {
        const base = {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '14px',
            flexShrink: 0,
        };

        if (isRevealed && isCorrect) {
            return { ...base, backgroundColor: 'var(--color-green)', color: 'white' };
        }
        if (isRevealed && isWrong) {
            return { ...base, backgroundColor: 'var(--color-danger)', color: 'white' };
        }
        if (isSelected) {
            return { ...base, backgroundColor: 'var(--color-green)', color: 'white' };
        }
        return { ...base, backgroundColor: '#F3F4F6', color: 'var(--color-text-muted)' };
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={getStyles()}
            onMouseEnter={(e) => {
                if (!disabled && !isSelected) {
                    e.currentTarget.style.borderColor = 'var(--color-green-light)';
                    e.currentTarget.style.backgroundColor = '#F9FAFB';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled && !isSelected) {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.backgroundColor = 'white';
                }
            }}
        >
            <span style={getLabelStyles()}>
                {isRevealed && isCorrect ? '✓' : isRevealed && isWrong ? '✗' : optionLabel}
            </span>
            <span style={{ flex: 1 }}>{text}</span>
        </button>
    );
};