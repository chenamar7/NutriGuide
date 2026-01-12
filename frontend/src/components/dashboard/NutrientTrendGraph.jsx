import React, { useState } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer,
    Area,
    ComposedChart,
    Line,
    Scatter
} from 'recharts';

/**
 * NutrientTrendGraph Component
 * 
 * Shows 7-day consumption trend with goal line
 * Color indicates closeness to goal (green = close, red = far)
 */

// Tab button component
const TabButton = ({ active, onClick, children, emoji }) => (
    <button
        onClick={onClick}
        style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            backgroundColor: active ? 'white' : '#F3F4F6',
            color: active ? '#16A34A' : '#6B7280',
            fontWeight: active ? '600' : '500',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            borderBottom: active ? '3px solid #22C55E' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }}
    >
        <span>{emoji}</span>
        {children}
    </button>
);

// Get color based on deviation from target
const getDeviationColor = (value, target) => {
    if (!target || target === 0) return '#22C55E';

    const deviation = Math.abs(value - target) / target;

    // Green for within 10%, yellow for 10-25%, orange for 25-40%, red for >40%
    if (deviation <= 0.10) return '#22C55E'; // Green - on track
    if (deviation <= 0.25) return '#84CC16'; // Light green
    if (deviation <= 0.40) return '#F59E0B'; // Yellow/Orange
    return '#EF4444'; // Red - far off
};

// Custom tooltip
const CustomTooltip = ({ active, payload, label, unit, target }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const diff = value - target;
        const deviation = Math.abs(diff) / target;
        const isOver = diff > 0;
        const color = getDeviationColor(value, target);

        return (
            <div style={{
                backgroundColor: 'white',
                padding: '12px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: `2px solid ${color}`
            }}>
                <p style={{ margin: 0, fontWeight: '600', color: '#374151' }}>{label}</p>
                <p style={{ margin: '8px 0 0', color: color, fontSize: '18px', fontWeight: '700' }}>
                    {value}{unit}
                </p>
                <p style={{
                    margin: '4px 0 0',
                    fontSize: '12px',
                    color: color
                }}>
                    {deviation <= 0.10
                        ? '✓ On track!'
                        : isOver
                            ? `↑ ${Math.round(diff)}${unit} over goal`
                            : `↓ ${Math.abs(Math.round(diff))}${unit} under goal`
                    }
                </p>
            </div>
        );
    }
    return null;
};

// Custom dot that changes color based on deviation
const CustomDot = (props) => {
    const { cx, cy, payload, target } = props;
    const color = getDeviationColor(payload.value, target);

    return (
        <circle
            cx={cx}
            cy={cy}
            r={8}
            fill={color}
            stroke="white"
            strokeWidth={3}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
        />
    );
};

export const NutrientTrendGraph = ({ data, targets }) => {
    const [activeTab, setActiveTab] = useState('calories');

    // Nutrient configurations
    const nutrients = {
        calories: { label: 'Calories', emoji: '🔥', unit: ' kcal', key: 'calories' },
        protein: { label: 'Protein', emoji: '🥩', unit: 'g', key: 'protein' },
        carbs: { label: 'Carbs', emoji: '🍞', unit: 'g', key: 'carbs' },
        fat: { label: 'Fat', emoji: '🥑', unit: 'g', key: 'fat' }
    };

    const currentNutrient = nutrients[activeTab];
    const target = targets[activeTab] || 0;

    // Process data for the active nutrient with colors
    const chartData = data.map(day => ({
        day: day.day,
        value: day[currentNutrient.key] || 0,
        color: getDeviationColor(day[currentNutrient.key] || 0, target)
    }));

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            overflow: 'hidden'
        }}>
            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '4px',
                padding: '16px 16px 0',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB'
            }}>
                {Object.entries(nutrients).map(([key, nutrient]) => (
                    <TabButton
                        key={key}
                        active={activeTab === key}
                        onClick={() => setActiveTab(key)}
                        emoji={nutrient.emoji}
                    >
                        {nutrient.label}
                    </TabButton>
                ))}
            </div>

            {/* Chart */}
            <div style={{ padding: '24px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <h3 style={{ margin: 0, color: '#374151', fontSize: '18px' }}>
                        {currentNutrient.emoji} {currentNutrient.label} - This Week
                    </h3>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#6B7280'
                    }}>
                        <span style={{
                            width: '16px',
                            height: '3px',
                            backgroundColor: '#16A34A',
                            display: 'inline-block'
                        }}></span>
                        Goal: {target}{currentNutrient.unit}
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 45, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E5E7EB" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#E5E7EB" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                            dataKey="day"
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={{ stroke: '#E5E7EB' }}
                        />
                        <YAxis
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            axisLine={{ stroke: '#E5E7EB' }}
                            domain={[0, (dataMax) => Math.max(dataMax * 1.1, target * 1.2)]}
                        />
                        <Tooltip content={<CustomTooltip unit={currentNutrient.unit} target={target} />} />

                        {/* Goal reference line */}
                        <ReferenceLine
                            y={target}
                            stroke="#16A34A"
                            strokeWidth={2}
                            strokeDasharray="8 4"
                            label={{
                                value: 'Goal',
                                position: 'right',
                                fill: '#16A34A',
                                fontSize: 12,
                                fontWeight: 600
                            }}
                        />

                        {/* Area fill (subtle gray) */}
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="none"
                            fill="url(#areaGradient)"
                        />

                        {/* Line connecting the dots */}
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8B5A2B"
                            strokeWidth={2}
                            dot={false}
                        />

                        {/* Colored dots based on deviation */}
                        <Scatter
                            dataKey="value"
                            shape={<CustomDot target={target} />}
                        />
                    </ComposedChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '16px',
                    fontSize: '12px',
                    color: '#6B7280',
                    flexWrap: 'wrap'
                }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22C55E' }}></span>
                        On track (±10%)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#84CC16' }}></span>
                        Close (±25%)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }}></span>
                        Off (±40%)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }}></span>
                        Far off (&gt;40%)
                    </span>
                </div>
            </div>
        </div>
    );
};
