import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import Home from './home';
import * as AuthContext from '@/contexts/AuthContext';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

// Mock useLocation from wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/', mockSetLocation],
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    mockSetLocation.mockClear();

    // Mock public posts API
    server.use(
      http.get('/api/feeds/public/posts', () => {
        return HttpResponse.json({
          posts: [
            {
              id: 1,
              content: 'Test post content',
              profile: {
                id: 1,
                title: 'Test Company',
                meta_attributes: { symbol: 'TEST', sub_sector: 'Technology' },
              },
              attributes: {
                category: 'Annual Report',
              },
              created_at: '2025-01-01T12:00:00',
              submission_date: '2025-01-01T12:00:00',
              categories: ['Annual Report'],
            },
          ],
        });
      })
    );
  });

  it('should render home page components for unauthenticated users', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Home />);

    // Check that main elements are rendered
    await waitFor(() => {
      expect(screen.getByText('Investor Feed')).toBeInTheDocument();
      expect(screen.getByText(/See Through/)).toBeInTheDocument();
      expect(screen.getByText('Get started with Investor Feed')).toBeInTheDocument();
    });
  });

  it('should display loading spinner while checking auth', () => {
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
  });

  it('should redirect authenticated users to /home', async () => {
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

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });
  });

  it('should not redirect when user is null and not loading', async () => {
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

    // Should show main content
    await waitFor(() => {
      expect(screen.getByText('Investor Feed')).toBeInTheDocument();
    });
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

    expect(mockSetLocation).not.toHaveBeenCalled();
  });

  it('should handle transition from loading to authenticated', async () => {
    const authSpy = vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { rerender } = render(<Home />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Transition to authenticated state
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

  it('should handle transition from loading to unauthenticated', async () => {
    const authSpy = vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    mockSetLocation.mockClear();
    const { rerender } = render(<Home />);

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Transition to unauthenticated state
    authSpy.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    rerender(<Home />);

    expect(mockSetLocation).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText('Investor Feed')).toBeInTheDocument();
    });
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
    const children = container.querySelectorAll(':scope > *');
    const nonToasterElements = Array.from(children).filter(
      el => !el.getAttribute('aria-label')?.includes('Notifications')
    );
    expect(nonToasterElements.length).toBe(0);
  });

  it('should apply correct background color to main container', async () => {
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

    const { rerender } = render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Investor Feed')).toBeInTheDocument();
    });

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

  it('should display value proposition badges', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    const { container } = render(<Home />);

    // Wait for component to render and check for value prop badges
    await waitFor(() => {
      const badges = container.querySelectorAll('.bg-muted.rounded-full');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  it('should display social login buttons', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText(/Continue with Google/)).toBeInTheDocument();
      expect(screen.getByText(/Continue with X/)).toBeInTheDocument();
    });
  });

  it('should display live feed preview section', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText('Live Feed')).toBeInTheDocument();
    });
  });
});
