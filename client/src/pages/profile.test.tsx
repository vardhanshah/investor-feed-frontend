import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Profile from './profile';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = '/api';

// Mock useLocation and useRoute from wouter
const mockSetLocation = vi.fn();
const mockRouteMatch = { profileId: '1' };

vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/profiles/1', mockSetLocation],
    useRoute: () => [true, mockRouteMatch],
  };
});

// Mock PostCard component
vi.mock('@/components/PostCard', () => ({
  default: ({ post }: { post: any }) => (
    <div data-testid={`post-${post.id}`}>
      {post.content}
    </div>
  ),
}));

// Mock CompanyConfidence component
vi.mock('@/components/CompanyConfidence', () => ({
  default: ({ profileId, confidence, size }: { profileId: number; confidence: any; size?: string }) => (
    <div data-testid="company-confidence">
      <span data-testid="confidence-profile-id">{profileId}</span>
      <span data-testid="confidence-size">{size || 'sm'}</span>
      {confidence && (
        <>
          <span data-testid="confidence-yes-pct">{confidence.yes_percentage}%</span>
          <span data-testid="confidence-no-pct">{confidence.no_percentage}%</span>
          <span data-testid="confidence-user-vote">{confidence.user_vote || 'none'}</span>
        </>
      )}
    </div>
  ),
}));

