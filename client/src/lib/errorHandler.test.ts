import { describe, it, expect } from 'vitest';
import { getErrorMessage, shouldLogout, isNetworkError } from './errorHandler';

describe('Error Handler', () => {
  describe('getErrorMessage', () => {
    it('should handle authentication errors silently', () => {
      const error = new Error('Not authenticated');
      const result = getErrorMessage(error);

      expect(result.title).toBe('');
      expect(result.message).toBe('');
      expect(result.action).toBe('redirect_login');
    });

    it('should handle invalid credentials', () => {
      const error = new Error('Invalid credentials');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Login Failed');
      expect(result.message).toContain('Invalid email or password');
    });

    it('should handle email already registered', () => {
      const error = new Error('Email already registered');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Registration Failed');
      expect(result.message).toContain('already registered');
    });

    it('should handle password validation errors', () => {
      const error = new Error(
        'Password must contain at least one uppercase letter'
      );
      const result = getErrorMessage(error);

      expect(result.title).toBe('Weak Password');
      expect(result.message).toContain('Password must contain');
    });

    it('should handle password mismatch errors', () => {
      const error = new Error('Passwords do not match');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Password Mismatch');
      expect(result.message).toContain('do not match');
    });

    it('should handle permission errors', () => {
      const error = new Error('Permission denied');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Access Denied');
      expect(result.message).toContain('permission');
    });

    it('should handle 403 status code', () => {
      const error = new Error('403 Forbidden');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Access Denied');
    });

    it('should handle not found errors', () => {
      const error = new Error('Resource not found');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Not Found');
      expect(result.message).toContain('not found');
    });

    it('should handle 404 status code', () => {
      const error = new Error('404 Not Found');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Not Found');
    });

    it('should handle network errors', () => {
      const error = new Error('Network request failed');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Connection Error');
      expect(result.message).toContain('connection');
    });

    it('should handle fetch errors', () => {
      const error = new Error('Fetch failed');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Connection Error');
    });

    it('should handle generic Error objects', () => {
      const error = new Error('Something went wrong');
      const result = getErrorMessage(error);

      expect(result.title).toBe('Error');
      expect(result.message).toBe('Something went wrong');
    });

    it('should handle non-Error objects', () => {
      const result = getErrorMessage({ unknown: 'object' });

      expect(result.title).toBe('Unexpected Error');
      expect(result.message).toContain('unexpected error');
    });

    it('should handle null/undefined', () => {
      const resultNull = getErrorMessage(null);
      const resultUndefined = getErrorMessage(undefined);

      expect(resultNull.title).toBe('Unexpected Error');
      expect(resultUndefined.title).toBe('Unexpected Error');
    });

    it('should handle string errors', () => {
      const result = getErrorMessage('Some error string');

      expect(result.title).toBe('Unexpected Error');
    });
  });

  describe('shouldLogout', () => {
    it('should return true for not authenticated errors', () => {
      const error = new Error('Not authenticated');
      expect(shouldLogout(error)).toBe(true);
    });

    it('should return true for invalid token errors', () => {
      const error = new Error('Invalid token');
      expect(shouldLogout(error)).toBe(true);
    });

    it('should return true for token expired errors', () => {
      const error = new Error('Token expired');
      expect(shouldLogout(error)).toBe(true);
    });

    it('should return true for could not validate credentials', () => {
      const error = new Error('Could not validate credentials');
      expect(shouldLogout(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Some other error');
      expect(shouldLogout(error)).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(shouldLogout({})).toBe(false);
      expect(shouldLogout(null)).toBe(false);
      expect(shouldLogout(undefined)).toBe(false);
    });
  });

  describe('isNetworkError', () => {
    it('should return true for network errors', () => {
      const error = new Error('Network request failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for fetch failed errors', () => {
      const error = new Error('Fetch failed');
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return true for NetworkError name', () => {
      const error = new Error('Connection lost');
      error.name = 'NetworkError';
      expect(isNetworkError(error)).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new Error('Invalid credentials');
      expect(isNetworkError(error)).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isNetworkError({})).toBe(false);
      expect(isNetworkError(null)).toBe(false);
      expect(isNetworkError(undefined)).toBe(false);
    });

    it('should be case insensitive', () => {
      const error1 = new Error('NETWORK ERROR');
      const error2 = new Error('Fetch FAILED');

      expect(isNetworkError(error1)).toBe(true);
      expect(isNetworkError(error2)).toBe(true);
    });
  });
});
