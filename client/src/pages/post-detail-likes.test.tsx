import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'wouter';
import PostDetailPage from './post-detail';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';

// Mock the API
vi.mock('@/lib/api', () => ({
  postsApi: {
    getPost: vi.fn(() => Promise.resolve({
      id: 1,
      content: 'Test post content',
      profile_id: 1,
      profile_title: 'Test Profile',
      source: null,
      created_at: '2024-01-01T00:00:00Z',
      images: [],
      reaction_count: 5,
      comment_count: 2,
      user_liked: false,
      attributes: null,
      attributes_metadata: null,
    })),
  },
  commentsApi: {
    getComments: vi.fn(() => Promise.resolve({
      comments: [
        {
          id: 1,
          user_id: 10,
          content: 'Test comment',
          reaction_count: 3,
          user_liked: false,
          created_at: '2024-01-01T01:00:00Z',
          thread: [
            {
              id: 100,
              user_id: 20,
              content: 'Test thread reply',
              reaction_count: 1,
              user_liked: false,
              created_at: '2024-01-01T02:00:00Z',
            },
          ],
        },
        {
          id: 2,
          user_id: 30,
          content: 'Another comment',
          reaction_count: 0,
          user_liked: true,
          created_at: '2024-01-01T03:00:00Z',
          thread: [],
        },
      ],
      total_pages: 1,
    })),
    addCommentReaction: vi.fn(() => Promise.resolve()),
    addThreadReaction: vi.fn(() => Promise.resolve()),
  },
  reactionsApi: {
    addReaction: vi.fn(() => Promise.resolve()),
  },
}));

// Mock wouter
vi.mock('wouter', () => ({
  useRoute: vi.fn(() => [true, { postId: '1' }]),
  useLocation: vi.fn(() => ['/', vi.fn()]),
  Router: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock user context
const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
};

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: vi.fn(() => ({
    user: mockUser,
    isLoading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  })),
}));

