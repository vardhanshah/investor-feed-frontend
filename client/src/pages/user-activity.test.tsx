import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import UserActivity from './user-activity';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import * as AuthContext from '@/contexts/AuthContext';

const API_BASE_URL = 'https://dev.investorfeed.in/api';

// Mock useLocation and useRoute from wouter
const mockSetLocation = vi.fn();
const mockRouteMatch = { userId: '1' };

vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/users/1', mockSetLocation],
    useRoute: () => [true, mockRouteMatch],
  };
});

// Mock date-fns for consistent time formatting
vi.mock('date-fns', () => ({
  formatDistanceToNow: (date: Date) => '2 hours ago',
}));

describe('UserActivity Page', () => {
  beforeEach(() => {
    mockSetLocation.mockClear();

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
    });
  });

  it('should display loading state initially', () => {
    render(<UserActivity />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should fetch and display user information', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('should display user initials in avatar', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    // Check avatar styling
    const avatar = screen.getByText('TU').parentElement;
    expect(avatar).toHaveClass('w-24', 'h-24', 'rounded-full');
  });

  it('should display join date', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText(/Joined January 1, 2025/)).toBeInTheDocument();
    });
  });

  it('should display activity count', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('1 activities')).toBeInTheDocument();
    });
  });

  it('should display user activities', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('Great analysis!')).toBeInTheDocument();
    });
  });

  it('should show activity type icon and label', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('Comment')).toBeInTheDocument();
    });
  });

  it('should display "My Profile" for own profile', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });
  });

  it('should display user number for other profiles', async () => {
    mockRouteMatch.userId = '2';

    // Mock different user
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        user_id: 1, // Different from route userId
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: '2025-01-01',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('User #2')).toBeInTheDocument();
    });
  });

  it('should have back to home button', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      const backButton = screen.getByText('Back to Home');
      expect(backButton).toBeInTheDocument();
    });
  });

  it('should navigate back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Back to Home'));
    expect(mockSetLocation).toHaveBeenCalledWith('/home');
  });

  it('should display empty state when no activities', async () => {
    server.use(
      http.get(`${API_BASE_URL}/user/:userId/activity`, () => {
        return HttpResponse.json({
          user_id: 1,
          user_email: 'test@example.com',
          full_name: 'Test User',
          created_at: '2025-01-01',
          activities: [],
          total_count: 0,
          limit: 40,
          offset: 0,
        });
      })
    );

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('No Activity Yet')).toBeInTheDocument();
    });

    expect(screen.getByText('Start engaging with posts by commenting and reacting!')).toBeInTheDocument();
  });

  it('should display different empty message for other users', async () => {
    mockRouteMatch.userId = '2';

    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        user_id: 1, // Different from route userId
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: '2025-01-01',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });

    server.use(
      http.get(`${API_BASE_URL}/user/:userId/activity`, () => {
        return HttpResponse.json({
          user_id: 2,
          user_email: 'other@example.com',
          full_name: 'Other User',
          created_at: '2025-01-01',
          activities: [],
          total_count: 0,
          limit: 40,
          offset: 0,
        });
      })
    );

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText("This user hasn't been active yet")).toBeInTheDocument();
    });
  });

  it('should handle error state', async () => {
    server.use(
      http.get(`${API_BASE_URL}/user/:userId/activity`, () => {
        return HttpResponse.json(
          { detail: 'User not found' },
          { status: 404 }
        );
      })
    );

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('should display view post button for activities', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('View Post')).toBeInTheDocument();
    });
  });

  it('should navigate to post when view post is clicked', async () => {
    const user = userEvent.setup();
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('View Post')).toBeInTheDocument();
    });

    await user.click(screen.getByText('View Post'));
    expect(mockSetLocation).toHaveBeenCalledWith('/posts/1');
  });

  it('should show load more button when more activities exist', async () => {
    server.use(
      http.get(`${API_BASE_URL}/user/:userId/activity`, () => {
        return HttpResponse.json({
          user_id: 1,
          user_email: 'test@example.com',
          full_name: 'Test User',
          created_at: '2025-01-01',
          activities: Array.from({ length: 40 }, (_, i) => ({
            id: i + 1,
            type: 'comment',
            created_at: '2025-10-15T11:00:00',
            content: `Activity ${i + 1}`,
            post: {
              id: 1,
              content: 'Sample post content',
              profile: {
                id: 1,
                title: 'Sample Profile',
              },
            },
          })),
          total_count: 100,
          limit: 40,
          offset: 0,
        });
      })
    );

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('Load More (60 remaining)')).toBeInTheDocument();
    });
  });

  it('should load more activities when button clicked', async () => {
    const user = userEvent.setup();

    let callCount = 0;
    server.use(
      http.get(`${API_BASE_URL}/user/:userId/activity`, ({ request }) => {
        const url = new URL(request.url);
        const offset = parseInt(url.searchParams.get('offset') || '0');

        callCount++;
        if (offset === 0) {
          return HttpResponse.json({
            user_id: 1,
            user_email: 'test@example.com',
            full_name: 'Test User',
            created_at: '2025-01-01',
            activities: [
              {
                id: 1,
                type: 'comment',
                created_at: '2025-10-15T11:00:00',
                content: 'First activity',
                post: {
                  id: 1,
                  content: 'Sample post content',
                  profile: { id: 1, title: 'Sample Profile' },
                },
              },
            ],
            total_count: 2,
            limit: 40,
            offset: 0,
          });
        } else {
          return HttpResponse.json({
            user_id: 1,
            user_email: 'test@example.com',
            full_name: 'Test User',
            created_at: '2025-01-01',
            activities: [
              {
                id: 2,
                type: 'reaction',
                created_at: '2025-10-15T12:00:00',
                reaction_emoji: '👍',
                post: {
                  id: 2,
                  content: 'Another post',
                  profile: { id: 1, title: 'Sample Profile' },
                },
              },
            ],
            total_count: 2,
            limit: 40,
            offset: 40,
          });
        }
      })
    );

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('First activity')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Load More (1 remaining)'));

    await waitFor(() => {
      expect(screen.getByText('👍')).toBeInTheDocument();
    });
  });

  it('should show all activities loaded message', async () => {
    server.use(
      http.get(`${API_BASE_URL}/user/:userId/activity`, () => {
        return HttpResponse.json({
          user_id: 1,
          user_email: 'test@example.com',
          full_name: 'Test User',
          created_at: '2025-01-01',
          activities: [
            {
              id: 1,
              type: 'comment',
              created_at: '2025-10-15T11:00:00',
              content: 'Only activity',
              post: {
                id: 1,
                content: 'Sample post content',
                profile: { id: 1, title: 'Sample Profile' },
              },
            },
          ],
          total_count: 1,
          limit: 40,
          offset: 0,
        });
      })
    );

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('All 1 activities loaded')).toBeInTheDocument();
    });
  });

  it('should display thread activities with reply context', async () => {
    server.use(
      http.get(`${API_BASE_URL}/user/:userId/activity`, () => {
        return HttpResponse.json({
          user_id: 1,
          user_email: 'test@example.com',
          full_name: 'Test User',
          created_at: '2025-01-01',
          activities: [
            {
              id: 1,
              type: 'thread',
              created_at: '2025-10-15T11:00:00',
              content: 'My reply',
              comment_content: 'Original comment',
              post: {
                id: 1,
                content: 'Sample post content',
                profile: { id: 1, title: 'Sample Profile' },
              },
            },
          ],
          total_count: 1,
          limit: 40,
          offset: 0,
        });
      })
    );

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('Reply')).toBeInTheDocument();
      expect(screen.getByText('My reply')).toBeInTheDocument();
      expect(screen.getByText(/Original comment/)).toBeInTheDocument();
    });
  });

  it('should display reaction activities with emoji', async () => {
    server.use(
      http.get(`${API_BASE_URL}/user/:userId/activity`, () => {
        return HttpResponse.json({
          user_id: 1,
          user_email: 'test@example.com',
          full_name: 'Test User',
          created_at: '2025-01-01',
          activities: [
            {
              id: 1,
              type: 'reaction',
              created_at: '2025-10-15T11:00:00',
              reaction_emoji: '❤️',
              post: {
                id: 1,
                content: 'This is a very long post content that should be truncated after 100 characters to keep the UI clean and readable',
                profile: { id: 1, title: 'Sample Profile' },
              },
            },
          ],
          total_count: 1,
          limit: 40,
          offset: 0,
        });
      })
    );

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('❤️')).toBeInTheDocument();
      expect(screen.getByText(/reacted to/)).toBeInTheDocument();
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument(); // Truncated text
    });
  });

  it('should apply correct border colors for activity types', async () => {
    const { container } = render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('Great analysis!')).toBeInTheDocument();
    });

    // Comment activities should have purple border
    const commentActivity = container.querySelector('.border-\\[hsl\\(280\\,100%\\,70%\\)\\]');
    expect(commentActivity).toBeInTheDocument();
  });

  it('should show activity timeline header', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
    });
  });

  it('should display total activities count in timeline', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('1 total activities')).toBeInTheDocument();
    });
  });

  it('should apply gradient styling to avatar', async () => {
    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    const avatar = screen.getByText('TU').parentElement;
    expect(avatar).toHaveClass('bg-gradient-to-r', 'from-[hsl(280,100%,70%)]', 'to-[hsl(200,100%,70%)]');
  });

  it('should handle network errors gracefully', async () => {
    server.use(
      http.get(`${API_BASE_URL}/user/:userId/activity`, () => {
        return HttpResponse.error();
      })
    );

    render(<UserActivity />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load user data')).toBeInTheDocument();
    });
  });
});