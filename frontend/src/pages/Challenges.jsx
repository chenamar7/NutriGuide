import React, { useState, useEffect, useCallback } from 'react';
import { Timer } from '../components/challenges/Timer';
import { OptionButton } from '../components/challenges/OptionButton';
import { StatsDisplay } from '../components/challenges/StatsDisplay';
import { Leaderboard } from '../components/challenges/Leaderboard';
import * as challengesApi from '../api/challenges';

// Skeleton Loading Components
const SkeletonCard = ({ height = '200px', delay = 0 }) => (
    <div style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: `shimmer 1.5s infinite ${delay}s`,
        borderRadius: '16px',
        height,
        border: '1px solid #E5E7EB'
    }} />
);

const SkeletonText = ({ width = '100%', height = '20px', delay = 0 }) => (
    <div style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: `shimmer 1.5s infinite ${delay}s`,
        borderRadius: '6px',
        width,
        height
    }} />
);

const ChallengesSkeleton = () => (
    <div className="app-background" style={{ minHeight: '100vh', padding: '40px' }}>
        <style>{`
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Header Skeleton */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <SkeletonText width="280px" height="36px" />
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                    <SkeletonText width="320px" height="16px" delay={0.1} />
                </div>
            </div>

            {/* Stats Skeleton */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                <SkeletonCard height="90px" delay={0.2} />
            </div>

            {/* Title Skeleton */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <SkeletonText width="180px" height="24px" delay={0.3} />
            </div>

            {/* Grid Skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '32px' }}>
                {[0.3, 0.35, 0.4, 0.45, 0.5, 0.55].map((delay, i) => (
                    <SkeletonCard key={i} height="70px" delay={delay} />
                ))}
            </div>

            {/* Button Skeleton */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SkeletonText width="180px" height="50px" delay={0.6} />
            </div>
        </div>
    </div>
);

const Challenges = () => {
    // View state: 'lobby' or 'quiz'
    const [view, setView] = useState('lobby');
    const [isVisible, setIsVisible] = useState(false);

    // Challenge state
    const [challenge, setChallenge] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Category filter
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Quiz state
    const [resetCount, setResetCount] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedOption, setSelectedOption] = useState(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [correctAnswerId, setCorrectAnswerId] = useState(null);

    // Tracking
    const [excludedIds, setExcludedIds] = useState([]);
    const [questionNumber, setQuestionNumber] = useState(1);

    // Stats
    const [score, setScore] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);

    // Fetch initial data (categories and stats)
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const cats = await challengesApi.getCategories();
                setCategories(cats || []);

                const stats = await challengesApi.getStats();
                setScore(stats.challenge_score || 0);
                setCurrentStreak(stats.challenge_streak || 0);
                setBestStreak(stats.best_streak || 0);
            } catch (err) {
                console.log('Could not load initial data');
            } finally {
                setLoading(false);
                setTimeout(() => setIsVisible(true), 50);
            }
        };
        fetchInitialData();
    }, []);

    // Fetch a random challenge
    const fetchChallenge = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const options = { exclude: excludedIds };
            if (selectedCategory) {
                options.category = selectedCategory;
            }
            const data = await challengesApi.getRandomChallenge(options);
            setChallenge(data);
            setIsRunning(true);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('You completed all challenges in this category!');
            } else {
                setError('Failed to load challenge');
            }
        } finally {
            setLoading(false);
        }
    }, [excludedIds, selectedCategory]);

    // Start quiz with selected category
    const handleStartQuiz = () => {
        setExcludedIds([]);
        setQuestionNumber(1);
        setMessage('');
        setSelectedOption(null);
        setIsRevealed(false);
        setCorrectAnswerId(null);
        setResetCount(prev => prev + 1);
        setView('quiz');
        setChallenge(null);
    };

    // Fetch challenge when entering quiz mode
    useEffect(() => {
        if (view === 'quiz' && challenge === null && !loading) {
            fetchChallenge();
        }
    }, [view, challenge, loading, fetchChallenge]);

    // Back to lobby
    const handleBackToLobby = () => {
        setView('lobby');
        setChallenge(null);
        setError(null);
        setIsRunning(false);
    };

    const handleExpire = () => {
        if (!isRevealed) {
            setMessage("Time's up!");
            setIsRunning(false);
            setIsRevealed(true);
            setCurrentStreak(0);
            if (challenge) {
                setCorrectAnswerId(challenge.correct_answer_id);
            }
        }
    };

    const handleSubmit = async () => {
        if (!challenge || selectedOption === null) return;

        setIsRunning(false);

        try {
            const result = await challengesApi.submitAnswer(challenge.challenge_id, selectedOption);
            setCorrectAnswerId(result.correct_answer_id);
            setIsRevealed(true);

            if (result.correct) {
                setMessage("Correct!");
                setScore(prev => prev + 1);
                const newStreak = currentStreak + 1;
                setCurrentStreak(newStreak);
                if (newStreak > bestStreak) {
                    setBestStreak(newStreak);
                }
            } else {
                setMessage("Incorrect");
                setCurrentStreak(0);
            }
        } catch (err) {
            console.error('Submit error:', err, err.response?.data);
            setMessage("Error submitting answer");
            setIsRevealed(true);
        }
    };

    const handleNext = () => {
        if (challenge) {
            setExcludedIds(prev => [...prev, challenge.challenge_id]);
        }
        setResetCount(prev => prev + 1);
        setMessage('');
        setSelectedOption(null);
        setIsRevealed(false);
        setCorrectAnswerId(null);
        setQuestionNumber(prev => prev + 1);
        setChallenge(null);
    };

    // Skeleton loading for initial load
    if (loading && view === 'lobby' && categories.length === 0) {
        return <ChallengesSkeleton />;
    }

    // LOBBY VIEW - Category Selection
    if (view === 'lobby') {
        const allCategories = [
            { category: '', label: 'All Categories' },
            ...categories.map(c => ({ category: c.category, label: c.category }))
        ];

        return (
            <div className="app-background" style={{ minHeight: '100vh', padding: '40px' }}>
                <style>{`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .category-card {
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .category-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
                    }
                    .stats-card {
                        transition: all 0.3s ease;
                    }
                    .stats-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    }
                    .start-btn {
                        transition: all 0.25s ease;
                    }
                    .start-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 24px rgba(22, 163, 74, 0.35);
                    }
                    .leaderboard-card {
                        transition: all 0.3s ease;
                    }
                    .leaderboard-card:hover {
                        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
                    }
                `}</style>

                {/* Leaderboard - Top Right Corner */}
                <div className="leaderboard-card" style={{
                    position: 'absolute',
                    top: '100px',
                    right: '120px',
                    width: '350px',
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'blur(16px)',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'opacity 0.6s ease 0.2s'
                }}>
                    <Leaderboard />
                </div>

                {/* Center Content */}
                <div style={{
                    maxWidth: '500px',
                    margin: '0 auto',
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <h1 style={{ color: 'var(--color-green-dark)', fontSize: '36px', fontWeight: '700', marginBottom: '10px' }}>
                            Nutrition Challenges
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', margin: 0 }}>
                            Test your nutrition knowledge
                        </p>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
                        <div className="stats-card" style={{
                            display: 'flex',
                            gap: '32px',
                            backgroundColor: 'rgba(255, 255, 255, 0.92)',
                            backdropFilter: 'blur(16px)',
                            padding: '20px 36px',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.8)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Score</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-brown)' }}>{score}</div>
                            </div>
                            <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Streak</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-green-dark)' }}>{currentStreak}</div>
                            </div>
                            <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Best</div>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#B45309' }}>{bestStreak}</div>
                            </div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--color-text)', marginBottom: '20px', textAlign: 'center' }}>
                        Choose a Category
                    </h2>

                    {/* Expandable Dropdown */}
                    <div style={{ position: 'relative', marginBottom: '32px' }}>
                        {/* Dropdown Trigger */}
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="category-card"
                            style={{
                                width: '100%',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderRadius: dropdownOpen ? '12px 12px 0 0' : '12px',
                                padding: '18px 24px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                backdropFilter: 'blur(12px)',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--color-green-dark)' }}>
                                {allCategories.find(c => c.category === selectedCategory)?.label || 'All Categories'}
                            </span>
                            <span style={{
                                color: 'var(--color-text-muted)',
                                fontSize: '12px',
                                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                            }}>▼</span>
                        </button>

                        {/* Dropdown Options */}
                        {dropdownOpen && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                borderTop: 'none',
                                borderRadius: '0 0 12px 12px',
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                                zIndex: 10,
                                overflow: 'hidden'
                            }}>
                                {allCategories.map(cat => (
                                    <button
                                        key={cat.category || 'all'}
                                        onClick={() => {
                                            setSelectedCategory(cat.category);
                                            setDropdownOpen(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            backgroundColor: selectedCategory === cat.category ? 'var(--color-green-subtle)' : 'transparent',
                                            border: 'none',
                                            padding: '14px 24px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            transition: 'background-color 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedCategory !== cat.category) {
                                                e.currentTarget.style.backgroundColor = 'rgba(22, 163, 74, 0.15)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedCategory !== cat.category) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: '15px', fontWeight: '500', color: selectedCategory === cat.category ? 'var(--color-green-dark)' : 'var(--color-text)' }}>
                                            {cat.label}
                                        </span>
                                        {selectedCategory === cat.category && (
                                            <span style={{ color: 'var(--color-green)', fontSize: '16px' }}>✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button
                            onClick={handleStartQuiz}
                            className="btn-primary start-btn"
                            style={{ padding: '16px 56px', fontSize: '17px', fontWeight: '600', borderRadius: '12px' }}
                        >
                            Start Challenge
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Error state in quiz
    if (error) {
        return (
            <div className="app-background" style={{ minHeight: '100vh', padding: '32px 40px' }}>
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                    <h2 style={{ color: 'var(--color-green-dark)', marginBottom: '16px' }}>{error}</h2>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button onClick={() => { setExcludedIds([]); setQuestionNumber(1); setError(null); fetchChallenge(); }} className="btn-primary">
                            Start Over
                        </button>
                        <button onClick={handleBackToLobby} className="btn-secondary">
                            Change Category
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state in quiz
    if (loading && !challenge) {
        return <ChallengesSkeleton />;
    }

    // QUIZ VIEW
    return (
        <div className="app-background" style={{ minHeight: '100vh', padding: '32px 40px' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <button
                        onClick={handleBackToLobby}
                        style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                        ← Back to Categories
                    </button>
                    <h1 style={{ color: 'var(--color-green-dark)', marginBottom: '4px', fontSize: '24px', fontWeight: '700' }}>
                        {selectedCategory || 'All Categories'}
                    </h1>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px', alignItems: 'start' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)' }}>
                    <Timer duration={15} onExpire={handleExpire} isRunning={isRunning} reset={resetCount} />

                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        Question {questionNumber}
                    </div>

                    <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '28px', color: 'var(--color-text)', lineHeight: 1.4 }}>
                        {challenge?.question}
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '28px' }}>
                        {challenge?.options?.map((option, index) => (
                            <OptionButton
                                key={option.option_id}
                                text={option.option_text}
                                optionLabel={String.fromCharCode(65 + index)}
                                isSelected={selectedOption === option.option_id}
                                isCorrect={isRevealed && option.option_id === correctAnswerId}
                                isWrong={isRevealed && selectedOption === option.option_id && option.option_id !== correctAnswerId}
                                isRevealed={isRevealed}
                                disabled={isRevealed}
                                onClick={() => !isRevealed && setSelectedOption(option.option_id)}
                            />
                        ))}
                    </div>

                    {message && (
                        <p style={{ fontSize: '16px', fontWeight: '600', color: message === 'Correct!' ? 'var(--color-green)' : 'var(--color-danger)', textAlign: 'center', marginBottom: '16px' }}>
                            {message}
                        </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {!isRevealed ? (
                            <button onClick={handleSubmit} className="btn-primary" disabled={selectedOption === null} style={{ opacity: selectedOption === null ? 0.5 : 1, padding: '12px 32px' }}>
                                Submit Answer
                            </button>
                        ) : (
                            <button onClick={handleNext} className="btn-primary" style={{ padding: '12px 32px' }}>
                                Next Question
                            </button>
                        )}
                    </div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08)' }}>
                    <StatsDisplay score={score} currentStreak={currentStreak} bestStreak={bestStreak} />
                </div>
            </div>
        </div>
    );
};

export default Challenges;