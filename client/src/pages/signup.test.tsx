import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Signup from './signup';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://0.0.0.0:8000';

// Mock useLocation from wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/', mockSetLocation],
  };
});

describe('Signup Page', () => {
  beforeEach(() => {
    localStorage.clear();
    mockSetLocation.mockClear();
  });

  it('should render signup form', () => {
    render(<Signup />);

    expect(screen.getByText(/create your/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getAllByLabelText(/password/i)[0]).toBeInTheDocument();
    // Button shows "Complete form to continue" when form is empty/invalid
    expect(screen.getByRole('button', { name: /complete form to continue/i })).toBeInTheDocument();
  });

  it('should display social signup buttons', () => {
    render(<Signup />);

    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /x \(twitter\)/i })).toBeInTheDocument();
  });

  it('should have link to login page', () => {
    render(<Signup />);

    const loginLink = screen.getByText(/sign in here/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('should require all form fields', () => {
    render(<Signup />);

    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });

  it('should validate name in real-time', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    const nameInput = screen.getByLabelText(/full name/i);

    // Too short name
    await user.type(nameInput, 'A');
    expect(nameInput).toHaveClass('border-red-500');

    // Valid name
    await user.clear(nameInput);
    await user.type(nameInput, 'John Doe');
    await waitFor(() => {
      expect(nameInput).toHaveClass('border-green-500');
    });
  });

  it('should validate email in real-time', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    const emailInput = screen.getByLabelText(/^email$/i);

    // Invalid email
    await user.type(emailInput, 'invalid');
    expect(emailInput).toHaveClass('border-red-500');

    // Valid email
    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await waitFor(() => {
      expect(emailInput).toHaveClass('border-green-500');
    });
  });

  it('should show password strength requirements', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    const passwordInput = screen.getAllByLabelText(/password/i)[0];

    // Weak password
    await user.type(passwordInput, 'weak');

    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/one uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/one number/i)).toBeInTheDocument();
    expect(screen.getByText(/one special character/i)).toBeInTheDocument();
  });

  it('should validate password strength', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    const passwordInput = screen.getAllByLabelText(/password/i)[0];

    // Strong password
    await user.type(passwordInput, 'Test123!@#');

    await waitFor(() => {
      expect(screen.getByText(/password meets all requirements/i)).toBeInTheDocument();
    });
  });

  it('should validate password confirmation match', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'Test123!');
    await user.type(confirmInput, 'Different123!');

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(confirmInput).toHaveClass('border-red-500');
  });

  it('should show green border when passwords match', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    const passwordInput = screen.getAllByLabelText(/password/i)[0];
    const confirmInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'Test123!');
    await user.type(confirmInput, 'Test123!');

    await waitFor(() => {
      expect(confirmInput).toHaveClass('border-green-500');
    });
  });

  it('should require terms acceptance', () => {
    render(<Signup />);

    const termsCheckbox = screen.getByRole('checkbox', { name: /i agree to the/i });
    expect(termsCheckbox).toBeInTheDocument();
  });

  it('should disable submit button until form is valid', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    const submitButton = screen.getByRole('button', { name: /complete form to continue/i });
    expect(submitButton).toBeDisabled();

    // Fill in valid data
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getAllByLabelText(/password/i)[0], 'Test123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123!');
    await user.click(screen.getByRole('checkbox'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create account/i })).toBeEnabled();
    });
  });

  it('should successfully register with valid data', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    // Fill in valid data
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'newuser@example.com');
    await user.type(screen.getAllByLabelText(/password/i)[0], 'Test123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123!');
    await user.click(screen.getByRole('checkbox'));

    // Submit
    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Should redirect to login
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/login');
    });
  });

  it('should show error when email already exists', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    // Fill with existing email
    await user.type(screen.getByLabelText(/full name/i), 'Existing User');
    await user.type(screen.getByLabelText(/^email$/i), 'existing@example.com');
    await user.type(screen.getAllByLabelText(/password/i)[0], 'Test123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123!');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Should show error
    await waitFor(() => {
      const errors = screen.queryAllByText(/already registered/i);
      expect(errors.length).toBeGreaterThan(0);
    });

    // Should not redirect
    expect(mockSetLocation).not.toHaveBeenCalled();
  });

  it('should send correct data to API', async () => {
    const user = userEvent.setup();
    let requestBody: any;

    server.use(
      http.post(`${API_BASE_URL}/user/register`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          message: 'User registered successfully',
          user_id: 2,
          email: 'test@example.com',
        });
      })
    );

    render(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getAllByLabelText(/password/i)[0], 'Test123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123!');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(requestBody).toEqual({
        full_name: 'John Doe',
        email: 'test@example.com',
        password: 'Test123!',
        confirm_password: 'Test123!',
      });
    });
  });

  it('should trim and lowercase email', async () => {
    const user = userEvent.setup();
    let requestBody: any;

    server.use(
      http.post(`${API_BASE_URL}/user/register`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          message: 'User registered successfully',
          user_id: 2,
          email: 'test@example.com',
        });
      })
    );

    render(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), '  TEST@EXAMPLE.COM  ');
    await user.type(screen.getAllByLabelText(/password/i)[0], 'Test123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123!');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(requestBody.email).toBe('test@example.com');
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/user/register`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({
          message: 'User registered successfully',
          user_id: 2,
          email: 'test@example.com',
        });
      })
    );

    render(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getAllByLabelText(/password/i)[0], 'Test123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123!');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText(/creating account\.\.\./i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/login');
    });
  });

  it('should toggle password visibility', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    const passwordInput = screen.getAllByLabelText(/^password$/i)[0] as HTMLInputElement;

    expect(passwordInput.type).toBe('password');

    // Find the Eye/EyeOff button inside the password field's parent
    const passwordField = passwordInput.closest('.space-y-2');
    const passwordToggle = passwordField?.querySelector('button[type="button"]') as HTMLElement;

    await user.click(passwordToggle);
    await waitFor(() => {
      expect(passwordInput.type).toBe('text');
    });

    await user.click(passwordToggle);
    await waitFor(() => {
      expect(passwordInput.type).toBe('password');
    });
  });

  it('should display validation warning when form is incomplete', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    // Fill all fields but with weak password (validation fails)
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getAllByLabelText(/^password$/i)[0], 'weak');
    await user.type(screen.getByLabelText(/confirm password/i), 'weak');

    await waitFor(() => {
      expect(screen.getByText(/complete all validation requirements/i)).toBeInTheDocument();
    });
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/user/register`, () => {
        return HttpResponse.error();
      })
    );

    render(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getAllByLabelText(/password/i)[0], 'Test123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123!');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /create account/i }));

    // Should not redirect on error
    await waitFor(() => {
      expect(mockSetLocation).not.toHaveBeenCalled();
    });
  });

  it('should have links to terms and privacy policy', () => {
    render(<Signup />);

    const termsLink = screen.getByText(/terms of service/i);
    const privacyLink = screen.getByText(/privacy policy/i);

    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
  });

  it('should prevent form submission without terms acceptance', async () => {
    const user = userEvent.setup();
    render(<Signup />);

    // Fill all fields except terms
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getAllByLabelText(/password/i)[0], 'Test123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123!');
    // Don't check terms

    const submitButton = screen.getByRole('button', { name: /complete form to continue/i });
    expect(submitButton).toBeDisabled();
  });

  it('should trim whitespace from name', async () => {
    const user = userEvent.setup();
    let requestBody: any;

    server.use(
      http.post(`${API_BASE_URL}/user/register`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          message: 'User registered successfully',
          user_id: 2,
          email: 'test@example.com',
        });
      })
    );

    render(<Signup />);

    await user.type(screen.getByLabelText(/full name/i), '  John Doe  ');
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com');
    await user.type(screen.getAllByLabelText(/password/i)[0], 'Test123!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Test123!');
    await user.click(screen.getByRole('checkbox'));

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(requestBody.full_name).toBe('John Doe');
    });
  });
});
