import React, { useState } from 'react';

/**
 * DeleteConfirmModal Component
 * 
 * Confirmation dialog before deleting a food log entry
 */

export const DeleteConfirmModal = ({ isOpen, entry, onConfirm, onClose }) => {
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await onConfirm(entry.log_id);
            onClose();
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setDeleting(false);
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
                width: '380px',
                maxWidth: '90vw',
                backgroundColor: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'scaleIn 0.2s ease'
            }}>
                {/* Content */}
                <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                    {/* Icon */}
                    <div style={{
                        width: '64px',
                        height: '64px',
                        margin: '0 auto 20px',
                        borderRadius: '50%',
                        background: '#FEE2E2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px'
                    }}>
                        🗑️
                    </div>

                    {/* Title */}
                    <h3 style={{
                        margin: '0 0 12px 0',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#DC2626'
                    }}>
                        Delete Entry?
                    </h3>

                    {/* Message */}
                    <p style={{
                        margin: '0 0 8px 0',
                        fontSize: '15px',
                        color: 'var(--color-text-muted)'
                    }}>
                        Are you sure you want to remove:
                    </p>

                    {/* Food Info */}
                    <div style={{
                        padding: '16px',
                        background: '#FEF2F2',
                        borderRadius: '12px',
                        marginBottom: '8px'
                    }}>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: 'var(--color-text)',
                            marginBottom: '4px'
                        }}>
                            {entry.food_name || entry.name}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            color: 'var(--color-text-muted)'
                        }}>
                            {entry.serving_size_grams}g • {Math.round(entry.calories)} kcal
                        </div>
                    </div>

                    <p style={{
                        margin: 0,
                        fontSize: '13px',
                        color: '#9CA3AF'
                    }}>
                        This action cannot be undone.
                    </p>
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
                        onClick={handleDelete}
                        disabled={deleting}
                        style={{
                            flex: 1,
                            padding: '14px',
                            borderRadius: '12px',
                            border: 'none',
                            background: '#DC2626',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'white',
                            cursor: deleting ? 'not-allowed' : 'pointer',
                            opacity: deleting ? 0.7 : 1
                        }}
                    >
                        {deleting ? 'Deleting...' : '🗑️ Delete'}
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

