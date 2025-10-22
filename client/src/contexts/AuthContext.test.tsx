import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://0.0.0.0:8000';

// Test component to access auth context
function TestComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="authenticated">{isAuthenticated.toString()}</div>
      {user && (
        <>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-name">{user.full_name}</div>
        </>
      )}
      <button onClick={() => login('test-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should provide auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = () => {};

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');

    console.error = originalError;
  });

  it('should load user from token on mount', async () => {
    localStorage.setItem('authToken', 'mock-token-123');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially loading
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    // Wait for user to load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
  });

  it('should not load user if no token exists', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });

  it('should handle invalid token by clearing auth', async () => {
    localStorage.setItem('authToken', 'invalid-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('should login with valid token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Mock successful login
    server.use(
      http.get(`${API_BASE_URL}/user/me`, () => {
        return HttpResponse.json({
          user_id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          created_at: '2025-01-01T00:00:00',
        });
      })
    );

    // Trigger login
    screen.getByText('Login').click();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    expect(localStorage.getItem('authToken')).toBe('test-token');
  });

  it('should logout and clear user state', async () => {
    localStorage.setItem('authToken', 'mock-token-123');

    const user = userEvent.setup();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for user to load
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    // Trigger logout
    await user.click(screen.getByText('Logout'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(screen.queryByTestId('user-email')).not.toBeInTheDocument();
  });

  it('should set isPremium flag', async () => {
    localStorage.setItem('authToken', 'mock-token-123');

    function PremiumTestComponent() {
      const { user } = useAuth();
      return <div data-testid="premium">{user?.isPremium?.toString() || 'null'}</div>;
    }

    render(
      <AuthProvider>
        <PremiumTestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('premium')).toHaveTextContent('false');
    });
  });

  it('should handle network errors gracefully', async () => {
    server.use(
      http.get(`${API_BASE_URL}/user/me`, () => {
        return HttpResponse.error();
      })
    );

    localStorage.setItem('authToken', 'test-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Should not be authenticated after error
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  it('should clear token on authentication errors', async () => {
    server.use(
      http.get(`${API_BASE_URL}/user/me`, () => {
        return HttpResponse.json(
          { detail: 'Could not validate credentials' },
          { status: 401 }
        );
      })
    );

    localStorage.setItem('authToken', 'invalid-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });
});
