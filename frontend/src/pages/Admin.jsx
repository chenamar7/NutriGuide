import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/common';
import * as adminApi from '../api/admin';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Admin Dashboard Page
 * 
 * Luxury-styled analytics dashboard for platform administrators.
 * Features:
 * - High-level platform statistics (4 roomy stat cards)
 * - Nutrient deficiency analysis with progress bars
 * - Food category popularity by user goal
 */

const Admin = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPreferencesExpanded, setIsPreferencesExpanded] = useState(false);
    const [data, setData] = useState({
        dashboard: {},
        deficiencies: [],
        categories: [],
        topFoods: [],
        goalDistribution: []
    });

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                setLoading(true);
                const [dashData, defData, catData, topFoodsData, goalData] = await Promise.all([
                    adminApi.getDashboard().catch(() => []),
                    adminApi.getDeficiencies().catch(() => []),
                    adminApi.getPopularCategories().catch(() => []),
                    adminApi.getTopFoods().catch(() => []),
                    adminApi.getGoalDistribution().catch(() => [])
                ]);

                // Transform dashboard array into an object for easier access
                const statsObj = {};
                if (Array.isArray(dashData)) {
                    dashData.forEach(item => {
                        statsObj[item.metric_name] = item.metric_value;
                        if (item.comparison_value !== null) {
                            statsObj[`${item.metric_name}_prev`] = item.comparison_value;
                        }
                    });
                }

                setData({
                    dashboard: statsObj,
                    deficiencies: defData || [],
                    categories: catData || [],
                    topFoods: topFoodsData || [],
                    goalDistribution: goalData || []
                });
            } catch (err) {
                console.error('Admin data load error:', err);
                setError('Failed to load admin dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminData();
    }, []);

    // ============ SUB-COMPONENTS ============

    /**
     * StatCard - Luxury stat display with gradient accent
     */
    const StatCard = ({ icon, label, value, subValue, accentColor }) => {
        const [isHovered, setIsHovered] = useState(false);

        const colorMap = {
            gold: { gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', glow: 'rgba(245, 158, 11, 0.15)' },
            emerald: { gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', glow: 'rgba(16, 185, 129, 0.15)' },
            blue: { gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', glow: 'rgba(59, 130, 246, 0.15)' },
            purple: { gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', glow: 'rgba(139, 92, 246, 0.15)' }
        };

        const colors = colorMap[accentColor] || colorMap.gold;

        return (
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '28px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isHovered
                        ? '0 12px 40px rgba(0,0,0,0.1)'
                        : '0 4px 20px rgba(0,0,0,0.04)',
                    border: '1px solid #E5E7EB',
                    transition: 'all 0.3s ease',
                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                    cursor: 'default',
                    flex: 1,
                    minWidth: '200px'
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Background glow effect */}
                <div style={{
                    position: 'absolute',
                    top: '-30px',
                    right: '-30px',
                    width: '120px',
                    height: '120px',
                    background: colors.glow,
                    borderRadius: '50%',
                    filter: 'blur(40px)'
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                    <div>
                        <p style={{
                            margin: 0,
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            color: '#6B7280',
                            fontWeight: '600',
                            marginBottom: '8px'
                        }}>
                            {label}
                        </p>
                        <h3 style={{
                            margin: 0,
                            fontSize: '36px',
                            fontWeight: '800',
                            background: colors.gradient,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-1px'
                        }}>
                            {value != null ? Math.round(Number(value)).toLocaleString() : '—'}
                        </h3>
                        {subValue && (
                            <p style={{
                                margin: '6px 0 0 0',
                                fontSize: '13px',
                                color: '#9CA3AF',
                                fontWeight: '500'
                            }}>
                                {subValue}
                            </p>
                        )}
                    </div>
                    <div style={{
                        fontSize: '32px',
                        background: '#F9FAFB',
                        width: '56px',
                        height: '56px',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #E5E7EB'
                    }}>
                        {icon}
                    </div>
                </div>
            </div>
        );
    };

    /**
     * DeficiencyBar - Progress bar for nutrient gaps
     */
    const DeficiencyBar = ({ name, percent, rank }) => {
        // Map database nutrient names to friendly names
        const friendlyNames = {
            'Energy': 'Calories',
            'Carbohydrate, by difference': 'Carbs',
            'Total lipid (fat)': 'Fat',
            'Protein': 'Protein'
        };
        const displayName = friendlyNames[name] || name;

        // Color logic: red if too low (<50%) OR too high (>110%), yellow if 50-80% or 100-110%, green if 80-100%
        const getColor = (pct) => {
            if (pct < 50 || pct > 110) return '#EF4444'; // Red for extremes
            if (pct < 80 || pct > 100) return '#F59E0B'; // Yellow for warning
            return '#10B981'; // Green for ideal range
        };

        const color = getColor(percent);

        return (
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: '#9CA3AF',
                            background: '#F3F4F6',
                            padding: '2px 8px',
                            borderRadius: '10px'
                        }}>
                            #{rank}
                        </span>
                        <span style={{ fontWeight: '600', color: '#374151', fontSize: '14px' }}>{displayName}</span>
                    </div>
                    <span style={{ fontWeight: '700', color: color, fontSize: '14px' }}>{percent}%</span>
                </div>
                <div style={{
                    width: '100%',
                    height: '10px',
                    background: '#F3F4F6',
                    borderRadius: '5px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${Math.min(percent, 100)}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '5px',
                        transition: 'width 0.8s ease-out'
                    }} />
                </div>
            </div>
        );
    };

    // ============ LOADING & ERROR STATES ============

    if (loading) {
        return (
            <div className="app-background" style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="app-background" style={{
                minHeight: '100vh',
                padding: '60px',
                textAlign: 'center'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    maxWidth: '400px',
                    margin: '0 auto',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}>
                    <span style={{ fontSize: '48px' }}>⚠️</span>
                    <h2 style={{ color: 'var(--color-danger)', marginTop: '16px' }}>Error Loading Dashboard</h2>
                    <p style={{ color: '#6B7280' }}>{error}</p>
                </div>
            </div>
        );
    }

    // ============ MAIN RENDER ============

    return (
        <div className="app-background" style={{ minHeight: '100vh', padding: '24px 32px' }}>
            {/* Header */}
            <div style={{
                marginBottom: '32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: '800',
                        color: 'var(--color-green-dark)',
                        letterSpacing: '-0.5px'
                    }}>
                        Admin Dashboard
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
                        Platform analytics and insights
                    </p>
                </div>
                <div style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                    borderRadius: '100px',
                    color: '#FCD34D',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    letterSpacing: '0.5px'
                }}>
                    <span>👑</span> ADMINISTRATOR
                </div>
            </div>

            {/* Stats Grid - 4 roomy cards in a row */}
            <div style={{
                display: 'flex',
                gap: '24px',
                marginBottom: '32px',
                flexWrap: 'wrap'
            }}>
                <StatCard
                    label="Total Users"
                    value={data.dashboard['Total Users']}
                    subValue="Registered members"
                    icon="👥"
                    accentColor="blue"
                />
                <StatCard
                    label="Active (7 Days)"
                    value={data.dashboard['Active Users (7 days)']}
                    subValue={data.dashboard['Active Users (7 days)_prev'] ? `${data.dashboard['Active Users (7 days)_prev']} last week` : 'Weekly active'}
                    icon="⚡"
                    accentColor="emerald"
                />
                <StatCard
                    label="Logs Today"
                    value={data.dashboard['Food Logs Today']}
                    subValue="Entries created today"
                    icon="📊"
                    accentColor="gold"
                />
                <StatCard
                    label="Avg per User"
                    value={data.dashboard['Avg Logs Per Active User (7 days)'] ?? 0}
                    subValue="Weekly average"
                    icon="📈"
                    accentColor="purple"
                />
            </div>

            {/* DB Stats - Compact Centered Text */}
            <div style={{
                marginBottom: '24px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#6B7280'
            }}>
                <span style={{ fontSize: '16px', marginRight: '6px' }}>📊</span>
                <span style={{ fontWeight: '700', color: '#16A34A' }}>
                    {data.dashboard['Total Foods in Database'] != null ? Math.round(data.dashboard['Total Foods in Database']).toLocaleString() : '—'}
                </span>
                <span> foods</span>
                <span style={{ color: '#D1D5DB', margin: '0 10px' }}>•</span>
                <span style={{ fontWeight: '700', color: '#16A34A' }}>{data.categories.length || '—'}</span>
                <span> categories</span>
                <span style={{ color: '#D1D5DB', margin: '0 10px' }}>•</span>
                <span style={{ fontWeight: '700', color: '#16A34A' }}>
                    {data.goalDistribution.reduce((sum, g) => sum + g.user_count, 0) || '—'}
                </span>
                <span> users with goals</span>
            </div>

            {/* Top Foods and User Goals - under DB Stats */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '24px'
            }}>
                {/* Left: Top Foods */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    border: '1px solid #E5E7EB'
                }}>
                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>🏆</span>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
                                Top Foods
                            </h2>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                                Most logged in the last 30 days
                            </p>
                        </div>
                    </div>

                    {data.topFoods.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {data.topFoods.map((food, idx) => (
                                <div
                                    key={food.food_id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 14px',
                                        background: idx === 0 ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : '#FAFAFA',
                                        borderRadius: '10px',
                                        border: idx === 0 ? '1px solid #F59E0B' : '1px solid #F3F4F6'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                            fontSize: idx === 0 ? '18px' : '14px',
                                            fontWeight: '700',
                                            color: idx === 0 ? '#F59E0B' : '#9CA3AF'
                                        }}>
                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                        </span>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#374151', fontSize: '14px' }}>
                                                {food.food_name}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>
                                                {food.category_name || 'Uncategorized'}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontWeight: '700', color: '#1F2937', fontSize: '16px' }}>
                                            {food.log_count}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '10px', color: '#9CA3AF' }}>
                                            logs
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                            No food log data yet.
                        </p>
                    )}
                </div>

                {/* Right: Goal Distribution */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    border: '1px solid #E5E7EB',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>🎯</span>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
                                User Goals
                            </h2>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                                Distribution of user fitness goals
                            </p>
                        </div>
                    </div>

                    {data.goalDistribution.length > 0 ? (
                        <div style={{ flex: 1, minHeight: '300px', width: '100%', minWidth: '0', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ flex: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.goalDistribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="user_count"
                                            nameKey="goal"
                                        >
                                            {data.goalDistribution.map((entry, index) => {
                                                const colors = {
                                                    'Loss': '#EF4444',
                                                    'Maintain': '#3B82F6',
                                                    'Gain': '#10B981'
                                                };
                                                return <Cell key={`cell-${index}`} fill={colors[entry.goal] || '#9CA3AF'} />;
                                            })}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value, name, props) => [
                                                `${value} users (${props.payload.percentage}%)`,
                                                name
                                            ]}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                padding: '12px 16px'
                                            }}
                                            itemStyle={{ color: '#374151', fontWeight: 600 }}
                                        />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            iconType="circle"
                                            formatter={(value) => <span style={{ color: '#4B5563', fontWeight: 500 }}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#9CA3AF' }}>
                                Total users: {data.goalDistribution.reduce((sum, g) => sum + g.user_count, 0)}
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                            No user goal data yet.
                        </p>
                    )}
                </div>
            </div>

            {/* User Insights Section Header */}
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#4B5563' }}>
                    User Insights
                </h3>
            </div>

            {/* Main Content - Two Column Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.5fr',
                gap: '24px',
                alignItems: 'start'
            }}>
                {/* Left: Nutrient Deficiencies */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    border: '1px solid #E5E7EB'
                }}>
                    {/* Header with clear description */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '24px' }}>🎯</span>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
                                Nutrient Achievement
                            </h2>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#6B7280', paddingLeft: '34px' }}>
                            Average % of daily targets met by users (last 30 days)
                        </p>
                    </div>

                    {data.deficiencies.length > 0 ? (
                        <>
                            {data.deficiencies.map((def) => (
                                <DeficiencyBar
                                    key={def.nutrient_id || def.nutrient_name}
                                    name={def.nutrient_name}
                                    percent={Math.round(def.avg_percent_met || 0)}
                                    rank={def.difficulty_rank || def.severity_rank || '—'}
                                />
                            ))}
                            <div style={{
                                marginTop: '20px',
                                padding: '14px 16px',
                                background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                                borderRadius: '10px',
                                fontSize: '12px',
                                color: '#92400E',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px'
                            }}>
                                <span>💡</span>
                                <span><strong>Insight:</strong> These nutrients are commonly under-consumed. Consider promoting foods rich in these nutrients.</span>
                            </div>
                        </>
                    ) : (
                        <p style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                            No deficiency data available yet.
                        </p>
                    )}
                </div>

                {/* Right: Categories Table */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '28px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                    border: '1px solid #E5E7EB'
                }}>
                    <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '24px' }}>🍽️</span>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1F2937' }}>
                                Food Preferences by Goal
                            </h2>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>
                                Category popularity segmented by user goal
                            </p>
                        </div>
                    </div>

                    {data.categories.length > 0 ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                                {(isPreferencesExpanded ? data.categories : data.categories.slice(0, 6)).map((cat, idx) => {
                                    const goalColors = {
                                        'Loss': { bg: '#FEF2F2', border: '#FFE4E6', text: '#DC2626', label: 'Weight Loss' },
                                        'Maintain': { bg: '#EFF6FF', border: '#DBEAFE', text: '#2563EB', label: 'Maintenance' },
                                        'Gain': { bg: '#ECFDF5', border: '#D1FAE5', text: '#059669', label: 'Muscle Gain' }
                                    };
                                    const goal = goalColors[cat.most_popular_with] || goalColors['Maintain'];

                                    // Simple mapping for category icons
                                    const getCategoryIcon = (name) => {
                                        const n = name.toLowerCase();
                                        if (n.includes('vegetable')) return '🥦';
                                        if (n.includes('fruit')) return '🍎';
                                        if (n.includes('baked') || n.includes('bread')) return '🥖';
                                        if (n.includes('sausage') || n.includes('meat') || n.includes('beef') || n.includes('pork') || n.includes('poultry')) return '🍖';
                                        if (n.includes('cereal') || n.includes('pasta') || n.includes('grain')) return '🍝';
                                        if (n.includes('snack')) return '🍿';
                                        if (n.includes('sweet') || n.includes('candy') || n.includes('sugar')) return '🍬';
                                        if (n.includes('dairy') || n.includes('egg') || n.includes('cheese') || n.includes('milk')) return '🧀';
                                        if (n.includes('fish') || n.includes('seafood')) return '🐟';
                                        if (n.includes('beverage') || n.includes('drink')) return '🥤';
                                        if (n.includes('fat') || n.includes('oil')) return '🧈';
                                        if (n.includes('nut') || n.includes('seed') || n.includes('legume')) return '🥜';
                                        return '🍽️';
                                    };

                                    return (
                                        <div
                                            key={cat.category_name}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '16px',
                                                background: '#FFFFFF',
                                                borderRadius: '16px',
                                                border: '1px solid #F3F4F6',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                                                e.currentTarget.style.borderColor = goal.border;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'none';
                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                                e.currentTarget.style.borderColor = '#F3F4F6';
                                            }}
                                        >
                                            {/* Subtle colored background accent on the left */}
                                            <div style={{
                                                position: 'absolute',
                                                left: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: '4px',
                                                background: goal.text
                                            }} />

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{
                                                    width: '42px',
                                                    height: '42px',
                                                    borderRadius: '12px',
                                                    background: goal.bg,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '20px',
                                                    flexShrink: 0
                                                }}>
                                                    {getCategoryIcon(cat.category_name)}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '2px', lineHeight: '1.2' }}>
                                                        {cat.category_name}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        Rank #{idx + 1}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                background: goal.bg,
                                                color: goal.text,
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                letterSpacing: '0.3px',
                                                textTransform: 'uppercase',
                                                border: `1px solid ${goal.border}`
                                            }}>
                                                {cat.most_popular_with === 'loss' ? 'LOSS' : cat.most_popular_with.toUpperCase()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Expand/Collapse Button */}
                            {data.categories.length > 6 && (
                                <button
                                    onClick={() => setIsPreferencesExpanded(!isPreferencesExpanded)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        width: '100%',
                                        padding: '12px',
                                        marginTop: '16px',
                                        background: 'white',
                                        border: '1px border #E5E7EB',
                                        borderRadius: '12px',
                                        color: '#6B7280',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <span>{isPreferencesExpanded ? 'Show Less' : 'Show More'}</span>
                                    <span style={{
                                        transform: isPreferencesExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.3s'
                                    }}>
                                        ▼
                                    </span>
                                </button>
                            )}
                        </>
                    ) : (
                        <p style={{ color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                            No category data available yet.
                        </p>
                    )}
                </div>
            </div>
        </div >
    );
};

export default Admin;
