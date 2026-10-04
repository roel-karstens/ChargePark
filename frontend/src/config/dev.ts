/**
 * Development mode configuration.
 * Centralized dev settings to avoid duplication across components.
 */

export const DEV_MODE = import.meta.env.MODE === 'development';
export const DEV_USER_ID = '5b4b4ba2-ad71-44c8-8e6a-fee9313eee5c';
export const DEV_USER_EMAIL = 'dev@example.com';
export const DEV_TOKEN_ENDPOINT = 'http://localhost:8000/api/v1/dev/token';
export const DEV_TOKEN_TIMEOUT = 5000;
