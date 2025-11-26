/**
 * Environment variable validation and type-safe access
 * Validates required environment variables at application startup
 */

import { logger } from './logger';

interface EnvConfig {
  // Clerk Authentication
  CLERK_PUBLISHABLE_KEY: string;
  
  // API Configuration
  API_BASE_URL: string;
  
  // Environment
  ENVIRONMENT: 'development' | 'staging' | 'production';
  
  // Optional: AI Services
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
  OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
}

/**
 * Validates and returns environment configuration
 * Throws error if required variables are missing
 */
export function validateEnv(): EnvConfig {
  const errors: string[] = [];
  
  // Required variables
  const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!CLERK_PUBLISHABLE_KEY) {
    errors.push('VITE_CLERK_PUBLISHABLE_KEY is required');
  }
  
  // API Base URL (with fallback)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
  
  // Environment (with fallback)
  const ENVIRONMENT = (import.meta.env.VITE_ENVIRONMENT || 'development') as EnvConfig['ENVIRONMENT'];
  
  // Validate environment value
  if (!['development', 'staging', 'production'].includes(ENVIRONMENT)) {
    errors.push('VITE_ENVIRONMENT must be one of: development, staging, production');
  }
  
  // Throw if any required variables are missing
  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`;
    logger.error('Environment validation failed', new Error(errorMessage));
    throw new Error(errorMessage);
  }
  
  // Optional variables
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
  const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434';
  const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'llama3.1:8b';
  
  // Log warnings for missing optional variables
  if (!OPENAI_API_KEY && ENVIRONMENT === 'production') {
    logger.warn('VITE_OPENAI_API_KEY not set - AI features will be limited');
  }
  
  const config: EnvConfig = {
    CLERK_PUBLISHABLE_KEY,
    API_BASE_URL,
    ENVIRONMENT,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OLLAMA_BASE_URL,
    OLLAMA_MODEL,
  };
  
  // Log configuration in development
  logger.info('Environment configuration loaded', {
    metadata: {
      environment: ENVIRONMENT,
      apiBaseUrl: API_BASE_URL,
      hasOpenAI: !!OPENAI_API_KEY,
      ollamaUrl: OLLAMA_BASE_URL,
    },
  });
  
  return config;
}

/**
 * Cached environment configuration
 */
let cachedEnv: EnvConfig | null = null;

/**
 * Get validated environment configuration
 * Validates once and caches the result
 */
export function getEnv(): EnvConfig {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnv().ENVIRONMENT === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnv().ENVIRONMENT === 'development';
}

/**
 * Check if AI features are available
 */
export function hasAIFeatures(): boolean {
  const env = getEnv();
  return !!(env.OPENAI_API_KEY || env.OLLAMA_BASE_URL);
}
