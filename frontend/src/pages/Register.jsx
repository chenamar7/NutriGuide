import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authApi from '../api/auth';
import { Button, Input, Loading, ErrorMessage } from '../components/common';
import logo from '../assets/logo.png';

/**
 * Register Page
 * 
 * Elegant registration form with subtle green-tinted background,
 * green accent bar, and brown secondary accents (matching Login)
 */

const Register = () => {
    const navigate = useNavigate();

    // Form state
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const errors = {};

        if (!formData.username.trim()) {
            errors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            errors.username = 'Username must be at least 3 characters';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        setLoading(true);

        try {
            await authApi.register(formData.username, formData.email, formData.password);

            navigate('/login', {
                state: { message: 'Account created successfully! Please sign in.' }
            });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
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
                                Create Account
                            </h1>
                            <p style={{
                                color: '#6B7280',
                                fontSize: '15px',
                                margin: 0
                            }}>
                                Start your nutrition journey today
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{ marginBottom: '20px' }}>
                                <ErrorMessage message={error} />
                            </div>
                        )}

                        {/* Register Form */}
                        <form onSubmit={handleSubmit}>
                            <Input
                                label="Username"
                                type="text"
                                name="username"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                                error={fieldErrors.username}
                                disabled={loading}
                            />

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                error={fieldErrors.email}
                                disabled={loading}
                            />

                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="At least 6 characters"
                                value={formData.password}
                                onChange={handleChange}
                                error={fieldErrors.password}
                                disabled={loading}
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="Repeat your password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={fieldErrors.confirmPassword}
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
                                        Creating account...
                                    </span>
                                ) : (
                                    '🌿 Create Account'
                                )}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <p style={{
                            textAlign: 'center',
                            marginTop: '24px',
                            color: '#6B7280',
                            fontSize: '14px'
                        }}>
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{
                                    color: '#16A34A',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}
                            >
                                Sign in
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

export default Register;
