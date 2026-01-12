import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

/**
 * MainLayout Component
 * 
 * Layout wrapper for authenticated pages
 * Includes:
 * - Navbar at top
 * - Main content area
 * - Footer at bottom
 */
export const MainLayout = ({ children }) => {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#FAFAF8',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Navbar />

            <main style={{
                flex: 1,
                maxWidth: '1400px',
                width: '100%',
                margin: '0 auto'
            }}>
                {children}
            </main>

            {/* Footer */}
            <footer style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, #F3E5D7 0%, #E7D4C0 100%)',
                borderTop: '2px solid #8B5A2B',
                textAlign: 'center'
            }}>
                <p style={{
                    margin: 0,
                    color: '#6B4423',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
                    NutriGuide • Database Course Project • Omri Nahum & Chen Amar
                </p>
            </footer>
        </div>
    );
};
