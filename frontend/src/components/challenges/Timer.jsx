import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Timer Component - Horizontal progress bar timer
 * Smooth animation using requestAnimationFrame
 */
export const Timer = ({ duration = 15, onExpire, isRunning = true, reset = 0 }) => {
    const [displayTime, setDisplayTime] = useState(duration);
    const [progress, setProgress] = useState(100);

    const animationRef = useRef(null);
    const startTimestampRef = useRef(null);
    const expiredRef = useRef(false);
    const onExpireRef = useRef(onExpire);

    // Keep onExpire ref updated
    useEffect(() => {
        onExpireRef.current = onExpire;
    }, [onExpire]);

    // Stop animation helper
    const stopAnimation = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    }, []);

    // Reset everything when reset prop changes
    useEffect(() => {
        stopAnimation();
        setDisplayTime(duration);
        setProgress(100);
        startTimestampRef.current = null;
        expiredRef.current = false;
    }, [reset, duration, stopAnimation]);

    // Main animation loop
    useEffect(() => {
        if (!isRunning) {
            stopAnimation();
            return;
        }

        const totalDurationMs = duration * 1000;

        const animate = (timestamp) => {
            // Initialize start time on first frame
            if (startTimestampRef.current === null) {
                startTimestampRef.current = timestamp;
            }

            const elapsed = timestamp - startTimestampRef.current;
            const remainingMs = Math.max(0, totalDurationMs - elapsed);
            const newProgress = (remainingMs / totalDurationMs) * 100;
            const newDisplayTime = Math.ceil(remainingMs / 1000);

            setProgress(newProgress);
            setDisplayTime(newDisplayTime);

            // Check if expired
            if (remainingMs <= 0 && !expiredRef.current) {
                expiredRef.current = true;
                setDisplayTime(0);
                setProgress(0);
                onExpireRef.current?.();
                return; // Stop animation
            }

            // Continue animation
            if (remainingMs > 0) {
                animationRef.current = requestAnimationFrame(animate);
            }
        };

        // Start animation
        animationRef.current = requestAnimationFrame(animate);

        // Cleanup
        return () => stopAnimation();
    }, [isRunning, reset, duration, stopAnimation]);

    const isUrgent = displayTime <= 5 && displayTime > 0;

    return (
        <div style={{ width: '100%', marginBottom: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
            }}>
                <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}>
                    Time Remaining
                </span>
                <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: isUrgent ? 'var(--color-danger)' : 'var(--color-green-dark)',
                    animation: isUrgent ? 'pulse 0.5s ease-in-out infinite' : 'none'
                }}>
                    {displayTime}s
                </span>
            </div>

            <div style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#E5E7EB',
                borderRadius: '3px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: isUrgent
                        ? 'var(--color-danger)'
                        : 'linear-gradient(90deg, var(--gradient-green-start), var(--gradient-green-end))',
                    borderRadius: '3px',
                    transition: progress === 100 ? 'none' : 'background 0.3s ease'
                }} />
            </div>
        </div>
    );
};