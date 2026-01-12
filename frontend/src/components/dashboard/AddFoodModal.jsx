import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import * as foodsApi from '../../api/foods';
import * as logApi from '../../api/log';

/**
 * AddFoodModal Component
 * 
 * Slide-out modal for searching and logging foods
 * Brown color theme
 */

export const AddFoodModal = ({ isOpen, onClose, onFoodLogged }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [servingSize, setServingSize] = useState(100);
    const [logging, setLogging] = useState(false);
    const [error, setError] = useState('');

    const debouncedQuery = useDebounce(searchQuery, 300);

    // Search foods when query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            searchFoods(debouncedQuery);
        } else {
            setSearchResults([]);
        }
    }, [debouncedQuery]);

    const searchFoods = async (query) => {
        try {
            setLoading(true);
            const result = await foodsApi.searchFoods({ query, limit: 10 });
            setSearchResults(result.foods || []);
        } catch (err) {
            console.error('Search error:', err);
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFood = (food) => {
        setSelectedFood(food);
        setSearchQuery('');
        setSearchResults([]);
        setServingSize(100);
    };

    const handleLogFood = async () => {
        if (!selectedFood) return;

        try {
            setLogging(true);
            setError('');
            await logApi.logFood(selectedFood.food_id, servingSize);

            // Reset and notify parent
            setSelectedFood(null);
            setServingSize(100);
            onFoodLogged && onFoodLogged();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to log food');
        } finally {
            setLogging(false);
        }
    };

    const handleCancel = () => {
        setSelectedFood(null);
        setSearchQuery('');
        setSearchResults([]);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={handleCancel}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 999
                }}
            />

            {/* Modal Panel */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '400px',
                maxWidth: '90vw',
                height: '100vh',
                backgroundColor: 'white',
                boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideIn 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #8B5A2B 0%, #6B4423 100%)',
                    padding: '20px 24px',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                            🍽️ Add Food
                        </h2>
                        <button
                            onClick={handleCancel}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: 'none',
                                color: 'white',
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '18px'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
                    {/* Search Input */}
                    {!selectedFood && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#6B4423'
                            }}>
                                Search Foods
                            </label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type to search (e.g., apple, chicken)..."
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '2px solid #E5D5C3',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#8B5A2B'}
                                onBlur={(e) => e.target.style.borderColor = '#E5D5C3'}
                                autoFocus
                            />
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#8B5A2B' }}>
                            Searching...
                        </div>
                    )}

                    {/* Search Results */}
                    {!selectedFood && searchResults.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                            {searchResults.map((food) => (
                                <div
                                    key={food.food_id}
                                    onClick={() => handleSelectFood(food)}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid #E5D5C3',
                                        marginBottom: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        backgroundColor: '#FAFAF8'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#F5E6D3';
                                        e.currentTarget.style.borderColor = '#8B5A2B';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#FAFAF8';
                                        e.currentTarget.style.borderColor = '#E5D5C3';
                                    }}
                                >
                                    <div style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                        {food.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#8B5A2B', marginTop: '4px' }}>
                                        {food.category_name || 'General'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && searchQuery.length >= 2 && searchResults.length === 0 && !selectedFood && (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>
                            No foods found. Try a different search.
                        </div>
                    )}

                    {/* Selected Food */}
                    {selectedFood && (
                        <div>
                            <div style={{
                                padding: '16px',
                                borderRadius: '12px',
                                backgroundColor: '#F5E6D3',
                                border: '2px solid #8B5A2B',
                                marginBottom: '20px'
                            }}>
                                <div style={{ fontWeight: '700', color: '#6B4423', fontSize: '16px' }}>
                                    {selectedFood.name}
                                </div>
                                <div style={{ fontSize: '13px', color: '#8B5A2B', marginTop: '4px' }}>
                                    {selectedFood.category_name || 'General'}
                                </div>
                                <button
                                    onClick={() => setSelectedFood(null)}
                                    style={{
                                        marginTop: '8px',
                                        padding: '6px 12px',
                                        backgroundColor: 'transparent',
                                        border: '1px solid #8B5A2B',
                                        borderRadius: '6px',
                                        color: '#8B5A2B',
                                        cursor: 'pointer',
                                        fontSize: '12px'
                                    }}
                                >
                                    Change food
                                </button>
                            </div>

                            {/* Serving Size */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '600',
                                    color: '#6B4423'
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
                                        padding: '12px 16px',
                                        borderRadius: '10px',
                                        border: '2px solid #E5D5C3',
                                        fontSize: '15px',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
                                {/* Quick buttons */}
                                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                    {[50, 100, 150, 200].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setServingSize(size)}
                                            style={{
                                                flex: 1,
                                                padding: '8px',
                                                borderRadius: '8px',
                                                border: servingSize === size ? '2px solid #8B5A2B' : '1px solid #E5D5C3',
                                                backgroundColor: servingSize === size ? '#F5E6D3' : 'white',
                                                color: '#6B4423',
                                                cursor: 'pointer',
                                                fontWeight: servingSize === size ? '600' : '400'
                                            }}
                                        >
                                            {size}g
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#FEE2E2',
                                    borderRadius: '8px',
                                    color: '#DC2626',
                                    marginBottom: '16px',
                                    fontSize: '14px'
                                }}>
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {selectedFood && (
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #E5D5C3',
                        backgroundColor: '#FAFAF8'
                    }}>
                        <button
                            onClick={handleLogFood}
                            disabled={logging}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #8B5A2B 0%, #6B4423 100%)',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: logging ? 'not-allowed' : 'pointer',
                                opacity: logging ? 0.7 : 1
                            }}
                        >
                            {logging ? 'Logging...' : `✓ Log ${servingSize}g`}
                        </button>
                    </div>
                )}
            </div>

            {/* Animation */}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </>
    );
};