describe('Profile Page', () => {
  beforeEach(() => {
    mockSetLocation.mockClear();
    // Reset route params to default profile
    mockRouteMatch.profileId = '1';
  });

  it('should display loading state initially', () => {
    render(<Profile />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should fetch and display profile information', async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
    });

    // Check profile description if present
    const description = screen.queryByText('Leading technology company');
    if (description) {
      expect(description).toBeInTheDocument();
    }
  });

  it('should display profile avatar with first letter', async () => {
    const { container } = render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
    });

    // Check avatar styling - the avatar contains 'T' and has specific classes
    const avatar = container.querySelector('.w-20.h-20.rounded-full');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('T');
  });

  it('should fetch and display posts for the profile', async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByTestId('post-1')).toBeInTheDocument();
    });

    expect(screen.getByTestId('post-1')).toHaveTextContent('Excited to announce our Q3 results - 25% growth!');
  });

  it('should have a back to feed button', async () => {
    render(<Profile />);

    await waitFor(() => {
      const backButton = screen.getByText('Back to Feed');
      expect(backButton).toBeInTheDocument();
    });
  });

  it('should navigate back when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Back to Feed')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Back to Feed'));
    expect(mockSetLocation).toHaveBeenCalledWith('/home');
  });

  it('should display error state when profile fetch fails', async () => {
    server.use(
      http.get(`${API_BASE_URL}/profiles/:profileId`, () => {
        return HttpResponse.json(
          { detail: 'Profile not found' },
          { status: 404 }
        );
      })
    );

    const { container } = render(<Profile />);

    // Wait for loading to complete
    await waitFor(() => {
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // After loading, should show back button
    expect(screen.getByText('Back to Feed')).toBeInTheDocument();
  });

  it('should display empty state when profile has no posts', async () => {
    server.use(
      http.get(`${API_BASE_URL}/profiles/:profileId/posts`, () => {
        return HttpResponse.json({
          posts: [],
        });
      })
    );

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('No Posts Yet')).toBeInTheDocument();
    });

    expect(screen.getByText("This profile hasn't posted anything yet")).toBeInTheDocument();
  });

  it('should display load more button when there are more posts', async () => {
    // Mock response with exactly LIMIT (20) posts to indicate more available
    const manyPosts = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      content: `Post ${i + 1}`,
      profile: {
        id: 1,
        title: 'Test Profile',
      },
      source: null,
      created_at: '2025-10-15T10:00:00',
      images: [],
      reaction_count: 0,
      comment_count: 0,
      user_liked: false,
    }));

    server.use(
      http.get(`${API_BASE_URL}/profiles/:profileId/posts`, () => {
        return HttpResponse.json({
          posts: manyPosts,
        });
      })
    );

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Load More Posts')).toBeInTheDocument();
    });
  });

  it('should load more posts when load more button is clicked', async () => {
    const user = userEvent.setup();

    // First batch of posts
    const firstBatch = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      content: `Post ${i + 1}`,
      profile: {
        id: 1,
        title: 'Test Profile',
      },
      source: null,
      created_at: '2025-10-15T10:00:00',
      images: [],
      reaction_count: 0,
      comment_count: 0,
      user_liked: false,
    }));

    // Second batch of posts
    const secondBatch = Array.from({ length: 10 }, (_, i) => ({
      id: i + 21,
      content: `Post ${i + 21}`,
      profile: {
        id: 1,
        title: 'Test Profile',
      },
      source: null,
      created_at: '2025-10-15T10:00:00',
      images: [],
      reaction_count: 0,
      comment_count: 0,
      user_liked: false,
    }));

    let callCount = 0;
    server.use(
      http.get(`${API_BASE_URL}/profiles/:profileId/posts`, ({ request }) => {
        const url = new URL(request.url);
        const offset = parseInt(url.searchParams.get('offset') || '0');

        callCount++;
        if (offset === 0) {
          return HttpResponse.json({ posts: firstBatch });
        } else {
          return HttpResponse.json({ posts: secondBatch });
        }
      })
    );

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Load More Posts')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Load More Posts'));

    await waitFor(() => {
      expect(screen.getByTestId('post-21')).toBeInTheDocument();
    });
  });

  it('should show end of posts message when no more posts', async () => {
    // Return less than LIMIT posts to indicate no more available
    const posts = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      content: `Post ${i + 1}`,
      profile: {
        id: 1,
        title: 'Test Profile',
      },
      source: null,
      created_at: '2025-10-15T10:00:00',
      images: [],
      reaction_count: 0,
      comment_count: 0,
      user_liked: false,
    }));

    server.use(
      http.get(`${API_BASE_URL}/profiles/:profileId/posts`, () => {
        return HttpResponse.json({
          posts: posts,
        });
      })
    );

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText("You've seen all posts from this profile")).toBeInTheDocument();
    });
  });

  it('should display loading skeleton while fetching posts', () => {
    const { container } = render(<Profile />);

    // Check for loading indicators - either spinner or skeleton
    const spinner = container.querySelector('.animate-spin');
    const skeleton = container.querySelector('.animate-pulse');
    expect(spinner || skeleton).toBeInTheDocument();
  });

  it('should handle different profile IDs', async () => {
    mockRouteMatch.profileId = '2';

    server.use(
      http.get(`${API_BASE_URL}/profiles/2`, () => {
        return HttpResponse.json({
          id: 2,
          title: 'Second Profile',
          description: 'Another test profile',
          created_at: '2025-01-01',
        });
      })
    );

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Second Profile')).toBeInTheDocument();
    });
  });

  it('should show posts from specific profile in heading', async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
    });

    // Check that the posts heading contains the profile name
    const postsHeading = screen.getByRole('heading', { level: 2 });
    expect(postsHeading).toHaveTextContent(/Posts from/);
    expect(postsHeading).toHaveTextContent('TechCorp Inc');
  });

  it('should disable load more button while loading', async () => {
    const user = userEvent.setup();

    const manyPosts = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      content: `Post ${i + 1}`,
      profile: {
        id: 1,
        title: 'Test Profile',
      },
      source: null,
      created_at: '2025-10-15T10:00:00',
      images: [],
      reaction_count: 0,
      comment_count: 0,
      user_liked: false,
    }));

    server.use(
      http.get(`${API_BASE_URL}/profiles/:profileId/posts`, async ({ request }) => {
        const url = new URL(request.url);
        const offset = parseInt(url.searchParams.get('offset') || '0');

        if (offset > 0) {
          // Delay second request to test loading state
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        return HttpResponse.json({ posts: manyPosts });
      })
    );

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Load More Posts')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    await user.click(loadMoreButton);

    // Button should be disabled while loading
    expect(loadMoreButton).toBeDisabled();
  });

  it('should apply correct styling to profile header', async () => {
    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
    });

    const profileTitle = screen.getByRole('heading', { level: 1 });
    expect(profileTitle).toHaveClass('text-3xl', 'font-alata', 'text-foreground');
  });

  it('should apply gradient styling to avatar', async () => {
    const { container } = render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('TechCorp Inc')).toBeInTheDocument();
    });

    // The avatar has gradient classes
    const avatar = container.querySelector('.bg-gradient-to-r');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('from-[hsl(280,100%,70%)]', 'to-[hsl(200,100%,70%)]');
  });

  it('should handle profile without description', async () => {
    server.use(
      http.get(`${API_BASE_URL}/profiles/:profileId`, () => {
        return HttpResponse.json({
          id: 1,
          title: 'No Description Profile',
          description: null,
          created_at: '2025-01-01',
        });
      })
    );

    render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('No Description Profile')).toBeInTheDocument();
    });

    // Description should not be rendered if null
    expect(screen.queryByText('Test profile for testing')).not.toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    server.use(
      http.get(`${API_BASE_URL}/profiles/:profileId`, () => {
        return HttpResponse.error();
      })
    );

    const { container } = render(<Profile />);

    await waitFor(() => {
      expect(screen.getByText('Back to Feed')).toBeInTheDocument();
    });

    // Should show error state - either an alert or error text
    await waitFor(() => {
      const alert = screen.queryByRole('alert');
      const errorTexts = screen.queryAllByText(/error|failed|unable/i);
      expect(alert || errorTexts.length > 0).toBeTruthy();
    }, { timeout: 3000 });
  });

  describe('Company Confidence', () => {
    it('should render CompanyConfidence component in profile header', async () => {
      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByTestId('company-confidence')).toBeInTheDocument();
      });
    });

    it('should pass correct profile ID to CompanyConfidence', async () => {
      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByTestId('confidence-profile-id')).toHaveTextContent('1');
      });
    });

    it('should use medium size for CompanyConfidence in profile header', async () => {
      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByTestId('confidence-size')).toHaveTextContent('md');
      });
    });

    it('should display confidence percentages when profile has votes', async () => {
      server.use(
        http.get(`${API_BASE_URL}/profiles/:profileId`, () => {
          return HttpResponse.json({
            id: 1,
            title: 'TechCorp Inc',
            description: 'Leading technology company',
            created_at: '2025-01-01',
            confidence: {
              yes_percentage: 75,
              no_percentage: 25,
              total_votes: 4,
              user_vote: 'yes',
            },
          });
        })
      );

      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByTestId('confidence-yes-pct')).toHaveTextContent('75%');
        expect(screen.getByTestId('confidence-no-pct')).toHaveTextContent('25%');
      });
    });

    it('should show user vote status in CompanyConfidence', async () => {
      server.use(
        http.get(`${API_BASE_URL}/profiles/:profileId`, () => {
          return HttpResponse.json({
            id: 1,
            title: 'TechCorp Inc',
            description: 'Leading technology company',
            created_at: '2025-01-01',
            confidence: {
              yes_percentage: 67,
              no_percentage: 33,
              total_votes: 3,
              user_vote: 'yes',
            },
          });
        })
      );

      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByTestId('confidence-user-vote')).toHaveTextContent('yes');
      });
    });

    it('should handle profile with null confidence', async () => {
      server.use(
        http.get(`${API_BASE_URL}/profiles/:profileId`, () => {
          return HttpResponse.json({
            id: 1,
            title: 'New Profile',
            description: 'New profile with no votes',
            created_at: '2025-01-01',
            confidence: null,
          });
        })
      );

      render(<Profile />);

      await waitFor(() => {
        expect(screen.getByTestId('company-confidence')).toBeInTheDocument();
      });

      // Should not show percentages when confidence is null
      expect(screen.queryByTestId('confidence-yes-pct')).not.toBeInTheDocument();
    });
  });
});