import React, { useState, useEffect } from 'react';
import * as challengesApi from '../../api/challenges';

/**
 * Leaderboard Component
 * Shows top 25 users by score or streak with tabs
 * If current user is not in top 25, shows them at the bottom
 */
export const Leaderboard = () => {
    const [tab, setTab] = useState('score'); // 'score' or 'streak'
    const [leaderboard, setLeaderboard] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const data = await challengesApi.getLeaderboard(tab);
                setLeaderboard(data.leaderboard || []);
                setCurrentUser(data.currentUser || null);
            } catch (error) {
                console.error('Failed to load leaderboard:', error);
                setLeaderboard([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [tab]);

    const getRankStyle = (rank) => {
        if (rank === 1) return { color: '#FFD700', fontWeight: '700' }; // Gold
        if (rank === 2) return { color: '#C0C0C0', fontWeight: '700' }; // Silver
        if (rank === 3) return { color: '#CD7F32', fontWeight: '700' }; // Bronze
        return { color: 'var(--color-text-muted)', fontWeight: '600' };
    };

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    };

    return (
        <div>
            <h3 style={{
                fontSize: '16px',
                fontWeight: '700',
                color: 'var(--color-text)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                🏆 Leaderboard
            </h3>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                <button
                    onClick={() => setTab('score')}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: tab === 'score' ? 'var(--color-green)' : 'var(--color-green-subtle)',
                        color: tab === 'score' ? 'white' : 'var(--color-green-dark)'
                    }}
                >
                    By Score
                </button>
                <button
                    onClick={() => setTab('streak')}
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: tab === 'streak' ? 'var(--color-green)' : 'var(--color-green-subtle)',
                        color: tab === 'streak' ? 'white' : 'var(--color-green-dark)'
                    }}
                >
                    By Streak
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
                    Loading...
                </div>
            )}

            {/* Leaderboard List */}
            {!loading && (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {leaderboard.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                            No scores yet. Be the first!
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {leaderboard.map((user) => (
                                <div
                                    key={user.user_id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '10px 12px',
                                        backgroundColor: user.rank <= 3 ? 'rgba(34, 197, 94, 0.06)' : 'transparent',
                                        borderRadius: '8px',
                                        gap: '10px'
                                    }}
                                >
                                    {/* Rank */}
                                    <div style={{
                                        width: '28px',
                                        textAlign: 'center',
                                        fontSize: '13px',
                                        ...getRankStyle(user.rank)
                                    }}>
                                        {getRankEmoji(user.rank) || `#${user.rank}`}
                                    </div>

                                    {/* Avatar */}
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--color-green-subtle)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        color: 'var(--color-green-dark)'
                                    }}>
                                        {user.username?.[0]?.toUpperCase() || '?'}
                                    </div>

                                    {/* Username */}
                                    <div style={{
                                        flex: 1,
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: 'var(--color-text)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {user.username}
                                    </div>

                                    {/* Score/Streak */}
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: tab === 'score' ? 'var(--color-brown)' : 'var(--color-green-dark)'
                                    }}>
                                        {tab === 'score' ? user.score : user.best_streak}
                                    </div>
                                </div>
                            ))}

                            {/* Current User (if not in top 25) */}
                            {currentUser && (
                                <>
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '4px 0',
                                        fontSize: '11px',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        • • •
                                    </div>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '10px 12px',
                                            backgroundColor: 'rgba(139, 90, 43, 0.08)',
                                            borderRadius: '8px',
                                            border: '1px dashed var(--color-brown-light)',
                                            gap: '10px'
                                        }}
                                    >
                                        {/* Rank */}
                                        <div style={{
                                            width: '28px',
                                            textAlign: 'center',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: 'var(--color-brown)'
                                        }}>
                                            #{currentUser.rank}
                                        </div>

                                        {/* Avatar */}
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            backgroundColor: 'var(--color-brown-light)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: 'white'
                                        }}>
                                            {currentUser.username?.[0]?.toUpperCase() || '?'}
                                        </div>

                                        {/* Username */}
                                        <div style={{
                                            flex: 1,
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: 'var(--color-brown)'
                                        }}>
                                            You
                                        </div>

                                        {/* Score/Streak */}
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            color: 'var(--color-brown)'
                                        }}>
                                            {tab === 'score' ? currentUser.score : currentUser.best_streak}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
