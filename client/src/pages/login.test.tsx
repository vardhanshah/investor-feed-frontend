import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Login from './login';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = '/api';

// Mock useLocation from wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/', mockSetLocation],
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSetLocation.mockClear();
  });

  it('should render login form', async () => {
    render(<Login />);

    // Wait for auth loading to complete
    await waitFor(() => {
      expect(screen.getByText(/sign in to your/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should display social login buttons', async () => {
    render(<Login />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /x \(twitter\)/i })).toBeInTheDocument();
  });

  it('should have link to signup page', async () => {
    render(<Login />);

    await waitFor(() => {
      expect(screen.getByText(/create a new account/i)).toBeInTheDocument();
    });
    const signupLink = screen.getByText(/create a new account/i);
    expect(signupLink.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('should have link to home page', async () => {
    render(<Login />);

    await waitFor(() => {
      expect(screen.getAllByText(/back to home/i)[0]).toBeInTheDocument();
    });
  });

  it('should require email and password fields', async () => {
    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should successfully login with valid credentials', async () => {
    const user = userEvent.setup();

    render(<Login />);

    // Wait for auth loading to complete
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Fill in the form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for login to complete
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });

    // Check that token was stored
    expect(localStorage.getItem('authToken')).toBe('mock-token-123');
  });

  it('should show error message on invalid credentials', async () => {
    const user = userEvent.setup();

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Fill in with wrong credentials
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error message (using getAllByText since it appears in both alert and toast)
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/invalid email or password/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });

    // Should not redirect
    expect(mockSetLocation).not.toHaveBeenCalled();

    // Should not store token
    expect(localStorage.getItem('authToken')).toBeNull();
  });

  it('should disable form fields while loading', async () => {
    const user = userEvent.setup();

    // Delay the response to test loading state
    server.use(
      http.post(`${API_BASE_URL}/user/login`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          access_token: 'mock-token-123',
          token_type: 'bearer',
          user_id: 1,
          email: 'test@example.com',
        });
      })
    );

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Test123!');
    await user.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
    });

    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();

    // Wait for completion
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });
  });

  it('should show loading text on submit button', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/user/login`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          access_token: 'mock-token-123',
          token_type: 'bearer',
          user_id: 1,
          email: 'test@example.com',
        });
      })
    );

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });
  });

  it('should clear error message on new submission', async () => {
    const user = userEvent.setup();

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // First submission with wrong credentials
    await user.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for error in alert component
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    // Clear and enter correct credentials
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Test123!');

    // Submit again
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Alert component error should be cleared (error state is set to null)
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/user/login`, () => {
        return HttpResponse.error();
      })
    );

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(mockSetLocation).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  it('should validate password field type', async () => {
    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    expect(passwordInput.type).toBe('password');
  });

  it('should have forgot password link', async () => {
    render(<Login />);

    await waitFor(() => {
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
    });

    const forgotLink = screen.getByText(/forgot your password/i);
    expect(forgotLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });

  it('should call login with correct API payload', async () => {
    const user = userEvent.setup();
    let requestBody: any;

    server.use(
      http.post(`${API_BASE_URL}/user/login`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          access_token: 'mock-token-123',
          token_type: 'bearer',
          user_id: 1,
          email: 'test@example.com',
        });
      })
    );

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(requestBody).toEqual({
        email: 'test@example.com',
        password: 'Test123!',
      });
    });
  });

  it('should update AuthContext after successful login', async () => {
    const user = userEvent.setup();

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });

    // Token should be stored (AuthContext login was called)
    expect(localStorage.getItem('authToken')).toBe('mock-token-123');
  });

  it('should handle 401 unauthorized errors', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/user/login`, () => {
        return HttpResponse.json(
          { detail: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      const errorMessages = screen.getAllByText(/invalid email or password/i);
      expect(errorMessages.length).toBeGreaterThan(0);
    });
  });

  it('should prevent form submission when already loading', async () => {
    const user = userEvent.setup();

    let loginCallCount = 0;
    server.use(
      http.post(`${API_BASE_URL}/user/login`, async () => {
        loginCallCount++;
        await new Promise((resolve) => setTimeout(resolve, 500));
        return HttpResponse.json({
          access_token: 'mock-token-123',
          token_type: 'bearer',
          user_id: 1,
          email: 'test@example.com',
        });
      })
    );

    render(<Login />);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Test123!');

    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Click once
    await user.click(submitButton);

    // Button should be disabled while loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Try to click again - should not trigger another request since button is disabled
    await user.click(submitButton);

    // Wait for the login to complete
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });

    // Only one API call should have been made
    expect(loginCallCount).toBe(1);
  });
});
