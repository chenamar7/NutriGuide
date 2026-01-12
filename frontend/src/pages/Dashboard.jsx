import React, { useState, useEffect, useCallback } from 'react';
import { MacroCircle } from '../components/dashboard/MacroCircle';
import { NutrientTrendGraph } from '../components/dashboard/NutrientTrendGraph';
import { DailyFactCard } from '../components/dashboard/DailyFactCard';
import { StreakBadge } from '../components/dashboard/StreakBadge';
import { FoodLogList } from '../components/dashboard/FoodLogList';
import { AddFoodModal } from '../components/dashboard/AddFoodModal';
import { Loading } from '../components/common';
import { useAuth } from '../hooks/useAuth';

// API imports
import * as logApi from '../api/log';
import * as analysisApi from '../api/analysis';
import * as factsApi from '../api/facts';
import * as profileApi from '../api/profile';

/**
 * Dashboard Page
 * 
 * Main dashboard showing user's daily nutrition overview
 * Fetches real data from backend APIs
 */

const Dashboard = () => {
    const { user } = useAuth();

    // State
    const [loading, setLoading] = useState(true);
    const [todaysFoods, setTodaysFoods] = useState([]);
    const [todayTotals, setTodayTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
    const [targets, setTargets] = useState({ calories: 2000, protein: 100, carbs: 250, fat: 70 });
    const [streak, setStreak] = useState({ current: 0, longest: 0 });
    const [fact, setFact] = useState({ text: '', category: '' });
    const [weeklyData, setWeeklyData] = useState([]);

    // Modal state
    const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);

            // Fetch all data in parallel
            const [
                todayLog,
                gapAnalysis,
                streakData,
                randomFact,
                profile
            ] = await Promise.all([
                logApi.getTodayLog().catch(() => []),
                analysisApi.getGapAnalysis().catch(() => null),
                analysisApi.getStreak().catch(() => ({ current_streak: 0, longest_streak_ever: 0 })),
                factsApi.getRandomFact().catch(() => ({ fact_text: 'Eat your vegetables!', category: 'General' })),
                profileApi.getProfile().catch(() => null)
            ]);

            // Process today's foods
            let totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
            if (todayLog && todayLog.length > 0) {
                const foods = todayLog.map(log => ({
                    name: log.food_name || log.name,
                    amount: `${log.serving_size_grams}g`,
                    calories: Math.round(log.calories || 0),
                    protein: Math.round(log.protein_g || 0),
                    carbs: Math.round(log.carbs_g || 0),
                    fat: Math.round(log.fat_g || 0)
                }));
                setTodaysFoods(foods);

                // Calculate totals
                totals = foods.reduce((acc, food) => ({
                    calories: acc.calories + food.calories,
                    protein: acc.protein + food.protein,
                    carbs: acc.carbs + food.carbs,
                    fat: acc.fat + food.fat
                }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
                setTodayTotals(totals);
            } else {
                setTodaysFoods([]);
                setTodayTotals({ calories: 0, protein: 0, carbs: 0, fat: 0 });
            }

            // Set targets from profile
            if (profile) {
                setTargets({
                    calories: profile.target_calories || 2000,
                    protein: profile.target_protein_g || 100,
                    carbs: profile.target_carbs_g || 250,
                    fat: profile.target_fat_g || 70
                });
            }

            // Set streak
            setStreak({
                current: streakData.current_streak || 0,
                longest: streakData.longest_streak_ever || 0
            });

            // Set fact
            if (randomFact) {
                setFact({
                    text: randomFact.fact_text || randomFact.text || 'Eat your vegetables!',
                    category: randomFact.category || 'General'
                });
            }

            // Fetch weekly data for graph (last 7 days, today on right)
            try {
                const historyData = await logApi.getLogHistory(14); // Get more days to cover the week

                // Helper to format date as YYYY-MM-DD in local timezone
                const formatLocalDate = (d) => {
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                // Get today's date
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayStr = formatLocalDate(today);

                // Create array for last 7 days (oldest on left, today on right)
                const days = [];
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - i);
                    const dateStr = formatLocalDate(date);
                    const dayName = dayNames[date.getDay()];

                    // Find logs for this date
                    const dayLogs = historyData?.filter(log => {
                        if (!log.date_eaten) return false;
                        // Always parse using Date object to handle timezone conversion
                        // e.g. "2026-01-10T22:00:00Z" (Sat) -> "2026-01-11" (Sun) in local time
                        const logDate = formatLocalDate(new Date(log.date_eaten));
                        return logDate === dateStr;
                    }) || [];

                    // Sum up nutrients for the day (values come as strings from DB)
                    // Cap values at reasonable maximums to filter out bad data
                    const safeValue = (val, max = 10000) => {
                        const num = parseFloat(val || 0);
                        return isNaN(num) || num > max ? 0 : num;
                    };

                    const dayTotals = dayLogs.reduce((acc, log) => ({
                        calories: acc.calories + safeValue(log.calories, 50000),
                        protein: acc.protein + safeValue(log.protein_g, 5000),
                        carbs: acc.carbs + safeValue(log.carbs_g, 5000),
                        fat: acc.fat + safeValue(log.fat_g, 5000)
                    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

                    days.push({
                        day: dayName,
                        date: dateStr,
                        calories: Math.round(dayTotals.calories),
                        protein: Math.round(dayTotals.protein),
                        carbs: Math.round(dayTotals.carbs),
                        fat: Math.round(dayTotals.fat)
                    });
                }

                // Override today with the freshly calculated totals (today is now the last item)
                const todayIndex = days.findIndex(d => d.date === todayStr);
                if (todayIndex !== -1) {
                    days[todayIndex] = {
                        ...days[todayIndex],
                        calories: totals.calories,
                        protein: totals.protein,
                        carbs: totals.carbs,
                        fat: totals.fat
                    };
                }

                setWeeklyData(days);
            } catch (err) {
                console.error('Error fetching weekly data:', err);
                // Fallback: just show today
                const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    days.push({
                        day: dayNames[date.getDay()],
                        calories: i === 0 ? totals.calories : 0,
                        protein: i === 0 ? totals.protein : 0,
                        carbs: i === 0 ? totals.carbs : 0,
                        fat: i === 0 ? totals.fat : 0
                    });
                }
                setWeeklyData(days);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Handle food logged - refresh data
    const handleFoodLogged = () => {
        fetchDashboardData(false); // Don't show loading spinner on refresh
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <Loading />
            </div>
        );
    }

    return (
        <div className="app-background" style={{ minHeight: '100vh', padding: '20px 32px' }}>
            {/* Welcome Header */}
            <div style={{ marginBottom: '16px' }}>
                <h1 style={{
                    color: 'var(--color-green-dark)',
                    fontSize: '20px',
                    fontWeight: '700',
                    margin: 0,
                    letterSpacing: '-0.5px'
                }}>
                    Welcome back, {user?.username || 'User'}! 👋
                </h1>
                <p style={{
                    color: 'var(--color-text-muted)',
                    fontSize: '12px',
                    marginTop: '2px',
                    margin: 0
                }}>
                    Here's your nutrition overview for today
                </p>
            </div>

            {/* Top Section: Macros + Fact & Streak */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '24px',
                marginBottom: '24px',
                alignItems: 'start'
            }}>
                {/* Macro Circles Container - 2x2 Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    backgroundColor: 'var(--color-surface)',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    alignItems: 'center',
                    justifyItems: 'center'
                }}>
                    <MacroCircle label="Calories" consumed={todayTotals.calories} target={targets.calories} unit=" kcal" emoji="🔥" size={100} />
                    <MacroCircle label="Protein" consumed={todayTotals.protein} target={targets.protein} unit="g" emoji="🥩" size={100} />
                    <MacroCircle label="Carbs" consumed={todayTotals.carbs} target={targets.carbs} unit="g" emoji="🍞" size={100} />
                    <MacroCircle label="Fat" consumed={todayTotals.fat} target={targets.fat} unit="g" emoji="🥑" size={100} />
                </div>

                {/* Right Sidebar: Fact → Streak */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    <DailyFactCard
                        fact={fact.text}
                        category={fact.category}
                    />
                    <StreakBadge
                        currentStreak={streak.current}
                        longestStreak={streak.longest}
                    />
                </div>
            </div>

            {/* Bottom Section: Trend Graph + Food Log */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '24px',
                alignItems: 'start'
            }}>
                <NutrientTrendGraph data={weeklyData} targets={targets} />

                <div style={{ height: '475px', overflow: 'hidden' }}>
                    <FoodLogList
                        foods={todaysFoods}
                        onAddFood={() => setIsAddFoodModalOpen(true)}
                    />
                </div>
            </div>

            {/* Add Food Modal */}
            <AddFoodModal
                isOpen={isAddFoodModalOpen}
                onClose={() => setIsAddFoodModalOpen(false)}
                onFoodLogged={handleFoodLogged}
            />
        </div>
    );
};

export default Dashboard;
