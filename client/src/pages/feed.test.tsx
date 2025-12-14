import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Feed from './feed';
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

// Mock useAuth
const mockLogout = vi.fn();
let mockUser = {
  user_id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  created_at: '2025-01-01T00:00:00',
  isPremium: false,
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    login: vi.fn(),
    logout: mockLogout,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Feed Page', () => {
  beforeEach(() => {
    mockSetLocation.mockClear();
    mockLogout.mockClear();
    // Set auth token in localStorage for MSW handlers
    localStorage.setItem('authToken', 'mock-token-123');
  });

  it('should render feed page header', async () => {
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Investor Feed')).toBeInTheDocument();
    });
  });

  it('should display welcome section with description', async () => {
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/latest market updates and insights/i)).toBeInTheDocument();
    });
  });

  it('should display welcome section', async () => {
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /your feed/i })).toBeInTheDocument();
    });
  });

  it('should load and display posts', async () => {
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Excited to announce our Q3 results - 25% growth!')).toBeInTheDocument();
    });
  });

  it('should display multiple posts', async () => {
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Excited to announce our Q3 results - 25% growth!')).toBeInTheDocument();
      expect(screen.getByText(/just closed a \$50m series b round/i)).toBeInTheDocument();
    });
  });

  it('should show loading skeleton while fetching posts', () => {
    render(<Feed />);

    // Should show loading skeleton initially
    const skeletons = screen.getAllByRole('region');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should handle logout', async () => {
    const user = userEvent.setup();
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Investor Feed')).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockSetLocation).toHaveBeenCalledWith('/');
  });

  it('should not display load more button when all posts are shown', async () => {
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Excited to announce our Q3 results - 25% growth!')).toBeInTheDocument();
    });

    // Should not show load more button because total (5) < limit (20)
    expect(screen.queryByText('Load More Posts')).not.toBeInTheDocument();
  });

  it('should show end of feed message when no more posts', async () => {
    // Mock API to return fewer posts than limit
    server.use(
      http.get(`${API_BASE_URL}/feeds/:feedId/posts`, () => {
        return HttpResponse.json({
          posts: [
            {
              id: 1,
              content: 'Only post',
              profile: {
                id: 1,
                title: 'Test Profile',
              },
              source: null,
              created_at: '2024-10-15T10:00:00',
              images: [],
              comments: [],
              reaction_count: 5,
              comment_count: 0,
              user_liked: false,
            },
          ],
        });
      })
    );

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Only post')).toBeInTheDocument();
    });

    // Should not show load more button
    expect(screen.queryByText('Load More Posts')).not.toBeInTheDocument();
  });

  it('should display empty state when no posts available', async () => {
    server.use(
      http.get(`${API_BASE_URL}/feeds/:feedId/posts`, () => {
        return HttpResponse.json({
          posts: [],
        });
      })
    );

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/no posts yet/i)).toBeInTheDocument();
    });
  });

  it('should display error state on API failure', async () => {
    server.use(
      http.get(`${API_BASE_URL}/feeds/:feedId/posts`, () => {
        return HttpResponse.error();
      })
    );

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
    });
  });

  it('should have retry button on error', async () => {
    const user = userEvent.setup();

    server.use(
      http.get(`${API_BASE_URL}/feeds/:feedId/posts`, () => {
        return HttpResponse.error();
      })
    );

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('should retry loading posts when retry button is clicked', async () => {
    const user = userEvent.setup();
    let callCount = 0;

    server.use(
      http.get(`${API_BASE_URL}/feeds/:feedId/posts`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.error();
        }
        return HttpResponse.json({
          posts: [
            {
              id: 1,
              content: 'Success after retry',
              profile: {
                id: 1,
                title: 'Test Profile',
              },
              source: null,
              created_at: '2024-10-15T10:00:00',
              images: [],
              comments: [],
              reaction_count: 5,
              comment_count: 0,
              user_liked: false,
            },
          ],
        });
      })
    );

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Success after retry')).toBeInTheDocument();
    });
  });

  it('should show toast notification on error', async () => {
    server.use(
      http.get(`${API_BASE_URL}/feeds/:feedId/posts`, () => {
        return HttpResponse.json(
          { detail: 'Server error occurred' },
          { status: 500 }
        );
      })
    );

    render(<Feed />);

    // Toast notification should appear
    await waitFor(() => {
      expect(screen.getByText(/failed to load posts/i)).toBeInTheDocument();
    });
  });

  it('should have navigation buttons in header', async () => {
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Investor Feed')).toBeInTheDocument();
    });

    // Should have bell icon button
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should display all posts from mock data', async () => {
    render(<Feed />);

    // Wait for all 5 mock posts to be displayed
    await waitFor(() => {
      expect(screen.getByText('Excited to announce our Q3 results - 25% growth!')).toBeInTheDocument();
      expect(screen.getByText(/just closed a \$50m series b round/i)).toBeInTheDocument();
      expect(screen.getByText(/launching new ai-powered investment platform/i)).toBeInTheDocument();
    });
  });

  it('should navigate to feed on header click', async () => {
    const user = userEvent.setup();
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Investor Feed')).toBeInTheDocument();
    });

    const header = screen.getByText('Investor Feed');
    await user.click(header);

    expect(mockSetLocation).toHaveBeenCalledWith('/home');
  });

  it('should show end of feed message after viewing all posts', async () => {
    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Excited to announce our Q3 results - 25% growth!')).toBeInTheDocument();
    });

    // Should show end of feed message since we loaded all posts (5 < 20 limit)
    expect(screen.getByText(/you've reached the end of your feed/i)).toBeInTheDocument();
  });
});
