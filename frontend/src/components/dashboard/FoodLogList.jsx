import React from 'react';

/**
 * FoodLogList Component
 * 
 * Displays a list of foods logged today.
 * Clean, professional look without emojis.
 * 
 * Usage:
 *   <FoodLogList foods={foodList} onAddFood={() => setModalOpen(true)} />
 */

export const FoodLogList = ({ foods = [], onAddFood }) => {
    // Helper to format macros
    const formatMacros = (food) => {
        return `${food.protein}g Protein • ${food.carbs}g Carbs • ${food.fat}g Fat`;
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#FAFAF8'
            }}>
                <h3 style={{
                    margin: 0,
                    color: '#374151',
                    fontSize: '18px',
                    fontWeight: '700'
                }}>
                    Today's Food Log
                </h3>
                <span style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    fontWeight: '500',
                    backgroundColor: '#E5E7EB',
                    padding: '4px 10px',
                    borderRadius: '20px'
                }}>
                    {foods.length} items
                </span>
            </div>

            {/* List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 8px'
            }}>
                {foods.length === 0 ? (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#9CA3AF'
                    }}>
                        No foods logged today.
                    </div>
                ) : (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {foods.map((food, index) => (
                            <li key={index} style={{
                                padding: '16px 16px',
                                borderBottom: index < foods.length - 1 ? '1px solid #F3F4F6' : 'none',
                                transition: 'background-color 0.2s',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '4px'
                                }}>
                                    <div>
                                        <div style={{
                                            fontWeight: '600',
                                            color: '#1F2937',
                                            fontSize: '16px'
                                        }}>
                                            {food.name}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: '#6B7280',
                                            marginTop: '2px'
                                        }}>
                                            {food.amount}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontWeight: '700',
                                        color: '#16A34A',
                                        fontSize: '15px'
                                    }}>
                                        {food.calories} kcal
                                    </div>
                                </div>

                                {/* Macro details */}
                                <div style={{
                                    fontSize: '12px',
                                    color: '#8B5A2B',
                                    fontWeight: '500',
                                    opacity: 0.8
                                }}>
                                    {formatMacros(food)}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Footer - Add Food Button */}
            {onAddFood && (
                <div style={{
                    padding: '16px',
                    borderTop: '1px solid #F3F4F6',
                    backgroundColor: '#FAFAF8'
                }}>
                    <button
                        onClick={onAddFood}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #8B5A2B 0%, #6B4423 100%)',
                            color: 'white',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 90, 43, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>+</span>
                        Add Food
                    </button>
                </div>
            )}
        </div>
    );
};
