import React, { useState } from 'react';

/**
 * SuggestionsModal Component
 * 
 * Modal displaying smart food suggestions based on nutrient gaps
 */

export const SuggestionsModal = ({
    isOpen,
    onClose,
    recommendations = [],
    gaps = {},
    loading = false,
    onQuickAdd
}) => {
    const [addingFood, setAddingFood] = useState(null);
    const [selectedServings, setSelectedServings] = useState({});

    const handleServingSelect = (foodId, size) => {
        setSelectedServings(prev => ({ ...prev, [foodId]: size }));
    };

    const handleQuickAdd = async (food) => {
        const serving = selectedServings[food.food_id] || 100;
        setAddingFood(food.food_id);
        try {
            await onQuickAdd(food.food_id, serving);
        } finally {
            setAddingFood(null);
        }
    };

    if (!isOpen) return null;

    const gapList = Object.entries(gaps).filter(([_, value]) => value > 0);
    const hasGaps = gapList.length > 0;

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
                width: '500px',
                maxWidth: '95vw',
                maxHeight: '85vh',
                backgroundColor: 'white',
                borderRadius: '24px',
                boxShadow: '0 25px 80px rgba(0,0,0,0.25)',
                zIndex: 1000,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                animation: 'scaleIn 0.25s ease'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%)',
                    padding: '24px 28px',
                    color: 'white'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h2 style={{
                                margin: 0,
                                fontSize: '22px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                ✨ Smart Suggestions
                            </h2>
                            <p style={{
                                margin: '6px 0 0 0',
                                fontSize: '14px',
                                opacity: 0.9
                            }}>
                                Foods to help fill your nutrition gaps
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    padding: '24px 28px'
                }}>
                    {loading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: 'var(--color-text-muted)'
                        }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                margin: '0 auto 16px',
                                border: '4px solid var(--color-green-subtle)',
                                borderTopColor: 'var(--color-green)',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            <p style={{ margin: 0, fontSize: '15px' }}>
                                Analyzing your nutrition gaps...
                            </p>
                        </div>
                    ) : !hasGaps ? (
                        /* All Targets Met */
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px'
                        }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                margin: '0 auto 20px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-green-subtle) 0%, #D1FAE5 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '50px'
                            }}>
                                🎯
                            </div>
                            <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '22px',
                                fontWeight: '700',
                                color: 'var(--color-green-dark)'
                            }}>
                                Amazing work!
                            </h3>
                            <p style={{
                                margin: 0,
                                fontSize: '15px',
                                color: 'var(--color-text-muted)'
                            }}>
                                You've met all your macro targets for today!
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Gap Summary */}
                            <div style={{
                                padding: '16px 20px',
                                background: 'var(--color-brown-subtle)',
                                borderRadius: '16px',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: 'var(--color-brown-dark)',
                                    marginBottom: '10px'
                                }}>
                                    📊 Still needed today:
                                </div>
                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '10px'
                                }}>
                                    {gapList.map(([nutrient, value]) => (
                                        <span
                                            key={nutrient}
                                            style={{
                                                padding: '8px 14px',
                                                background: 'white',
                                                borderRadius: '20px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                color: 'var(--color-brown-dark)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            {Math.round(value)}g {nutrient}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {recommendations.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🥗</div>
                                    <p style={{ margin: 0 }}>
                                        No specific recommendations right now.<br />
                                        Try logging more foods!
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}>
                                    {recommendations.slice(0, 6).map((food) => {
                                        const currentServing = selectedServings[food.food_id] || 100;
                                        const isAdding = addingFood === food.food_id;

                                        return (
                                            <div
                                                key={food.food_id}
                                                style={{
                                                    padding: '20px',
                                                    borderRadius: '16px',
                                                    border: '2px solid var(--color-border)',
                                                    background: 'white',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--color-green)';
                                                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(34, 197, 94, 0.15)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                                    e.currentTarget.style.boxShadow = 'none';
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'start',
                                                    marginBottom: '12px'
                                                }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{
                                                            fontSize: '16px',
                                                            fontWeight: '600',
                                                            color: 'var(--color-text)',
                                                            marginBottom: '4px'
                                                        }}>
                                                            {food.name}
                                                        </div>
                                                        <div style={{
                                                            fontSize: '13px',
                                                            color: 'var(--color-text-muted)'
                                                        }}>
                                                            {food.category_name}
                                                        </div>
                                                    </div>
                                                    {food.efficiency_score && (
                                                        <div style={{
                                                            padding: '4px 10px',
                                                            background: 'var(--color-green-subtle)',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            color: 'var(--color-green-dark)'
                                                        }}>
                                                            {Math.min(Math.round(food.efficiency_score * 100 / 3), 100)}% match
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Serving + Add Row */}
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '12px',
                                                    alignItems: 'center'
                                                }}>
                                                    {/* Serving Buttons */}
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '6px',
                                                        flex: 1
                                                    }}>
                                                        {[50, 100, 150].map(size => (
                                                            <button
                                                                key={size}
                                                                onClick={() => handleServingSelect(food.food_id, size)}
                                                                style={{
                                                                    padding: '8px 12px',
                                                                    borderRadius: '8px',
                                                                    border: currentServing === size
                                                                        ? '2px solid var(--color-green)'
                                                                        : '1px solid var(--color-border)',
                                                                    background: currentServing === size
                                                                        ? 'var(--color-green-subtle)'
                                                                        : 'white',
                                                                    fontSize: '13px',
                                                                    fontWeight: currentServing === size ? '600' : '400',
                                                                    color: 'var(--color-text)',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {size}g
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Add Button */}
                                                    <button
                                                        onClick={() => handleQuickAdd(food)}
                                                        disabled={isAdding}
                                                        style={{
                                                            padding: '10px 20px',
                                                            borderRadius: '10px',
                                                            border: 'none',
                                                            background: 'linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%)',
                                                            color: 'white',
                                                            fontSize: '14px',
                                                            fontWeight: '600',
                                                            cursor: isAdding ? 'not-allowed' : 'pointer',
                                                            opacity: isAdding ? 0.7 : 1,
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        {isAdding ? '...' : `+ Add`}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 28px',
                    borderTop: '1px solid var(--color-border)',
                    background: '#FAFAFA',
                    textAlign: 'center'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '14px 40px',
                            borderRadius: '12px',
                            border: '2px solid var(--color-border)',
                            background: 'white',
                            fontSize: '15px',
                            fontWeight: '600',
                            color: 'var(--color-text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        Close
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
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

