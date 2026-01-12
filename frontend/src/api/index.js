/**
 * NutriGuide API Layer
 * 
 * Centralized exports for all API modules.
 * This barrel file allows importing multiple API functions in one line:
 * 
 * @example
 * import { login, getProfile, searchFoods } from './api';
 * 
 * Or import specific modules:
 * import * as authApi from './api/auth';
 */

// Re-export all API modules
export * as auth from './auth';
export * as profile from './profile';
export * as foods from './foods';
export * as log from './log';
export * as analysis from './analysis';
export * as facts from './facts';
export * as challenges from './challenges';
export * as admin from './admin';

// Also export the configured axios client for advanced usage
export { default as api } from './client';