describe('PostDetailPage - Comment and Thread Likes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Comment Likes Visual Feedback', () => {
    it('should show filled heart and color for liked comments', async () => {
      const { AuthProvider } = await import('@/contexts/AuthContext');
      const { Router } = await import('wouter');

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Another comment')).toBeInTheDocument();
      });

      // Find the liked comment's like button
      const commentSection = screen.getByText('Another comment').closest('div');
      const likeButton = commentSection?.querySelector('button[class*="text-"][class*="280"]');

      expect(likeButton).toBeInTheDocument();
      expect(likeButton?.className).toContain('hsl(280,100%,70%)'); // Purple color for liked

      // Check if heart icon has fill-current class
      const heartIcon = likeButton?.querySelector('svg');
      expect(heartIcon?.className).toContain('fill-current');
      expect(heartIcon?.className).toContain('scale-110');
    });

    it('should show empty heart and muted color for unliked comments', async () => {
      const { AuthProvider } = await import('@/contexts/AuthContext');
      const { Router } = await import('wouter');

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });

      // Find the unliked comment's like button
      const commentSection = screen.getByText('Test comment').closest('div');
      const likeButton = commentSection?.querySelector('button[class*="text-muted-foreground"]');

      expect(likeButton).toBeInTheDocument();
      expect(likeButton?.className).toContain('text-muted-foreground');

      // Check if heart icon doesn't have fill-current class
      const heartIcon = likeButton?.querySelector('svg');
      expect(heartIcon?.className).not.toContain('fill-current');
      expect(heartIcon?.className).not.toContain('scale-110');
    });

    it('should toggle visual state when liking a comment', async () => {
      const commentsApi = vi.mocked(await import('@/lib/api')).commentsApi;

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });

      const commentSection = screen.getByText('Test comment').closest('div');
      const likeButton = commentSection?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;

      // Initial state - unliked
      expect(likeButton?.className).toContain('text-muted-foreground');

      // Click to like
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(likeButton?.className).toContain('hsl(280,100%,70%)');
        expect(commentsApi.addCommentReaction).toHaveBeenCalledWith(1, 1);
      });

      // Check heart icon is filled
      const heartIcon = likeButton?.querySelector('svg');
      expect(heartIcon?.className).toContain('fill-current');
      expect(heartIcon?.className).toContain('scale-110');

      // Check count updated
      expect(screen.getByText('4')).toBeInTheDocument(); // 3 + 1
    });

    it('should show loading state while liking', async () => {
      const commentsApi = vi.mocked(await import('@/lib/api')).commentsApi;
      commentsApi.addCommentReaction.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });

      const commentSection = screen.getByText('Test comment').closest('div');
      const likeButton = commentSection?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;

      fireEvent.click(likeButton);

      // Should show loading state
      expect(likeButton?.className).toContain('opacity-50');
      expect(likeButton?.className).toContain('cursor-wait');

      await waitFor(() => {
        expect(likeButton?.className).not.toContain('cursor-wait');
      });
    });
  });

  describe('Thread Likes Visual Feedback', () => {
    it('should show proper visual state for thread likes', async () => {

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Test thread reply')).toBeInTheDocument();
      });

      // Find the thread like button
      const threadSection = screen.getByText('Test thread reply').closest('div');
      const likeButton = threadSection?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;

      expect(likeButton).toBeInTheDocument();
      expect(likeButton?.className).toContain('text-muted-foreground');

      // Click to like
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(likeButton?.className).toContain('hsl(200,100%,70%)'); // Blue color for thread likes
      });

      // Check heart icon is filled
      const heartIcon = likeButton?.querySelector('svg');
      expect(heartIcon?.className).toContain('fill-current');
      expect(heartIcon?.className).toContain('scale-110');
    });

    it('should call correct API for thread reactions', async () => {
      const commentsApi = vi.mocked(await import('@/lib/api')).commentsApi;

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Test thread reply')).toBeInTheDocument();
      });

      const threadSection = screen.getByText('Test thread reply').closest('div');
      const likeButton = threadSection?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;

      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(commentsApi.addThreadReaction).toHaveBeenCalledWith(1, 1, 100);
      });
    });

    it('should handle optimistic updates for thread likes', async () => {
      const commentsApi = vi.mocked(await import('@/lib/api')).commentsApi;

      // Simulate API delay
      commentsApi.addThreadReaction.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Test thread reply')).toBeInTheDocument();
      });

      const threadSection = screen.getByText('Test thread reply').closest('div');
      const likeButton = threadSection?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;

      // Initial count
      expect(screen.getByText('1')).toBeInTheDocument();

      fireEvent.click(likeButton);

      // Optimistic update - count should increase immediately
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(likeButton?.className).toContain('hsl(200,100%,70%)');

      await waitFor(() => {
        expect(commentsApi.addThreadReaction).toHaveBeenCalled();
      });
    });

    it('should revert on error for thread likes', async () => {
      const commentsApi = vi.mocked(await import('@/lib/api')).commentsApi;

      commentsApi.addThreadReaction.mockRejectedValue(new Error('Network error'));

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Test thread reply')).toBeInTheDocument();
      });

      const threadSection = screen.getByText('Test thread reply').closest('div');
      const likeButton = threadSection?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;

      // Initial state
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(likeButton?.className).toContain('text-muted-foreground');

      fireEvent.click(likeButton);

      // Wait for error and revert
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Count reverted
        expect(likeButton?.className).toContain('text-muted-foreground'); // Style reverted
      });
    });
  });

  describe('Multiple Simultaneous Likes', () => {
    it('should handle multiple comment likes independently', async () => {
      const commentsApi = vi.mocked(await import('@/lib/api')).commentsApi;

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
        expect(screen.getByText('Another comment')).toBeInTheDocument();
      });

      // Get both comment like buttons
      const comment1Section = screen.getByText('Test comment').closest('div');
      const comment2Section = screen.getByText('Another comment').closest('div');

      const likeButton1 = comment1Section?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;
      const likeButton2 = comment2Section?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;

      // Click both rapidly
      fireEvent.click(likeButton1);
      fireEvent.click(likeButton2);

      await waitFor(() => {
        expect(commentsApi.addCommentReaction).toHaveBeenCalledTimes(2);
        expect(commentsApi.addCommentReaction).toHaveBeenCalledWith(1, 1);
        expect(commentsApi.addCommentReaction).toHaveBeenCalledWith(1, 2);
      });

      // Both should show correct visual state
      expect(likeButton1?.className).toContain('hsl(280,100%,70%)');
      expect(likeButton2?.className).toContain('text-muted-foreground'); // Was already liked, so toggled off
    });

    it('should prevent duplicate likes while request is in progress', async () => {
      const commentsApi = vi.mocked(await import('@/lib/api')).commentsApi;

      commentsApi.addCommentReaction.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 200))
      );

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Test comment')).toBeInTheDocument();
      });

      const commentSection = screen.getByText('Test comment').closest('div');
      const likeButton = commentSection?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;

      // Click multiple times rapidly
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);
      fireEvent.click(likeButton);

      // Should only call API once
      expect(commentsApi.addCommentReaction).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(likeButton?.className).not.toContain('cursor-wait');
      });
    });
  });

  describe('Unlike Functionality', () => {
    it('should toggle off liked state when clicking again', async () => {
      const commentsApi = vi.mocked(await import('@/lib/api')).commentsApi;

      render(
        <Router>
          <AuthProvider>
            <PostDetailPage />
            <Toaster />
          </AuthProvider>
        </Router>
      );

      await waitFor(() => {
        expect(screen.getByText('Another comment')).toBeInTheDocument();
      });

      // Find the already liked comment
      const commentSection = screen.getByText('Another comment').closest('div');
      const likeButton = commentSection?.querySelector('button[class*="flex items-center space-x-1"]') as HTMLButtonElement;

      // Initially liked
      expect(likeButton?.className).toContain('hsl(280,100%,70%)');

      // Click to unlike
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(likeButton?.className).toContain('text-muted-foreground');
        expect(commentsApi.addCommentReaction).toHaveBeenCalledWith(1, 2);
      });

      // Heart should no longer be filled
      const heartIcon = likeButton?.querySelector('svg');
      expect(heartIcon?.className).not.toContain('fill-current');
      expect(heartIcon?.className).not.toContain('scale-110');
    });
  });
});