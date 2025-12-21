import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import Home from './home';
import * as AuthContext from '@/contexts/AuthContext';

// Mock useLocation from wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/', mockSetLocation],
  };
});

// Mock the components
vi.mock('@/components/Header', () => ({
  default: () => <header data-testid="header">Header Component</header>,
}));

vi.mock('@/components/Hero', () => ({
  default: () => <div data-testid="hero">Hero Component</div>,
}));

vi.mock('@/components/Follow', () => ({
  default: () => <div data-testid="follow">Follow Component</div>,
}));

describe('Home Page', () => {
  beforeEach(() => {
    mockSetLocation.mockClear();
  });

  it('should render home page components for unauthenticated users', () => {
    // Mock unauthenticated state
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Home />);

    // Check that all main components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('follow')).toBeInTheDocument();
  });

  it('should display loading spinner while checking auth', () => {
    // Mock loading state
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Home />);

    // Check for loading spinner
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();

    // Should not show home page components while loading
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
    expect(screen.queryByTestId('follow')).not.toBeInTheDocument();
  });

  it('should redirect authenticated users to /home', async () => {
    // Mock authenticated user
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        user_id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: '2025-01-01',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Home />);

    // Wait for redirect
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });

    // Should not render home page components for authenticated users
    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
    expect(screen.queryByTestId('follow')).not.toBeInTheDocument();
  });

  it('should not redirect when user is null and not loading', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Home />);

    // Should not redirect
    expect(mockSetLocation).not.toHaveBeenCalled();

    // Should show home page components
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('follow')).toBeInTheDocument();
  });

  it('should not redirect while authentication is loading', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Home />);

    // Should not redirect while loading
    expect(mockSetLocation).not.toHaveBeenCalled();
  });

  it('should handle transition from loading to authenticated', async () => {
    const { rerender } = render(<Home />);

    // Start with loading state
    const loadingAuth = vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    rerender(<Home />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Transition to authenticated state
    loadingAuth.mockReturnValue({
      user: {
        user_id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: '2025-01-01',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    rerender(<Home />);

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });
  });

  it('should handle transition from loading to unauthenticated', () => {
    // Set up loading state BEFORE first render
    const loadingAuth = vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    // Clear any previous calls from setup
    mockSetLocation.mockClear();

    const { rerender } = render(<Home />);

    // Should show loading state
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Transition to unauthenticated state
    loadingAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    rerender(<Home />);

    // Should not redirect
    expect(mockSetLocation).not.toHaveBeenCalled();

    // Should show home page components
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('follow')).toBeInTheDocument();
  });

  it('should have correct CSS classes for loading spinner', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { container } = render(<Home />);

    const loadingContainer = container.querySelector('.min-h-screen.bg-background');
    expect(loadingContainer).toBeInTheDocument();
    expect(loadingContainer).toHaveClass('flex', 'items-center', 'justify-center');

    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8', 'animate-spin');
  });

  it('should render null for authenticated user', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        user_id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: '2025-01-01',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { container } = render(<Home />);

    // Component should return null for authenticated users
    // The only element should be the Toaster which is rendered at the root level
    const children = container.querySelectorAll(':scope > *');
    const nonToasterElements = Array.from(children).filter(
      el => !el.getAttribute('aria-label')?.includes('Notifications')
    );
    expect(nonToasterElements.length).toBe(0);
  });

  it('should apply correct background color to main container', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { container } = render(<Home />);

    const mainDiv = container.querySelector('.min-h-screen.bg-background');
    expect(mainDiv).toBeInTheDocument();
  });

  it('should call setLocation with correct path for authenticated users', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        user_id: 123,
        email: 'authenticated@example.com',
        full_name: 'Authenticated User',
        created_at: '2025-01-15',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Home />);

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledTimes(1);
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });
  });

  it('should handle rapid auth state changes', async () => {
    const { rerender } = render(<Home />);

    const authSpy = vi.spyOn(AuthContext, 'useAuth');

    // Start unauthenticated
    authSpy.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    rerender(<Home />);
    expect(screen.getByTestId('header')).toBeInTheDocument();

    // Switch to loading
    authSpy.mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    rerender(<Home />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Switch to authenticated
    authSpy.mockReturnValue({
      user: {
        user_id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: '2025-01-01',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    rerender(<Home />);

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });
  });

  it('should maintain component hierarchy when rendered', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { container } = render(<Home />);

    // Check component order
    const mainContainer = container.querySelector('.min-h-screen');
    const children = mainContainer?.children;

    expect(children?.[0]).toHaveAttribute('data-testid', 'header');
    expect(children?.[1]).toHaveAttribute('data-testid', 'hero');
    expect(children?.[2]).toHaveAttribute('data-testid', 'follow');
  });
});