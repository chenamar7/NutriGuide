import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, Input, Loading, ErrorMessage } from '../components/common';
import logo from '../assets/logo.png';

/**
 * Login Page
 * 
 * Elegant auth form with subtle green-tinted background,
 * green accent bar, and brown secondary accents
 */

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-background" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative green circle - top right */}
            <div style={{
                position: 'absolute',
                top: '-80px',
                right: '-80px',
                width: '250px',
                height: '250px',
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%)',
                borderRadius: '50%'
            }} />

            {/* Decorative brown circle - bottom left (secondary color) */}
            <div style={{
                position: 'absolute',
                bottom: '-60px',
                left: '-60px',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(139, 90, 43, 0.06) 0%, transparent 70%)',
                borderRadius: '50%'
            }} />

            {/* Main Card Container - BIGGER */}
            <div style={{
                width: '100%',
                maxWidth: '460px',
                animation: 'fadeIn 0.5s ease-out',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Card with green top accent */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(22, 163, 74, 0.08)'
                }}>
                    {/* Green accent header bar */}
                    <div style={{
                        height: '6px',
                        background: 'linear-gradient(90deg, #16A34A 0%, #22C55E 50%, #4ADE80 100%)'
                    }} />

                    {/* Card content - more padding */}
                    <div style={{ padding: '48px 40px 40px' }}>
                        {/* Logo & Header */}
                        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                            <img
                                src={logo}
                                alt="NutriGuide"
                                style={{
                                    width: '70px',
                                    height: '70px',
                                    objectFit: 'contain',
                                    marginBottom: '14px'
                                }}
                            />
                            <h1 style={{
                                fontSize: '30px',
                                fontWeight: '700',
                                color: '#16A34A',
                                margin: '0 0 8px 0'
                            }}>
                                Welcome Back
                            </h1>
                            <p style={{
                                color: '#6B7280',
                                fontSize: '15px',
                                margin: 0
                            }}>
                                Sign in to continue your nutrition journey
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{ marginBottom: '20px' }}>
                                <ErrorMessage message={error} />
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit}>
                            <Input
                                label="Email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />

                            <Button
                                type="submit"
                                disabled={loading}
                                style={{ width: '100%', marginTop: '8px' }}
                            >
                                {loading ? (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <Loading size="sm" />
                                        Signing in...
                                    </span>
                                ) : (
                                    '🌿 Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Register Link */}
                        <p style={{
                            textAlign: 'center',
                            marginTop: '24px',
                            color: '#6B7280',
                            fontSize: '14px'
                        }}>
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                style={{
                                    color: '#16A34A',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer text - with brown accent */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    fontSize: '13px',
                    color: '#6B7280'
                }}>
                    <span style={{ color: '#8B5A2B' }}>🍂</span> Track your nutrition • Reach your goals <span style={{ color: '#8B5A2B' }}>🍂</span>
                </p>
            </div>

            {/* Fade-in animation */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Login;
