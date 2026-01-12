import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MainLayout, ProtectedRoute } from './components/layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import FoodLog from './pages/FoodLog';
import Challenges from './pages/Challenges';
import Admin from './pages/Admin';

/**
 * App.jsx - Main Application with Routing
 * 
 * Routes:
 * - /login - Login page (public)
 * - /register - Register page (public)
 * - /dashboard - Dashboard (protected)
 * - /log - Food Log (protected)
 * - /profile - Profile settings (protected)
 * - /admin - Admin dashboard (protected, admin only)
 * - / - Redirects to dashboard
 */

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes (no navbar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes (with navbar) */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/log" element={
            <ProtectedRoute>
              <MainLayout>
                <FoodLog />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/challenges" element={
            <ProtectedRoute>
              <MainLayout>
                <Challenges />
              </MainLayout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Admin route (protected, admin only) */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <MainLayout>
                <Admin />
              </MainLayout>
            </ProtectedRoute>
          } />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

