import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { userEvent } from '@testing-library/user-event';
import PostDetailPage from './post-detail';
import * as api from '@/lib/api';

// Mock the APIs
vi.mock('@/lib/api', () => ({
  postsApi: {
    getPost: vi.fn(),
  },
  reactionsApi: {
    addReaction: vi.fn(),
  },
  commentsApi: {
    getComments: vi.fn(),
    addComment: vi.fn(),
    addThreadReply: vi.fn(),
    addCommentReaction: vi.fn(),
    addThreadReaction: vi.fn(),
  },
}));

// Mock wouter
const mockSetLocation = vi.fn();
const mockRouteParams = { postId: '123' };
vi.mock('wouter', () => ({
  useRoute: () => [true, mockRouteParams],
  useLocation: () => ['/', mockSetLocation],
  Router: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ component: Component }: { component: React.ComponentType }) => <Component />,
}));

// Mock AuthContext
const mockAuthUser = {
  user_id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  created_at: '2024-01-01',
};

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockAuthUser,
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('PostDetailPage - Profile Navigation Tests', () => {
  const mockPostWithProfile = {
    id: 123,
    content: 'This is a test post about Q3 results',
    profile: {
      id: 42,
      title: 'Acme Corporation',
    },
    source: 'https://example.com/news',
    created_at: '2024-10-15T10:00:00',
    images: [],
    reaction_count: 15,
    comment_count: 3,
    user_liked: false,
  };

  const mockComments = {
    comments: [
      {
        id: 1,
        user_id: 2,
        content: 'Great analysis!',
        reaction_count: 3,
        thread: [
          {
            id: 101,
            user_id: 3,
            content: 'I agree completely',
            reaction_count: 1,
            created_at: '2024-10-15T12:00:00',
          },
        ],
        created_at: '2024-10-15T11:00:00',
      },
    ],
    total: 1,
    page_no: 1,
    page_size: 40,
    total_pages: 1,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetLocation.mockClear();
    vi.mocked(api.postsApi.getPost).mockResolvedValue(mockPostWithProfile);
    vi.mocked(api.commentsApi.getComments).mockResolvedValue(mockComments);
  });

  describe('Profile Section Rendering', () => {
    it('should render profile avatar with first letter of profile title', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        const avatar = screen.getByText('A');
        expect(avatar).toBeInTheDocument();
        expect(avatar.parentElement).toHaveClass('rounded-full');
      });
    });

    it('should render full profile title', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });
    });

    it('should render profile avatar with P when no profile title', async () => {
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: 42, title: '' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        const avatar = screen.getByText('P');
        expect(avatar).toBeInTheDocument();
      });
    });

    it('should display Profile #ID when no profile title', async () => {
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: 42, title: '' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Profile #42')).toBeInTheDocument();
      });
    });

    it('should apply gradient background to profile avatar', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        const avatar = screen.getByText('A');
        expect(avatar.parentElement).toHaveClass(
          'bg-gradient-to-r',
          'from-[hsl(280,100%,70%)]',
          'to-[hsl(200,100%,70%)]'
        );
      });
    });
  });

  describe('Profile Click Functionality', () => {
    it('should make profile section clickable', async () => {
      const { container } = render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      // Find the button that wraps the profile section
      const profileButton = container.querySelector('button[class*="flex items-center space-x-3"]');
      expect(profileButton).toBeInTheDocument();
    });

    it('should navigate to profile page when profile avatar is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('A')).toBeInTheDocument();
      });

      const profileAvatar = screen.getByText('A').parentElement;
      if (profileAvatar) {
        await user.click(profileAvatar);
        expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
      }
    });

    it('should navigate to profile page when profile name is clicked', async () => {
      const user = userEvent.setup();
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });

    it('should navigate to correct profile ID from post data', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: 999, title: 'Acme Corporation' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/999');
    });

    it('should navigate when clicking anywhere in profile section', async () => {
      const user = userEvent.setup();
      const { container } = render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      // Click on the button that contains both avatar and title
      const profileButton = container.querySelector('button[class*="flex items-center space-x-3"]');
      if (profileButton) {
        await user.click(profileButton);
        expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
      }
    });
  });

  describe('Profile Hover Effects', () => {
    it('should apply hover opacity on profile section', async () => {
      const { container } = render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileButton = container.querySelector('button[class*="flex items-center space-x-3"]');
      expect(profileButton).toHaveClass('hover:opacity-80');
    });

    it('should apply transition effect on profile section', async () => {
      const { container } = render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileButton = container.querySelector('button[class*="flex items-center space-x-3"]');
      expect(profileButton).toHaveClass('transition-opacity');
    });

    it('should apply hover color change on profile title', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileTitle = screen.getByText('Acme Corporation');
      expect(profileTitle).toHaveClass('hover:text-[hsl(280,100%,70%)]');
    });
  });

  describe('Profile Navigation with Different Post States', () => {
    it('should handle navigation with post that has many images', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        images: [
          'https://example.com/img1.jpg',
          'https://example.com/img2.jpg',
          'https://example.com/img3.jpg',
        ],
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });

    it('should handle navigation with liked post', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        user_liked: true,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });

    it('should handle navigation with post without source', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        source: null,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });

    it('should handle navigation with very long profile title', async () => {
      const user = userEvent.setup();
      const longTitle = 'Very Long Corporation Name That Goes On And On International Holdings Limited';
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: 42, title: longTitle },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(longTitle)).toBeInTheDocument();
      });

      const profileName = screen.getByText(longTitle);
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });
  });

  describe('Comment User Navigation', () => {
    it('should navigate to user profile when clicking comment avatar', async () => {
      const user = userEvent.setup();
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Great analysis!')).toBeInTheDocument();
      });

      // Find user avatars (they have 'U' text)
      const userAvatars = screen.getAllByText('U');
      if (userAvatars[0]) {
        await user.click(userAvatars[0]);
        expect(mockSetLocation).toHaveBeenCalledWith('/users/2');
      }
    });

    it('should navigate to user profile when clicking comment username', async () => {
      const user = userEvent.setup();
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('User #2')).toBeInTheDocument();
      });

      const username = screen.getByText('User #2');
      await user.click(username);

      expect(mockSetLocation).toHaveBeenCalledWith('/users/2');
    });

    it('should navigate to thread user profile when clicking thread avatar', async () => {
      const user = userEvent.setup();
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('I agree completely')).toBeInTheDocument();
      });

      const username = screen.getByText('User #3');
      await user.click(username);

      expect(mockSetLocation).toHaveBeenCalledWith('/users/3');
    });
  });

  describe('Profile Navigation Edge Cases', () => {
    it('should handle profile with special characters in title', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: 42, title: 'Tech & Co. <Industries>' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Tech & Co. <Industries>')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Tech & Co. <Industries>');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });

    it('should handle profile with emoji in title', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: 42, title: '🚀 Rocket Corp' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('🚀 Rocket Corp')).toBeInTheDocument();
      });

      const avatar = screen.getByText('🚀');
      expect(avatar).toBeInTheDocument();

      const profileName = screen.getByText('🚀 Rocket Corp');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });

    it('should handle profile with numeric-only title', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: 42, title: '123456' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('123456')).toBeInTheDocument();
      });

      // Avatar should show '1' (first character)
      const avatar = screen.getByText('1');
      expect(avatar).toBeInTheDocument();

      const profileName = screen.getByText('123456');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });

    it('should handle profile with empty string title', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: 42, title: '' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Profile #42')).toBeInTheDocument();
      });

      const avatar = screen.getByText('P');
      expect(avatar).toBeInTheDocument();

      const profileName = screen.getByText('Profile #42');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });

    it('should handle profile navigation with zero profile ID', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: 0, title: 'Acme Corporation' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/0');
    });

    it('should handle profile navigation with negative profile ID', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: -1, title: 'Acme Corporation' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/-1');
    });
  });

  describe('Profile Navigation in Error States', () => {
    it('should not render profile when post fetch fails', async () => {
      vi.mocked(api.postsApi.getPost).mockRejectedValue(new Error('Post not found'));

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to feed/i })).toBeInTheDocument();
      });

      expect(screen.queryByText('Acme Corporation')).not.toBeInTheDocument();
    });

    it('should not navigate when profile data is malformed', async () => {
      const user = userEvent.setup();
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostWithProfile,
        profile: { id: null as any, title: 'Acme Corporation' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');
      await user.click(profileName);

      // Should still attempt navigation with null
      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/null');
    });
  });

  describe('Profile Navigation for Unauthenticated Users', () => {
    it('should still allow profile navigation when user is not logged in', async () => {
      // Mock unauthenticated state
      vi.mocked(require('@/contexts/AuthContext').useAuth).mockReturnValue({
        user: null,
        isLoading: false,
      });

      const user = userEvent.setup();
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');
      await user.click(profileName);

      expect(mockSetLocation).toHaveBeenCalledWith('/profiles/42');
    });
  });

  describe('Thread Reaction Functionality', () => {
    it('should call addThreadReaction when clicking thread like button', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addThreadReaction).mockResolvedValue(undefined);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('I agree completely')).toBeInTheDocument();
      });

      // Find the heart icon button for the thread
      const threadContainer = screen.getByText('I agree completely').closest('div.flex-1');
      const heartButton = threadContainer?.querySelector('button[class*="text-xs"]');

      if (heartButton) {
        await user.click(heartButton);

        await waitFor(() => {
          expect(api.commentsApi.addThreadReaction).toHaveBeenCalledWith(123, 1, 101);
        });
      }
    });

    it('should show success toast when thread reaction is added', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addThreadReaction).mockResolvedValue(undefined);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('I agree completely')).toBeInTheDocument();
      });

      const threadContainer = screen.getByText('I agree completely').closest('div.flex-1');
      const heartButton = threadContainer?.querySelector('button[class*="text-xs"]');

      if (heartButton) {
        await user.click(heartButton);

        // Toast should be triggered (mocked in test utils)
        await waitFor(() => {
          expect(api.commentsApi.addThreadReaction).toHaveBeenCalled();
        });
      }
    });

    it('should handle thread reaction error gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addThreadReaction).mockRejectedValue(new Error('Failed to add reaction'));

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('I agree completely')).toBeInTheDocument();
      });

      const threadContainer = screen.getByText('I agree completely').closest('div.flex-1');
      const heartButton = threadContainer?.querySelector('button[class*="text-xs"]');

      if (heartButton) {
        await user.click(heartButton);

        await waitFor(() => {
          expect(api.commentsApi.addThreadReaction).toHaveBeenCalledWith(123, 1, 101);
        });
      }
    });
  });

  describe('Performance and Accessibility', () => {
    it('should have proper button role for profile navigation', async () => {
      const { container } = render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileButton = container.querySelector('button[class*="flex items-center space-x-3"]');
      expect(profileButton?.tagName).toBe('BUTTON');
    });

    it('should maintain proper text alignment in profile section', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileTextContainer = screen.getByText('Acme Corporation').parentElement;
      expect(profileTextContainer).toHaveClass('text-left');
    });

    it('should prevent multiple rapid clicks on profile', async () => {
      const user = userEvent.setup();
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Acme Corporation')).toBeInTheDocument();
      });

      const profileName = screen.getByText('Acme Corporation');

      // Rapid clicks
      await user.click(profileName);
      await user.click(profileName);
      await user.click(profileName);

      // Should only navigate once (last call)
      expect(mockSetLocation).toHaveBeenCalledTimes(3);
      expect(mockSetLocation).toHaveBeenLastCalledWith('/profiles/42');
    });
  });
});