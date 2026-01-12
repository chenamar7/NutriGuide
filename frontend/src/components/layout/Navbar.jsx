import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.png';

/**
 * NavLink Component - Clean navigation link for white navbar
 */
const NavLink = ({ to, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            style={{
                color: isActive ? '#16A34A' : '#4B5563',
                textDecoration: 'none',
                padding: '10px 18px',
                borderRadius: '6px',
                backgroundColor: isActive
                    ? 'rgba(34, 197, 94, 0.1)'
                    : isHovered
                        ? 'rgba(34, 197, 94, 0.06)'
                        : 'transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                border: isActive ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid transparent'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
        </Link>
    );
};

/**
 * Navbar Component
 * 
 * Clean navbar with:
 * - White background with subtle green tint
 * - Green accents and hover effects
 * - Enhanced user avatar with status indicator
 */
export const Navbar = () => {
    const { user, logout } = useAuth();
    const [profileHovered, setProfileHovered] = useState(false);
    const [signInHovered, setSignInHovered] = useState(false);
    const [logoutHovered, setLogoutHovered] = useState(false);

    return (
        <header style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            borderBottom: '1px solid rgba(34, 197, 94, 0.12)',
            padding: '10px 24px',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(34, 197, 94, 0.06)'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <Link to="/dashboard" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textDecoration: 'none'
                }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '8px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid rgba(34, 197, 94, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px'
                    }}>
                        <img
                            src={logo}
                            alt="NutriGuide"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                    <span style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#16A34A',
                        letterSpacing: '-0.3px'
                    }}>
                        NutriGuide
                    </span>
                </Link>

                {/* Navigation Links */}
                <nav style={{ display: 'flex', gap: '4px' }}>
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/log">Food Log</NavLink>
                    <NavLink to="/challenges">Challenges</NavLink>
                    <NavLink to="/profile">Profile</NavLink>
                    {user?.isAdmin && (
                        <NavLink to="/admin">Admin</NavLink>
                    )}
                </nav>

                {/* Right side - User Profile or Sign In */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {user ? (
                        /* Signed In - Show Enhanced Avatar & Username */
                        <>
                            <Link
                                to="/profile"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    textDecoration: 'none',
                                    padding: '6px 14px 6px 6px',
                                    borderRadius: '50px',
                                    backgroundColor: profileHovered
                                        ? 'rgba(34, 197, 94, 0.08)'
                                        : 'rgba(34, 197, 94, 0.04)',
                                    border: '1px solid rgba(34, 197, 94, 0.12)',
                                    transition: 'all 0.2s ease',
                                    boxShadow: profileHovered
                                        ? '0 4px 12px rgba(34, 197, 94, 0.1)'
                                        : 'none'
                                }}
                                onMouseEnter={() => setProfileHovered(true)}
                                onMouseLeave={() => setProfileHovered(false)}
                            >
                                {/* Avatar with status indicator */}
                                <div style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        color: '#fff',
                                        boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                                    }}>
                                        {user.username?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    {/* Online status indicator */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '0px',
                                        right: '0px',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: '#4ade80',
                                        borderRadius: '50%',
                                        border: '2px solid #fff',
                                        boxShadow: '0 0 6px rgba(74, 222, 128, 0.5)'
                                    }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <span style={{
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        color: '#1F2937',
                                        lineHeight: '1.2'
                                    }}>
                                        {user.username}
                                    </span>
                                    <span style={{
                                        fontSize: '11px',
                                        color: '#6B7280',
                                        fontWeight: '400'
                                    }}>
                                        View Profile
                                    </span>
                                </div>
                            </Link>

                            <button
                                onClick={logout}
                                onMouseEnter={() => setLogoutHovered(true)}
                                onMouseLeave={() => setLogoutHovered(false)}
                                style={{
                                    background: logoutHovered
                                        ? 'rgba(239, 68, 68, 0.08)'
                                        : 'transparent',
                                    border: '1px solid rgba(156, 163, 175, 0.3)',
                                    color: logoutHovered ? '#DC2626' : '#6B7280',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        /* Not Signed In - Show Sign In Button */
                        <Link
                            to="/login"
                            style={{
                                background: signInHovered
                                    ? 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)'
                                    : 'transparent',
                                color: signInHovered ? '#fff' : '#16A34A',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                padding: '10px 22px',
                                borderRadius: '25px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.25s ease',
                                textDecoration: 'none',
                                boxShadow: signInHovered
                                    ? '0 4px 12px rgba(34, 197, 94, 0.25)'
                                    : 'none'
                            }}
                            onMouseEnter={() => setSignInHovered(true)}
                            onMouseLeave={() => setSignInHovered(false)}
                        >
                            Sign in <span style={{ fontSize: '16px' }}>→</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};
