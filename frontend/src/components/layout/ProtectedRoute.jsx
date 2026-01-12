import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Loading } from '../common/Loading';

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication
 * - Redirects to /login if not authenticated
 * - Redirects to /dashboard if requireAdmin but user is not admin
 */
export const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, loading } = useAuth();

    // Show loading spinner while checking auth status
    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FAFAF8'
            }}>
                <Loading size="lg" text="Loading..." />
            </div>
        );
    }

    // Not logged in -> redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Requires admin but user is not admin -> redirect to dashboard
    if (requireAdmin && !user.isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    // Authenticated -> render children
    return children;
};
