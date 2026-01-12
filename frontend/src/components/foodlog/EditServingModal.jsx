import React, { useState, useEffect } from 'react';

/**
 * EditServingModal Component
 * 
 * Modal for editing the serving size of a logged food entry
 */

export const EditServingModal = ({ isOpen, entry, onSave, onClose }) => {
    const [servingSize, setServingSize] = useState(100);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (entry) {
            setServingSize(entry.serving_size_grams);
        }
    }, [entry]);

    const handleSave = async () => {
        if (servingSize < 1) {
            setError('Serving size must be at least 1g');
            return;
        }

        try {
            setSaving(true);
            setError('');
            await onSave(entry.log_id, servingSize);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !entry) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 999,
                    animation: 'fadeIn 0.2s ease'
                }}
            />

            {/* Modal */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                maxWidth: '90vw',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'scaleIn 0.2s ease'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--color-brown) 0%, var(--color-brown-dark) 100%)',
                    padding: '20px 24px',
                    color: 'white'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        ✏️ Edit Serving Size
                    </h3>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    {/* Food Info */}
                    <div style={{
                        padding: '16px',
                        background: 'var(--color-brown-subtle)',
                        borderRadius: '12px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'var(--color-brown-dark)',
                            marginBottom: '4px'
                        }}>
                            {entry.food_name || entry.name}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: 'var(--color-text-muted)'
                        }}>
                            Current: {entry.serving_size_grams}g • {Math.round(entry.calories)} kcal
                        </div>
                    </div>

                    {/* Input */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: 'var(--color-brown-dark)',
                            fontSize: '14px'
                        }}>
                            New serving size (grams)
                        </label>
                        <input
                            type="number"
                            value={servingSize}
                            onChange={(e) => setServingSize(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '2px solid var(--color-border)',
                                fontSize: '18px',
                                fontWeight: '600',
                                textAlign: 'center',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-brown)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        />
                    </div>

                    {/* Quick Buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '20px'
                    }}>
                        {[50, 100, 150, 200, 250].map(size => (
                            <button
                                key={size}
                                onClick={() => setServingSize(size)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: servingSize === size 
                                        ? '2px solid var(--color-brown)'
                                        : '1px solid var(--color-border)',
                                    background: servingSize === size 
                                        ? 'var(--color-brown-subtle)'
                                        : 'white',
                                    fontSize: '13px',
                                    fontWeight: servingSize === size ? '600' : '400',
                                    color: 'var(--color-brown-dark)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {size}g
                            </button>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#FEE2E2',
                            borderRadius: '10px',
                            color: '#DC2626',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid var(--color-border)',
                    display: 'flex',
                    gap: '12px',
                    background: '#FAFAFA'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '12px',
                            border: '2px solid var(--color-border)',
                            background: 'white',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            flex: 2,
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'linear-gradient(135deg, var(--color-brown) 0%, var(--color-brown-dark) 100%)',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'white',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        {saving ? 'Saving...' : '💾 Save Changes'}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
            `}</style>
        </>
    );
};

