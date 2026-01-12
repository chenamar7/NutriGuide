import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import * as foodsApi from '../../api/foods';
import * as logApi from '../../api/log';

/**
 * AddFoodLogModal Component
 * 
 * Centered modal for adding food to the log
 * Includes meal time selection (Breakfast, Lunch, Afternoon, Dinner, Late Night)
 */

const MEAL_OPTIONS = [
    { value: 'morning', label: 'Breakfast', icon: '☀️', time: '5am - 11am' },
    { value: 'lunch', label: 'Lunch', icon: '🌤️', time: '11am - 2pm' },
    { value: 'afternoon', label: 'Afternoon', icon: '🌅', time: '2pm - 5pm' },
    { value: 'dinner', label: 'Dinner', icon: '🌙', time: '5pm - 9pm' },
    { value: 'lateNight', label: 'Late Night', icon: '🌃', time: '9pm - 5am' }
];

export const AddFoodLogModal = ({ isOpen, onClose, onFoodLogged, selectedDate }) => {
    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const debouncedSearch = useDebounce(searchQuery, 300);

    // Selected food state
    const [selectedFood, setSelectedFood] = useState(null);
    const [servingSize, setServingSize] = useState(100);
    const [mealType, setMealType] = useState('lunch');

    // Submission state
    const [logging, setLogging] = useState(false);
    const [error, setError] = useState('');

    // Search when query changes
    useEffect(() => {
        if (debouncedSearch.length >= 2) {
            setSearchLoading(true);
            foodsApi.searchFoods({ query: debouncedSearch, limit: 10 })
                .then(result => setSearchResults(result.foods || []))
                .catch(() => setSearchResults([]))
                .finally(() => setSearchLoading(false));
        } else {
            setSearchResults([]);
        }
    }, [debouncedSearch]);

    // Set default meal type based on current time
    useEffect(() => {
        if (isOpen) {
            const hour = new Date().getHours();
            if (hour >= 6 && hour < 11) setMealType('morning');
            else if (hour >= 11 && hour < 15) setMealType('lunch');
            else if (hour >= 15 && hour < 18) setMealType('afternoon');
            else if (hour >= 18 && hour < 22) setMealType('dinner');
            else setMealType('lateNight');
        }
    }, [isOpen]);

    const handleSelectFood = (food) => {
        setSelectedFood(food);
        setSearchQuery('');
        setSearchResults([]);
        setServingSize(100);
        setError('');
    };

    const handleLogFood = async () => {
        if (!selectedFood) return;

        try {
            setLogging(true);
            setError('');
            
            // Build datetime with meal time
            const dateTime = logApi.buildMealDateTime(selectedDate, mealType);
            await logApi.logFood(selectedFood.food_id, servingSize, dateTime);

            // Reset and close
            resetModal();
            onFoodLogged && onFoodLogged(mealType);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to log food');
        } finally {
            setLogging(false);
        }
    };

    const resetModal = () => {
        setSelectedFood(null);
        setSearchQuery('');
        setSearchResults([]);
        setServingSize(100);
        setError('');
    };

    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleClose}
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
                width: '520px',
                maxWidth: '95vw',
                maxHeight: '90vh',
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
                        <h2 style={{
                            margin: 0,
                            fontSize: '22px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            🍽️ Add Food to Log
                        </h2>
                        <button
                            onClick={handleClose}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
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
                    {/* Step 1: Search or Selected Food */}
                    {!selectedFood ? (
                        <>
                            {/* Search Input */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontWeight: '600',
                                    color: 'var(--color-green-dark)',
                                    fontSize: '14px'
                                }}>
                                    Search for a food
                                </label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Type to search (e.g., chicken, apple, rice)..."
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '16px 20px',
                                        borderRadius: '14px',
                                        border: '2px solid var(--color-border)',
                                        fontSize: '16px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--color-green)';
                                        e.target.style.boxShadow = '0 0 0 4px rgba(34, 197, 94, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--color-border)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Loading */}
                            {searchLoading && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    Searching...
                                </div>
                            )}

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                                <div style={{
                                    maxHeight: '300px',
                                    overflow: 'auto',
                                    borderRadius: '14px',
                                    border: '1px solid var(--color-border)'
                                }}>
                                    {searchResults.map((food, index) => (
                                        <div
                                            key={food.food_id}
                                            onClick={() => handleSelectFood(food)}
                                            style={{
                                                padding: '16px 20px',
                                                cursor: 'pointer',
                                                borderBottom: index < searchResults.length - 1 ? '1px solid #F3F4F6' : 'none',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--color-green-subtle)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'white';
                                            }}
                                        >
                                            <div style={{
                                                fontWeight: '600',
                                                color: 'var(--color-text)',
                                                fontSize: '15px',
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
                                    ))}
                                </div>
                            )}

                            {/* No Results */}
                            {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                                    No foods found. Try a different search term.
                                </div>
                            )}

                            {/* Initial State */}
                            {searchQuery.length < 2 && searchResults.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: 'var(--color-text-muted)'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🥗</div>
                                    <p style={{ margin: 0 }}>
                                        Start typing to search from 7,000+ foods
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Selected Food Display */}
                            <div style={{
                                padding: '20px',
                                background: 'var(--color-green-subtle)',
                                borderRadius: '16px',
                                marginBottom: '24px',
                                border: '2px solid var(--color-green)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start'
                                }}>
                                    <div>
                                        <div style={{
                                            fontSize: '18px',
                                            fontWeight: '700',
                                            color: 'var(--color-green-dark)',
                                            marginBottom: '4px'
                                        }}>
                                            {selectedFood.name}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            {selectedFood.category_name}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedFood(null)}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--color-green)',
                                            background: 'white',
                                            color: 'var(--color-green-dark)',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>

                            {/* Serving Size */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontWeight: '600',
                                    color: 'var(--color-brown-dark)',
                                    fontSize: '14px'
                                }}>
                                    Serving Size (grams)
                                </label>
                                <input
                                    type="number"
                                    value={servingSize}
                                    onChange={(e) => setServingSize(Math.max(1, parseInt(e.target.value) || 1))}
                                    min="1"
                                    style={{
                                        width: '100%',
                                        padding: '16px 20px',
                                        borderRadius: '14px',
                                        border: '2px solid var(--color-border)',
                                        fontSize: '20px',
                                        fontWeight: '600',
                                        textAlign: 'center',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {/* Quick Serving Buttons */}
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginTop: '12px'
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
                                                    ? '2px solid var(--color-green)'
                                                    : '1px solid var(--color-border)',
                                                background: servingSize === size
                                                    ? 'var(--color-green-subtle)'
                                                    : 'white',
                                                fontSize: '14px',
                                                fontWeight: servingSize === size ? '600' : '400',
                                                color: 'var(--color-text)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {size}g
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Meal Type Selection */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '10px',
                                    fontWeight: '600',
                                    color: 'var(--color-brown-dark)',
                                    fontSize: '14px'
                                }}>
                                    When did you eat this?
                                </label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(5, 1fr)',
                                    gap: '8px'
                                }}>
                                    {MEAL_OPTIONS.map(meal => (
                                        <button
                                            key={meal.value}
                                            onClick={() => setMealType(meal.value)}
                                            style={{
                                                padding: '12px 8px',
                                                borderRadius: '12px',
                                                border: mealType === meal.value
                                                    ? '2px solid var(--color-green)'
                                                    : '1px solid var(--color-border)',
                                                background: mealType === meal.value
                                                    ? 'var(--color-green-subtle)'
                                                    : 'white',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: '4px',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ fontSize: '20px' }}>{meal.icon}</span>
                                            <span style={{
                                                fontSize: '11px',
                                                fontWeight: mealType === meal.value ? '600' : '500',
                                                color: mealType === meal.value 
                                                    ? 'var(--color-green-dark)' 
                                                    : 'var(--color-text-muted)'
                                            }}>
                                                {meal.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px 16px',
                                    backgroundColor: '#FEE2E2',
                                    borderRadius: '10px',
                                    color: '#DC2626',
                                    fontSize: '14px'
                                }}>
                                    {error}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {selectedFood && (
                    <div style={{
                        padding: '20px 28px',
                        borderTop: '1px solid var(--color-border)',
                        background: '#FAFAFA',
                        display: 'flex',
                        gap: '12px'
                    }}>
                        <button
                            onClick={handleClose}
                            style={{
                                flex: 1,
                                padding: '16px',
                                borderRadius: '14px',
                                border: '2px solid var(--color-border)',
                                background: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'var(--color-text-muted)',
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLogFood}
                            disabled={logging}
                            style={{
                                flex: 2,
                                padding: '16px',
                                borderRadius: '14px',
                                border: 'none',
                                background: 'linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%)',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: 'white',
                                cursor: logging ? 'not-allowed' : 'pointer',
                                opacity: logging ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                            }}
                        >
                            {logging ? 'Adding...' : `✓ Add ${servingSize}g to Log`}
                        </button>
                    </div>
                )}
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

