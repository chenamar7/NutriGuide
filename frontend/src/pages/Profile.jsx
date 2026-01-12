import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as profileApi from '../api/profile';

/**
 * Profile Page
 * 
 * Professional, card-based layout with:
 * - Glassmorphism effects
 * - Micro-animations
 * - Skeleton loading
 */

// Skeleton Loading Component
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

const ProfileSkeleton = () => (
    <div className="app-background" style={{ minHeight: '100vh', padding: '24px 40px' }}>
        <style>{`
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header Skeleton */}
            <div style={{ marginBottom: '24px' }}>
                <SkeletonText width="200px" height="32px" />
                <div style={{ marginTop: '8px' }}>
                    <SkeletonText width="300px" height="16px" delay={0.1} />
                </div>
            </div>

            {/* User Card Skeleton */}
            <SkeletonCard height="120px" delay={0.2} />

            {/* Grid Skeleton */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <SkeletonCard height="220px" delay={0.3} />
                <SkeletonCard height="220px" delay={0.4} />
            </div>

            {/* Targets Skeleton */}
            <div style={{ marginTop: '20px' }}>
                <SkeletonCard height="180px" delay={0.5} />
            </div>
        </div>
    </div>
);

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [hasProfileData, setHasProfileData] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    const [hoveredMacro, setHoveredMacro] = useState(null);

    const [profile, setProfile] = useState({
        birth_date: '',
        gender: '',
        height_cm: '',
        weight_kg: '',
        activity_level: '',
        goal: '',
        target_calories: '',
        target_protein_g: '',
        target_carbs_g: '',
        target_fat_g: ''
    });

    const [originalProfile, setOriginalProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profileApi.getProfile();
                if (data) {
                    const profileData = {
                        birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
                        gender: data.gender || '',
                        height_cm: data.height_cm || '',
                        weight_kg: data.weight_kg || '',
                        activity_level: data.activity_level || '',
                        goal: data.goal || '',
                        target_calories: data.target_calories || '',
                        target_protein_g: data.target_protein_g || '',
                        target_carbs_g: data.target_carbs_g || '',
                        target_fat_g: data.target_fat_g || ''
                    };
                    setProfile(profileData);
                    setOriginalProfile(profileData);
                    const hasData = data.target_calories || data.height_cm || data.weight_kg;
                    setHasProfileData(!!hasData);
                    setIsEditing(!hasData);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setIsEditing(true);
            } finally {
                setLoading(false);
                // Trigger fade-in animation after loading
                setTimeout(() => setIsVisible(true), 50);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        setSuccess('');
        setError('');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            await profileApi.updateProfile(profile);
            setOriginalProfile(profile);
            setHasProfileData(true);
            setIsEditing(false);
            setSuccess('Profile saved successfully!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (originalProfile) setProfile(originalProfile);
        setIsEditing(false);
        setError('');
    };

    const handleCalculateTargets = async () => {
        try {
            setCalculating(true);
            setError('');
            const result = await profileApi.calculateTargets();
            if (result.targets) {
                setProfile(prev => ({
                    ...prev,
                    target_calories: result.targets.target_calories || prev.target_calories,
                    target_protein_g: result.targets.target_protein_g || prev.target_protein_g,
                    target_carbs_g: result.targets.target_carbs_g || prev.target_carbs_g,
                    target_fat_g: result.targets.target_fat_g || prev.target_fat_g
                }));
                setOriginalProfile(prev => ({
                    ...prev,
                    target_calories: result.targets.target_calories || prev.target_calories,
                    target_protein_g: result.targets.target_protein_g || prev.target_protein_g,
                    target_carbs_g: result.targets.target_carbs_g || prev.target_carbs_g,
                    target_fat_g: result.targets.target_fat_g || prev.target_fat_g
                }));
                setSuccess('Targets calculated and saved!');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to calculate. Save your body stats first.');
        } finally {
            setCalculating(false);
        }
    };

    // Show skeleton loading
    if (loading) {
        return <ProfileSkeleton />;
    }

    const formatValue = (value, suffix = '') => {
        if (!value) return <span style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>Not set</span>;
        return <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>{value}{suffix}</span>;
    };

    const formatGoal = (goal) => {
        if (goal === 'Loss') return 'Lose Weight';
        if (goal === 'Maintain') return 'Maintain Weight';
        if (goal === 'Gain') return 'Gain Weight';
        return <span style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>Not set</span>;
    };

    const formatActivityLevel = (level) => {
        if (level === 'Light') return 'Light (1-2 days/week)';
        if (level === 'Moderate') return 'Moderate (3-5 days/week)';
        if (level === 'Heavy') return 'Heavy (6-7 days/week)';
        return <span style={{ color: 'var(--color-text-light)', fontStyle: 'italic' }}>Not set</span>;
    };

    // Macro card data
    const macroCards = [
        { key: 'calories', label: 'Calories', value: profile.target_calories, unit: 'kcal', icon: '🔥', color: '#16A34A' },
        { key: 'protein', label: 'Protein', value: profile.target_protein_g, unit: 'g', icon: '🥩', color: '#DC2626' },
        { key: 'carbs', label: 'Carbs', value: profile.target_carbs_g, unit: 'g', icon: '🍞', color: '#EA580C' },
        { key: 'fat', label: 'Fat', value: profile.target_fat_g, unit: 'g', icon: '🥑', color: '#65A30D' }
    ];

    // Glassmorphism card style
    const glassCard = {
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    };

    return (
        <div className="app-background" style={{ minHeight: '100vh', padding: '24px 40px', position: 'relative', overflow: 'hidden' }}>
            {/* CSS Animations */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                @keyframes glow {
                    0%, 100% { box-shadow: 0 4px 20px rgba(22, 163, 74, 0.25); }
                    50% { box-shadow: 0 4px 30px rgba(22, 163, 74, 0.4); }
                }
                .macro-card:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                }
                .glass-card:hover {
                    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
                    transform: translateY(-2px);
                }
                .input-glow:focus {
                    border-color: var(--color-green) !important;
                    box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
                }
            `}</style>

            {/* Decorative Background Elements */}
            <div style={{
                position: 'absolute',
                top: '-100px',
                right: '-100px',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(22, 163, 74, 0.08) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
                animation: 'float 6s ease-in-out infinite'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-50px',
                left: '-50px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(139, 90, 43, 0.06) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none',
                animation: 'float 8s ease-in-out infinite reverse'
            }} />

            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Page Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px',
                    animation: isVisible ? 'fadeInUp 0.5s ease-out' : 'none'
                }}>
                    <div>
                        <h1 style={{
                            color: 'var(--color-green-dark)',
                            fontSize: '26px',
                            fontWeight: '700',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            👤 Profile
                        </h1>
                        <p style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '14px',
                            marginTop: '4px'
                        }}>
                            Manage your personal information and nutrition targets
                        </p>
                    </div>

                    {hasProfileData && !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '10px',
                                border: '2px solid var(--color-brown-light)',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                color: 'var(--color-brown)',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--color-brown-light)';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 90, 43, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                e.currentTarget.style.color = 'var(--color-brown)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            ✏️ Edit Profile
                        </button>
                    )}
                </div>

                {/* Messages */}
                {success && (
                    <div style={{
                        padding: '14px 18px',
                        background: 'rgba(220, 252, 231, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '12px',
                        border: '1px solid #BBF7D0',
                        color: '#15803D',
                        marginBottom: '20px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        animation: 'fadeInUp 0.3s ease-out',
                        boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)'
                    }}>
                        <span style={{ fontSize: '18px' }}>✓</span> {success}
                    </div>
                )}
                {error && (
                    <div style={{
                        padding: '14px 18px',
                        background: 'rgba(254, 226, 226, 0.95)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '12px',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        marginBottom: '20px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        animation: 'fadeInUp 0.3s ease-out',
                        boxShadow: '0 4px 12px rgba(220, 38, 38, 0.15)'
                    }}>
                        <span style={{ fontSize: '18px' }}>✕</span> {error}
                    </div>
                )}

                {/* User Info Card */}
                <div style={{
                    background: 'linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%)',
                    borderRadius: '20px',
                    padding: '28px',
                    marginBottom: '20px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(22, 163, 74, 0.25)',
                    animation: isVisible ? 'fadeInUp 0.5s ease-out 0.1s both, glow 3s ease-in-out infinite' : 'none'
                }}>
                    {/* Background decoration */}
                    <div style={{
                        position: 'absolute',
                        top: '-30px',
                        right: '-10px',
                        fontSize: '140px',
                        opacity: 0.1,
                        animation: 'float 4s ease-in-out infinite'
                    }}>
                        👤
                    </div>
                    <div style={{
                        position: 'absolute',
                        bottom: '-20px',
                        left: '30%',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        borderRadius: '50%'
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '68px',
                                height: '68px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(8px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px',
                                fontWeight: '700',
                                border: '3px solid rgba(255,255,255,0.4)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                animation: 'pulse 2s ease-in-out infinite'
                            }}>
                                {user?.username?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    {user?.username || 'User'}
                                </h2>
                                <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>
                                    {user?.email || 'No email set'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px',
                    marginBottom: '20px'
                }}>
                    {/* Body Stats Card */}
                    <div
                        className="glass-card"
                        style={{
                            ...glassCard,
                            animation: isVisible ? 'fadeInUp 0.5s ease-out 0.2s both' : 'none',
                            transform: hoveredCard === 'body' ? 'translateY(-4px)' : 'none',
                            boxShadow: hoveredCard === 'body'
                                ? '0 12px 40px rgba(0, 0, 0, 0.15)'
                                : '0 4px 30px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseEnter={() => setHoveredCard('body')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                            background: 'rgba(250, 250, 250, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{ fontSize: '20px' }}>📊</span>
                            <h3 style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#1F2937',
                                letterSpacing: '-0.3px'
                            }}>
                                Body Stats
                            </h3>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {/* Birth Date */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '600',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px'
                                    }}>
                                        Birth Date
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="date"
                                            name="birth_date"
                                            value={profile.birth_date}
                                            onChange={handleChange}
                                            className="input-glow"
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '10px',
                                                border: '2px solid rgba(0, 0, 0, 0.08)',
                                                fontSize: '14px',
                                                outline: 'none',
                                                transition: 'all 0.3s ease',
                                                background: 'rgba(255, 255, 255, 0.9)'
                                            }}
                                        />
                                    ) : (
                                        <div style={{ fontSize: '15px', padding: '8px 0' }}>{formatValue(profile.birth_date)}</div>
                                    )}
                                </div>
                                {/* Gender */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '600',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px'
                                    }}>
                                        Gender
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="gender"
                                            value={profile.gender}
                                            onChange={handleChange}
                                            className="input-glow"
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '10px',
                                                border: '2px solid rgba(0, 0, 0, 0.08)',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    ) : (
                                        <div style={{ fontSize: '15px', padding: '8px 0' }}>{formatValue(profile.gender)}</div>
                                    )}
                                </div>
                                {/* Height */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '600',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px'
                                    }}>
                                        Height
                                    </label>
                                    {isEditing ? (
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="number"
                                                name="height_cm"
                                                value={profile.height_cm}
                                                onChange={handleChange}
                                                placeholder="175"
                                                className="input-glow"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 40px 12px 14px',
                                                    borderRadius: '10px',
                                                    border: '2px solid rgba(0, 0, 0, 0.08)',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                right: '14px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--color-text-muted)',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }}>cm</span>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '15px', padding: '8px 0' }}>{formatValue(profile.height_cm, ' cm')}</div>
                                    )}
                                </div>
                                {/* Weight */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '600',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px'
                                    }}>
                                        Weight
                                    </label>
                                    {isEditing ? (
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="number"
                                                name="weight_kg"
                                                value={profile.weight_kg}
                                                onChange={handleChange}
                                                placeholder="70"
                                                step="0.1"
                                                className="input-glow"
                                                style={{
                                                    width: '100%',
                                                    padding: '12px 40px 12px 14px',
                                                    borderRadius: '10px',
                                                    border: '2px solid rgba(0, 0, 0, 0.08)',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                right: '14px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--color-text-muted)',
                                                fontSize: '13px',
                                                fontWeight: '500'
                                            }}>kg</span>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '15px', padding: '8px 0' }}>{formatValue(profile.weight_kg, ' kg')}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity & Goal Card */}
                    <div
                        className="glass-card"
                        style={{
                            ...glassCard,
                            animation: isVisible ? 'fadeInUp 0.5s ease-out 0.3s both' : 'none',
                            transform: hoveredCard === 'activity' ? 'translateY(-4px)' : 'none',
                            boxShadow: hoveredCard === 'activity'
                                ? '0 12px 40px rgba(0, 0, 0, 0.15)'
                                : '0 4px 30px rgba(0, 0, 0, 0.08)'
                        }}
                        onMouseEnter={() => setHoveredCard('activity')}
                        onMouseLeave={() => setHoveredCard(null)}
                    >
                        <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                            background: 'rgba(250, 250, 250, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span style={{ fontSize: '20px' }}>🎯</span>
                            <h3 style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#1F2937',
                                letterSpacing: '-0.3px'
                            }}>
                                Activity & Goal
                            </h3>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {/* Activity Level */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '600',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px'
                                    }}>
                                        Activity Level
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="activity_level"
                                            value={profile.activity_level}
                                            onChange={handleChange}
                                            className="input-glow"
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '10px',
                                                border: '2px solid rgba(0, 0, 0, 0.08)',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Light">Light (1-2 days/week)</option>
                                            <option value="Moderate">Moderate (3-5 days/week)</option>
                                            <option value="Heavy">Heavy (6-7 days/week)</option>
                                        </select>
                                    ) : (
                                        <div style={{ fontSize: '15px', padding: '8px 0' }}>{formatActivityLevel(profile.activity_level)}</div>
                                    )}
                                </div>
                                {/* Goal */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '6px',
                                        fontWeight: '600',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '11px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.8px'
                                    }}>
                                        Goal
                                    </label>
                                    {isEditing ? (
                                        <select
                                            name="goal"
                                            value={profile.goal}
                                            onChange={handleChange}
                                            className="input-glow"
                                            style={{
                                                width: '100%',
                                                padding: '12px 14px',
                                                borderRadius: '10px',
                                                border: '2px solid rgba(0, 0, 0, 0.08)',
                                                fontSize: '14px',
                                                outline: 'none',
                                                background: 'rgba(255, 255, 255, 0.9)',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <option value="">Select...</option>
                                            <option value="Loss">Lose Weight</option>
                                            <option value="Maintain">Maintain Weight</option>
                                            <option value="Gain">Gain Weight</option>
                                        </select>
                                    ) : (
                                        <div style={{
                                            fontSize: '15px',
                                            padding: '8px 0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            {profile.goal && (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    background: profile.goal === 'Loss'
                                                        ? 'linear-gradient(135deg, #FEE2E2, #FECACA)'
                                                        : profile.goal === 'Gain'
                                                            ? 'linear-gradient(135deg, #DCFCE7, #BBF7D0)'
                                                            : 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                                                    color: profile.goal === 'Loss' ? '#DC2626' : profile.goal === 'Gain' ? '#16A34A' : '#D97706',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                                }}>
                                                    {profile.goal === 'Loss' ? '📉' : profile.goal === 'Gain' ? '📈' : '⚖️'} {formatGoal(profile.goal)}
                                                </span>
                                            )}
                                            {!profile.goal && formatGoal(profile.goal)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nutrition Targets Card - Full Width */}
                <div
                    className="glass-card"
                    style={{
                        ...glassCard,
                        marginBottom: '20px',
                        animation: isVisible ? 'fadeInUp 0.5s ease-out 0.4s both' : 'none'
                    }}
                >
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                        background: 'rgba(250, 250, 250, 0.5)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>🥗</span>
                            <h3 style={{
                                margin: 0,
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#1F2937',
                                letterSpacing: '-0.3px'
                            }}>
                                Daily Nutrition Targets
                            </h3>
                        </div>
                        <button
                            onClick={handleCalculateTargets}
                            disabled={calculating || isEditing}
                            title={isEditing ? 'Save first' : 'Auto-calculate from your stats'}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: '2px solid var(--color-green)',
                                background: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                color: 'var(--color-green-dark)',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: (calculating || isEditing) ? 'not-allowed' : 'pointer',
                                opacity: (calculating || isEditing) ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={(e) => {
                                if (!calculating && !isEditing) {
                                    e.currentTarget.style.background = 'var(--color-green-subtle)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.2)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            ⚡ {calculating ? 'Calculating...' : 'Auto-Calculate'}
                        </button>
                    </div>
                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {macroCards.map((macro, index) => (
                                <div
                                    key={macro.key}
                                    className="macro-card"
                                    style={{
                                        background: `linear-gradient(135deg, ${macro.color}08 0%, ${macro.color}12 100%)`,
                                        borderRadius: '14px',
                                        padding: isEditing ? '16px' : '20px 16px',
                                        textAlign: 'center',
                                        border: `1px solid ${macro.color}20`,
                                        cursor: 'default',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        transform: hoveredMacro === macro.key ? 'translateY(-4px) scale(1.02)' : 'none',
                                        boxShadow: hoveredMacro === macro.key
                                            ? `0 12px 24px ${macro.color}25`
                                            : `0 2px 8px ${macro.color}10`,
                                        animation: isVisible ? `fadeInUp 0.4s ease-out ${0.5 + index * 0.1}s both` : 'none'
                                    }}
                                    onMouseEnter={() => setHoveredMacro(macro.key)}
                                    onMouseLeave={() => setHoveredMacro(null)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        marginBottom: isEditing ? '10px' : '8px'
                                    }}>
                                        <span style={{
                                            fontSize: '18px',
                                            filter: hoveredMacro === macro.key ? 'scale(1.2)' : 'none',
                                            transition: 'all 0.3s ease'
                                        }}>{macro.icon}</span>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            color: 'var(--color-text-muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {macro.label}
                                        </span>
                                    </div>
                                    {isEditing ? (
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="number"
                                                name={macro.key === 'calories' ? 'target_calories' : `target_${macro.key}_g`}
                                                value={macro.value}
                                                onChange={handleChange}
                                                className="input-glow"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 30px 10px 12px',
                                                    borderRadius: '10px',
                                                    border: `2px solid ${macro.color}30`,
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    textAlign: 'center',
                                                    outline: 'none',
                                                    background: 'rgba(255, 255, 255, 0.95)',
                                                    color: macro.color,
                                                    transition: 'all 0.3s ease'
                                                }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: 'var(--color-text-muted)',
                                                fontSize: '12px'
                                            }}>
                                                {macro.unit}
                                            </span>
                                        </div>
                                    ) : (
                                        <div style={{
                                            fontSize: '32px',
                                            fontWeight: '800',
                                            color: macro.color,
                                            lineHeight: 1,
                                            textShadow: hoveredMacro === macro.key ? `0 2px 8px ${macro.color}30` : 'none',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {macro.value || '—'}
                                            <span style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                opacity: 0.7,
                                                marginLeft: '2px'
                                            }}>
                                                {macro.unit}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        ...glassCard,
                        padding: '20px',
                        animation: isVisible ? 'fadeInUp 0.5s ease-out 0.6s both' : 'none'
                    }}>
                        {hasProfileData && (
                            <button
                                onClick={handleCancel}
                                style={{
                                    flex: 1,
                                    padding: '14px 24px',
                                    borderRadius: '12px',
                                    border: '2px solid #E5E7EB',
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#F3F4F6';
                                    e.currentTarget.style.borderColor = '#D1D5DB';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                flex: 2,
                                padding: '14px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, var(--color-green) 0%, var(--color-green-dark) 100%)',
                                color: 'white',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer',
                                opacity: saving ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.35)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={(e) => {
                                if (!saving) {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.45)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.35)';
                            }}
                        >
                            💾 {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
