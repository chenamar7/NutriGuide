import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/common';
import {
    DateSlider,
    MacroStatsBar,
    FoodEntryCard,
    MealSection,
    AddFoodLogModal,
    SuggestionsModal,
    EditServingModal,
    DeleteConfirmModal
} from '../components/foodlog';
import { getMealTypeFromHour } from '../api/log';

import * as logApi from '../api/log';
import * as profileApi from '../api/profile';
import * as analysisApi from '../api/analysis';

/**
 * FoodLog Page
 * 
 * Full-featured food logging page with:
 * - Journal-style layout with the log as hero
 * - Date navigation
 * - Meal time groupings
 * - Smart suggestions modal
 * - Full CRUD (add, edit, delete)
 */

const FoodLog = () => {
    const { user } = useAuth();

    // Get today's date
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    // Date state
    const [selectedDate, setSelectedDate] = useState(getTodayDate());

    // Log data
    const [logEntries, setLogEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Targets
    const [targets, setTargets] = useState({
        calories: 2000,
        protein: 125,
        carbs: 250,
        fat: 70
    });

    // Recommendations (for suggestions modal)
    const [recommendations, setRecommendations] = useState([]);
    const [gaps, setGaps] = useState({});
    const [recsLoading, setRecsLoading] = useState(false);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSuggestionsModalOpen, setIsSuggestionsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState(null);
    const [deletingEntry, setDeletingEntry] = useState(null);

    // Meal type for newly added food (passed from modal)
    const [lastMealType, setLastMealType] = useState('lunch');

    // Calculate totals from log entries
    const totals = useMemo(() => {
        return logEntries.reduce((acc, entry) => ({
            calories: acc.calories + (Number(entry.calories) || 0),
            protein: acc.protein + (Number(entry.protein_g) || 0),
            carbs: acc.carbs + (Number(entry.carbs_g) || 0),
            fat: acc.fat + (Number(entry.fat_g) || 0)
        }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }, [logEntries]);

    // Group entries by meal time based on the hour in date_eaten
    const entriesByMeal = useMemo(() => {
        const groups = {
            morning: [],
            lunch: [],
            afternoon: [],
            dinner: [],
            lateNight: []
        };

        logEntries.forEach((entry) => {
            // Parse the time from date_eaten
            let hour = 12; // default to lunch
            if (entry.date_eaten) {
                const date = new Date(entry.date_eaten);
                hour = date.getHours();
            }

            const mealType = getMealTypeFromHour(hour);
            groups[mealType].push(entry);
        });

        return groups;
    }, [logEntries])

    // Fetch log entries for selected date
    const fetchLogEntries = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const logs = selectedDate === getTodayDate()
                ? await logApi.getTodayLog()
                : await logApi.getLogByDate(selectedDate);

            setLogEntries(logs || []);
        } catch (err) {
            console.error('Error fetching log:', err);
            setError('Failed to load food log');
            setLogEntries([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    // Fetch profile targets
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await profileApi.getProfile();
                if (profile?.target_calories) {
                    setTargets({
                        calories: profile.target_calories,
                        protein: profile.target_protein_g || 125,
                        carbs: profile.target_carbs_g || 250,
                        fat: profile.target_fat_g || 70
                    });
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };
        fetchProfile();
    }, []);

    // Fetch log when date changes
    useEffect(() => {
        fetchLogEntries();
    }, [fetchLogEntries]);

    // Fetch recommendations when suggestions modal opens
    const fetchRecommendations = async () => {
        if (selectedDate !== getTodayDate()) {
            setRecommendations([]);
            setGaps({});
            return;
        }

        try {
            setRecsLoading(true);
            const data = await analysisApi.getRecommendations();
            setRecommendations(data.recommendations || []);
            setGaps(data.gaps || {});
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            setRecommendations([]);
            setGaps({});
        } finally {
            setRecsLoading(false);
        }
    };

    // Open suggestions modal and fetch data
    const handleOpenSuggestions = () => {
        setIsSuggestionsModalOpen(true);
        fetchRecommendations();
    };

    // Handle food logged from modal
    const handleFoodLogged = (mealType) => {
        setLastMealType(mealType);
        fetchLogEntries();
    };

    // Handle quick add from suggestions
    const handleQuickAdd = async (foodId, servingSize) => {
        try {
            await logApi.logFood(foodId, servingSize, selectedDate);
            await fetchLogEntries();
            await fetchRecommendations(); // Refresh recommendations
        } catch (err) {
            console.error('Error logging food:', err);
        }
    };

    // Handle edit save
    const handleEditSave = async (logId, newServingSize) => {
        await logApi.updateLogEntry(logId, newServingSize);
        await fetchLogEntries();
    };

    // Handle delete confirm
    const handleDeleteConfirm = async (logId) => {
        await logApi.deleteLogEntry(logId);
        await fetchLogEntries();
    };

    const isToday = selectedDate === getTodayDate();
    const hasEntries = logEntries.length > 0;

    return (
        <div className="app-background" style={{ minHeight: '100vh', padding: '20px 32px' }}>
            {/* Page Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <h1 style={{
                    color: 'var(--color-green-dark)',
                    fontSize: '22px',
                    fontWeight: '700',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    letterSpacing: '-0.5px'
                }}>
                    📝 Food Log
                </h1>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    {isToday && (
                        <button
                            onClick={handleOpenSuggestions}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '6px',
                                border: '2px solid var(--color-green)',
                                background: 'white',
                                color: 'var(--color-green-dark)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--color-green-subtle)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                            }}
                        >
                            ✨ Suggestions
                        </button>
                    )}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            background: 'linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%)',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                        }}
                    >
                        <span style={{ fontSize: '16px' }}>+</span>
                        Add Food
                    </button>
                </div>
            </div>

            {/* Macro Stats Bar */}
            <div style={{ marginBottom: '28px' }}>
                <MacroStatsBar totals={totals} targets={targets} />
            </div>

            {/* Main Food Journal Card - Sharp Design */}
            <div style={{
                background: 'white',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
                {/* Journal Header with Date Slider - all inline */}
                <div style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid #E5E7EB',
                    background: '#FAFAFA',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1F2937',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase'
                    }}>
                        {isToday ? "Today's Entries" : `Entries for ${new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </h2>

                    {/* Date Slider - centered */}
                    <DateSlider
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                    />

                    <span style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        background: hasEntries ? '#DCFCE7' : '#F3F4F6',
                        border: hasEntries ? '1px solid #BBF7D0' : '1px solid #E5E7EB',
                        color: hasEntries ? '#15803D' : '#6B7280',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.3px'
                    }}>
                        {logEntries.length} items • {Math.round(totals.calories)} kcal
                    </span>
                </div>

                {/* Journal Content */}
                <div style={{ padding: '24px' }}>
                    {loading ? (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '80px 0'
                        }}>
                            <Loading />
                        </div>
                    ) : error ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            color: '#DC2626'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                            {error}
                        </div>
                    ) : !hasEntries ? (
                        /* Empty State - Clean & Sharp */
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 20px',
                                borderRadius: '16px',
                                background: '#F3F4F6',
                                border: '1px solid #E5E7EB',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '36px'
                            }}>
                                🍽️
                            </div>
                            <h3 style={{
                                margin: '0 0 6px 0',
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#1F2937'
                            }}>
                                No foods logged {isToday ? 'today' : 'on this day'}
                            </h3>
                            <p style={{
                                margin: '0 0 24px 0',
                                color: '#9CA3AF',
                                fontSize: '14px'
                            }}>
                                Start by adding your meals to track your nutrition
                            </p>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                style={{
                                    padding: '12px 28px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#16A34A',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.2)'
                                }}
                            >
                                + Add Your First Food
                            </button>
                        </div>
                    ) : (
                        /* Meal Sections - grouped by time */
                        <div>
                            {['morning', 'lunch', 'afternoon', 'dinner', 'lateNight'].map(mealType => (
                                <MealSection
                                    key={mealType}
                                    mealType={mealType}
                                    entries={entriesByMeal[mealType]}
                                    onEdit={setEditingEntry}
                                    onDelete={setDeletingEntry}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Journal Footer */}
                {hasEntries && (
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid #E5E7EB',
                        background: '#F9FAFB',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{
                            fontSize: '13px',
                            color: '#6B7280',
                            fontWeight: '500'
                        }}>
                            📊 Total: <strong style={{ color: '#374151' }}>{logEntries.length}</strong> items logged
                        </span>
                        <span style={{
                            fontSize: '16px',
                            fontWeight: '800',
                            color: '#16A34A'
                        }}>
                            {Math.round(totals.calories)} kcal
                        </span>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AddFoodLogModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onFoodLogged={handleFoodLogged}
                selectedDate={selectedDate}
            />

            <SuggestionsModal
                isOpen={isSuggestionsModalOpen}
                onClose={() => setIsSuggestionsModalOpen(false)}
                recommendations={recommendations}
                gaps={gaps}
                loading={recsLoading}
                onQuickAdd={handleQuickAdd}
            />

            <EditServingModal
                isOpen={!!editingEntry}
                entry={editingEntry}
                onSave={handleEditSave}
                onClose={() => setEditingEntry(null)}
            />

            <DeleteConfirmModal
                isOpen={!!deletingEntry}
                entry={deletingEntry}
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeletingEntry(null)}
            />
        </div>
    );
};

export default FoodLog;
