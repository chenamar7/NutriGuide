import React, { useState } from 'react';

/**
 * DateSlider Component
 * 
 * Clean, minimal date navigator centered in the journal header
 */

export const DateSlider = ({ selectedDate, onDateChange }) => {
    const [showFullCalendar, setShowFullCalendar] = useState(false);
    
    const today = new Date().toISOString().split('T')[0];
    const selectedDateObj = new Date(selectedDate);
    const isToday = selectedDate === today;
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const handlePrevDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() - 1);
        onDateChange(date.toISOString().split('T')[0]);
    };

    const handleNextDay = () => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        const nextDate = date.toISOString().split('T')[0];
        if (nextDate <= today) {
            onDateChange(nextDate);
        }
    };

    const handleGoToToday = () => {
        onDateChange(today);
        setShowFullCalendar(false);
    };

    // Generate calendar days for current month view
    const getCalendarDays = () => {
        const year = selectedDateObj.getFullYear();
        const month = selectedDateObj.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        
        const days = [];
        
        for (let i = 0; i < startPadding; i++) {
            days.push(null);
        }
        
        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }
        
        return days;
    };

    const handleMonthNav = (direction) => {
        const date = new Date(selectedDate);
        date.setMonth(date.getMonth() + direction);
        if (date.toISOString().split('T')[0] <= today) {
            onDateChange(date.toISOString().split('T')[0]);
        }
    };

    const handleDayClick = (day) => {
        if (!day) return;
        const dateStr = day.toISOString().split('T')[0];
        if (dateStr <= today) {
            onDateChange(dateStr);
            setShowFullCalendar(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            position: 'relative' 
        }}>
            {/* Date Navigation Strip */}
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'white',
                padding: '6px 8px',
                borderRadius: '10px',
                border: '1px solid #E5E7EB'
            }}>
                {/* Prev Button */}
                <button
                    onClick={handlePrevDay}
                    style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-green-dark)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    ◀
                </button>

                {/* Date Display - Clickable */}
                <button
                    onClick={() => setShowFullCalendar(!showFullCalendar)}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px 10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        borderRadius: '6px',
                        transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                >
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>📅</span>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: 'var(--color-text)'
                    }}>
                        {dayNames[selectedDateObj.getDay()].slice(0, 3)}, {monthNames[selectedDateObj.getMonth()]} {selectedDateObj.getDate()}
                    </span>
                    {isToday && (
                        <span style={{
                            fontSize: '9px',
                            fontWeight: '700',
                            color: 'var(--color-green)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            (Today)
                        </span>
                    )}
                    <span style={{ fontSize: '8px', color: '#D1D5DB' }}>▼</span>
                </button>

                {/* Next Button */}
                <button
                    onClick={handleNextDay}
                    disabled={isToday}
                    style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        color: isToday ? '#D1D5DB' : 'var(--color-green-dark)',
                        fontSize: '11px',
                        cursor: isToday ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => !isToday && (e.currentTarget.style.background = '#F3F4F6')}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    ▶
                </button>

                {/* Divider */}
                {!isToday && (
                    <>
                        <div style={{ 
                            width: '1px', 
                            height: '16px', 
                            background: '#E5E7EB',
                            margin: '0 2px'
                        }} />
                        
                        {/* Quick Today Button */}
                        <button
                            onClick={handleGoToToday}
                            style={{
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'var(--color-green)',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'opacity 0.15s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Today
                        </button>
                    </>
                )}
            </div>

            {/* Dropdown Calendar */}
            {showFullCalendar && (
                <>
                    <div
                        onClick={() => setShowFullCalendar(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 99
                        }}
                    />
                    
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '8px',
                        background: 'white',
                        borderRadius: '14px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                        border: '1px solid #E5E7EB',
                        padding: '14px',
                        width: '260px',
                        zIndex: 100
                    }}>
                        {/* Month Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <button
                                onClick={() => handleMonthNav(-1)}
                                style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#F3F4F6',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                }}
                            >
                                ◀
                            </button>
                            <span style={{
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'var(--color-text)'
                            }}>
                                {fullMonthNames[selectedDateObj.getMonth()]} {selectedDateObj.getFullYear()}
                            </span>
                            <button
                                onClick={() => handleMonthNav(1)}
                                style={{
                                    width: '26px',
                                    height: '26px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: '#F3F4F6',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                }}
                            >
                                ▶
                            </button>
                        </div>

                        {/* Day Headers */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '2px',
                            marginBottom: '6px'
                        }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={i} style={{
                                    textAlign: 'center',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    color: '#9CA3AF',
                                    padding: '4px'
                                }}>
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            gap: '2px'
                        }}>
                            {getCalendarDays().map((day, i) => {
                                if (!day) {
                                    return <div key={i} />;
                                }
                                
                                const dayStr = day.toISOString().split('T')[0];
                                const isFuture = dayStr > today;
                                const isSelected = dayStr === selectedDate;
                                const isTodayDay = dayStr === today;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleDayClick(day)}
                                        disabled={isFuture}
                                        style={{
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '8px',
                                            border: isTodayDay && !isSelected 
                                                ? '2px solid var(--color-green)' 
                                                : 'none',
                                            background: isSelected 
                                                ? 'var(--color-green)' 
                                                : 'transparent',
                                            color: isSelected 
                                                ? 'white' 
                                                : isFuture 
                                                    ? '#D1D5DB' 
                                                    : 'var(--color-text)',
                                            fontSize: '12px',
                                            fontWeight: isSelected || isTodayDay ? '600' : '400',
                                            cursor: isFuture ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {day.getDate()}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Go to Today */}
                        <div style={{
                            marginTop: '10px',
                            paddingTop: '10px',
                            borderTop: '1px solid #F3F4F6'
                        }}>
                            <button
                                onClick={handleGoToToday}
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: 'var(--color-green)',
                                    color: 'white',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Go to Today
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
