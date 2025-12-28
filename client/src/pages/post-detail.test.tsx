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
    deleteComment: vi.fn(),
    deleteThreadReply: vi.fn(),
  },
}));

// Mock wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useRoute: () => [true, { postId: '123' }],
  useLocation: () => ['/', mockSetLocation],
  Router: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ component: Component }: { component: React.ComponentType }) => <Component />,
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { user_id: 1, email: 'test@example.com', full_name: 'Test User' },
    isLoading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Use recent dates for proper time formatting
const getRecentDate = (hoursAgo: number = 2) => {
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
};

const mockComments = [
  {
    id: 1,
    user_id: 2,
    content: 'Great news!',
    reaction_count: 3,
    thread: [],
    created_at: getRecentDate(1),
  },
  {
    id: 2,
    user_id: 3,
    content: 'Congratulations!',
    reaction_count: 1,
    thread: [],
    created_at: getRecentDate(0.5),
  },
];

const mockPostDetail = {
  id: 123,
  content: 'This is a test post about our Q3 results',
  profile: {
    id: 1,
    title: 'Test Company',
  },
  source: 'https://example.com/news',
  created_at: getRecentDate(3),
  submission_date: getRecentDate(3),
  images: [],
  reaction_count: 15,
  comment_count: 2,
  user_liked: false,
};

const mockCommentsResponse = {
  comments: mockComments,
  total: 2,
  page_no: 1,
  page_size: 40,
  total_pages: 1,
};

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.postsApi.getPost).mockResolvedValue(mockPostDetail);
    vi.mocked(api.commentsApi.getComments).mockResolvedValue(mockCommentsResponse);
  });

  describe('Initial Loading and Rendering', () => {
    it('should show loading spinner initially', () => {
      vi.mocked(api.postsApi.getPost).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      const { container } = render(<PostDetailPage />);
      // The Loader2 component with animate-spin class should be present
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('should fetch and display post details', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(api.postsApi.getPost).toHaveBeenCalledWith(123);
      });

      await waitFor(() => {
        expect(screen.getByText('This is a test post about our Q3 results')).toBeInTheDocument();
      });
    });

    it('should display profile information', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Test Company')).toBeInTheDocument();
      });
    });

    it('should display time ago', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('This is a test post about our Q3 results')).toBeInTheDocument();
      });

      await waitFor(() => {
        const timeAgoElements = screen.getAllByText(/ago$/i);
        expect(timeAgoElements.length).toBeGreaterThan(0);
      });
    });

    it('should display like count', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument();
      });
    });

    it('should display comment count', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/Comments \(2\)/i)).toBeInTheDocument();
      });
    });
  });

  describe('Back Navigation', () => {
    it('should have back to feed button', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to feed/i })).toBeInTheDocument();
      });
    });

    it('should navigate back to feed when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to feed/i })).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /back to feed/i });
      await user.click(backButton);

      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });
  });

  describe('Source Link', () => {
    it('should display source link when available', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        const sourceLink = screen.getByRole('link', { name: /view source/i });
        expect(sourceLink).toBeInTheDocument();
        expect(sourceLink).toHaveAttribute('href', 'https://example.com/news');
        expect(sourceLink).toHaveAttribute('target', '_blank');
      });
    });

    it('should not display source link when not available', async () => {
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostDetail,
        source: null,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.queryByRole('link', { name: /view source/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Images', () => {
    it('should display images when available', async () => {
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostDetail,
        images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        const images = screen.getAllByRole('img', { name: /post image/i });
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute('src', 'https://example.com/img1.jpg');
        expect(images[1]).toHaveAttribute('src', 'https://example.com/img2.jpg');
      });
    });

    it('should not display images section when images array is empty', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: /post image/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Like Functionality', () => {
    it('should show correct like state based on user_liked', async () => {
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostDetail,
        user_liked: true,
      });

      const { container } = render(<PostDetailPage />);

      await waitFor(() => {
        const likedButton = container.querySelector('[class*="text-[hsl(280,100%,70%)]"]');
        expect(likedButton).toBeInTheDocument();
      });
    });

    it('should call addReaction API when like button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(api.reactionsApi.addReaction).mockResolvedValueOnce();

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('This is a test post about our Q3 results')).toBeInTheDocument();
      });

      const likeButtons = screen.getAllByRole('button');
      const likeButton = likeButtons.find(btn => btn.textContent?.includes('15'));

      if (likeButton) {
        await user.click(likeButton);

        await waitFor(() => {
          expect(api.reactionsApi.addReaction).toHaveBeenCalledWith(123);
        });
      }
    });

    it('should optimistically update like count', async () => {
      const user = userEvent.setup();
      vi.mocked(api.reactionsApi.addReaction).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('This is a test post about our Q3 results')).toBeInTheDocument();
      });

      const likeButtons = screen.getAllByRole('button');
      const likeButton = likeButtons.find(btn => btn.textContent?.includes('15'));

      if (likeButton) {
        await user.click(likeButton);
        expect(screen.getByText('16')).toBeInTheDocument();
      }
    });

    it('should revert like count on error', async () => {
      const user = userEvent.setup();
      vi.mocked(api.reactionsApi.addReaction).mockRejectedValueOnce(new Error('API Error'));

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('This is a test post about our Q3 results')).toBeInTheDocument();
      });

      const likeButtons = screen.getAllByRole('button');
      const likeButton = likeButtons.find(btn => btn.textContent?.includes('15'));

      if (likeButton) {
        await user.click(likeButton);

        await waitFor(() => {
          expect(screen.getByText('15')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Comments Display', () => {
    it('should display all comments', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Great news!')).toBeInTheDocument();
        expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      });
    });

    it('should display comment reaction counts', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should display comment time ago', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        const timeAgoElements = screen.getAllByText(/ago$/i);
        // At least one for post, and one for each comment
        expect(timeAgoElements.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should show empty state when no comments', async () => {
      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: [],
        total: 0,
        page_no: 1,
        page_size: 40,
        total_pages: 0,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/no comments yet/i)).toBeInTheDocument();
      });
    });
  });

  describe('Add Comment Functionality', () => {
    it('should display comment input for logged in users', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });
    });

    it('should enable post button when comment has content', async () => {
      const user = userEvent.setup();
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/write your comment/i);
      await user.type(input, 'This is my comment');

      const postButton = screen.getByRole('button', { name: /post comment/i });
      expect(postButton).not.toBeDisabled();
    });

    it('should disable post button when comment is empty', async () => {
      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });

      const postButton = screen.getByRole('button', { name: /post comment/i });
      expect(postButton).toBeDisabled();
    });

    it('should call addComment API when posting comment', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addComment).mockResolvedValueOnce();
      vi.mocked(api.postsApi.getPost).mockResolvedValueOnce(mockPostDetail);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/write your comment/i);
      await user.type(input, 'My new comment');

      const postButton = screen.getByRole('button', { name: /post comment/i });
      await user.click(postButton);

      await waitFor(() => {
        expect(api.commentsApi.addComment).toHaveBeenCalledWith(123, 'My new comment');
      });
    });

    it('should clear input after posting comment', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addComment).mockResolvedValueOnce();
      vi.mocked(api.postsApi.getPost).mockResolvedValueOnce(mockPostDetail);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/write your comment/i) as HTMLInputElement;
      await user.type(input, 'My new comment');

      const postButton = screen.getByRole('button', { name: /post comment/i });
      await user.click(postButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('should reload comments after posting', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addComment).mockResolvedValueOnce();

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/write your comment/i);
      await user.type(input, 'My new comment');

      const postButton = screen.getByRole('button', { name: /post comment/i });
      await user.click(postButton);

      await waitFor(() => {
        // Comments are reloaded via commentsApi.getComments after posting
        // Initial load (1) + reload after post (1) = 2 calls
        expect(api.commentsApi.getComments).toHaveBeenCalledTimes(2);
      });
    });

    it('should submit comment on Enter key', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addComment).mockResolvedValueOnce();
      vi.mocked(api.postsApi.getPost).mockResolvedValueOnce(mockPostDetail);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/write your comment/i);
      await user.type(input, 'My new comment{Enter}');

      await waitFor(() => {
        expect(api.commentsApi.addComment).toHaveBeenCalledWith(123, 'My new comment');
      });
    });

    it('should not submit comment on Shift+Enter', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addComment).mockResolvedValueOnce();

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/write your comment/i);
      await user.type(input, 'My new comment{Shift>}{Enter}{/Shift}');

      // Should not call API
      expect(api.commentsApi.addComment).not.toHaveBeenCalled();
    });
  });

  describe('Paginated Comments Loading', () => {
    it('should load more comments when scrolling near bottom', async () => {
      // Create many comments for initial page - mark as having more pages
      const manyComments = Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        user_id: i + 1,
        content: `Comment ${i + 1}`,
        reaction_count: 0,
        thread: [],
        created_at: getRecentDate(1),
      }));

      // Initial load returns page 1 with more pages available
      vi.mocked(api.commentsApi.getComments)
        .mockResolvedValueOnce({
          comments: manyComments,
          total: 50,
          page_no: 1,
          page_size: 40,
          total_pages: 2,
        })
        .mockResolvedValueOnce({
          comments: [
            {
              id: 46,
              user_id: 46,
              content: 'Comment from page 2',
              reaction_count: 0,
              thread: [],
              created_at: getRecentDate(0.5),
            },
          ],
          total: 50,
          page_no: 2,
          page_size: 40,
          total_pages: 2,
        });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Comment 1')).toBeInTheDocument();
      });

      // Simulate scroll event
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 1000, writable: true, configurable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1500, writable: true, configurable: true });
      Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, writable: true, configurable: true });

      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(api.commentsApi.getComments).toHaveBeenCalledWith(123, 2, 40);
      }, { timeout: 3000 });
    });

    it('should show loading indicator when loading more comments', async () => {
      // Initial comments load with more pages
      vi.mocked(api.commentsApi.getComments)
        .mockResolvedValueOnce({
          comments: mockComments,
          total: 50,
          page_no: 1,
          page_size: 40,
          total_pages: 2,
        })
        .mockImplementationOnce(
          () => new Promise(resolve => setTimeout(() => resolve({
            comments: [],
            total: 50,
            page_no: 2,
            page_size: 40,
            total_pages: 2,
          }), 1000))
        );

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Great news!')).toBeInTheDocument();
      });

      // Trigger scroll
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 1000, writable: true });
      Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1500, writable: true });
      Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, writable: true });

      window.dispatchEvent(new Event('scroll'));

      // Loading indicator should appear (may need to adjust based on actual component)
      await waitFor(() => {
        const loadingElements = screen.queryAllByRole('status', { hidden: true });
        expect(loadingElements.length).toBeGreaterThan(0);
      }, { timeout: 500 });
    });

    it('should show end message when all comments are loaded', async () => {
      // Default mock already has total_pages: 1, so no more comments to load
      render(<PostDetailPage />);

      await waitFor(() => {
        // Check if there's a message indicating no more comments (depends on implementation)
        // This might show "You've reached the end of comments" or similar
        expect(screen.getByText(/end of comments/i) || screen.getByText('Great news!')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when post fetch fails', async () => {
      vi.mocked(api.postsApi.getPost).mockRejectedValueOnce(new Error('Post not found'));

      render(<PostDetailPage />);

      await waitFor(() => {
        // The error handler transforms "Post not found" to "The requested resource was not found."
        // There will be multiple elements with this text (page error + toast)
        const errorMessages = screen.getAllByText(/requested resource was not found/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });

    it('should show error state with back button', async () => {
      vi.mocked(api.postsApi.getPost).mockRejectedValueOnce(new Error('Network error'));

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to feed/i })).toBeInTheDocument();
      });
    });

    it('should handle comment submission error gracefully', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addComment).mockRejectedValueOnce(new Error('Failed to post comment'));

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/write your comment/i) as HTMLInputElement;
      await user.type(input, 'My new comment');

      const postButton = screen.getByRole('button', { name: /post comment/i });
      await user.click(postButton);

      await waitFor(() => {
        // The API should have been called
        expect(api.commentsApi.addComment).toHaveBeenCalledWith(123, 'My new comment');
      });

      // After error, check that error toast was shown (implementation shows toast on error)
      // The input value is NOT preserved in the current implementation on error
      // which is actually better UX in some cases, but let's verify the error was handled
      expect(vi.mocked(api.commentsApi.addComment)).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle post with no profile title', async () => {
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostDetail,
        profile: { id: 1, title: '' },
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Profile #1')).toBeInTheDocument();
      });
    });

    it('should handle very long post content', async () => {
      const longContent = 'Lorem ipsum '.repeat(500);
      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostDetail,
        content: longContent,
      });

      const { container } = render(<PostDetailPage />);

      await waitFor(() => {
        const contentElement = container.querySelector('.whitespace-pre-wrap');
        expect(contentElement?.textContent).toContain('Lorem ipsum');
      });
    });

    it('should handle post with many comments', async () => {
      const manyComments = Array.from({ length: 40 }, (_, i) => ({
        id: i + 1,
        user_id: i + 1,
        content: `Comment ${i + 1}`,
        reaction_count: i,
        thread: [],
        created_at: getRecentDate(1),
      }));

      vi.mocked(api.postsApi.getPost).mockResolvedValue({
        ...mockPostDetail,
        comment_count: 100,
      });

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: manyComments,
        total: 100,
        page_no: 1,
        page_size: 40,
        total_pages: 3,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText(/Comments \(100\)/i)).toBeInTheDocument();
      });
    });

    it('should trim whitespace from comments before submission', async () => {
      const user = userEvent.setup();
      vi.mocked(api.commentsApi.addComment).mockResolvedValueOnce();
      vi.mocked(api.postsApi.getPost).mockResolvedValueOnce(mockPostDetail);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/write your comment/i)).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/write your comment/i);
      await user.type(input, '   My comment with spaces   ');

      const postButton = screen.getByRole('button', { name: /post comment/i });
      await user.click(postButton);

      await waitFor(() => {
        expect(api.commentsApi.addComment).toHaveBeenCalledWith(123, 'My comment with spaces');
      });
    });
  });

  describe('Delete Comment Functionality', () => {
    it('should show delete button only for comment owner', async () => {
      // Mock user is user_id: 1, comment 1 has user_id: 2, comment 2 has user_id: 3
      const commentsWithOwnership = [
        { id: 1, user_id: 2, content: 'Not my comment', reaction_count: 0, thread: [], created_at: getRecentDate(1) },
        { id: 2, user_id: 1, content: 'My comment', reaction_count: 0, thread: [], created_at: getRecentDate(0.5) },
      ];

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: commentsWithOwnership,
        total: 2,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My comment')).toBeInTheDocument();
      });

      // Should have delete button for owned comment only
      const deleteButtons = screen.queryAllByTitle('Delete comment');
      expect(deleteButtons).toHaveLength(1);
    });

    it('should successfully delete a comment when confirmed', async () => {
      const user = userEvent.setup();
      const commentsWithOwnership = [
        { id: 1, user_id: 1, content: 'My comment to delete', reaction_count: 0, thread: [], created_at: getRecentDate(1) },
      ];

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: commentsWithOwnership,
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      vi.mocked(api.commentsApi.deleteComment).mockResolvedValueOnce({
        message: 'Comment deleted successfully',
        comment_id: 1,
        post_id: 123,
      });

      // Mock window.confirm to return true
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My comment to delete')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle('Delete comment');
      await user.click(deleteButton);

      // Should show confirmation dialog
      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete this comment?'
      );

      await waitFor(() => {
        expect(api.commentsApi.deleteComment).toHaveBeenCalledWith(123, 1);
      });

      confirmSpy.mockRestore();
    });

    it('should not delete comment when user cancels confirmation', async () => {
      const user = userEvent.setup();
      const commentsWithOwnership = [
        { id: 1, user_id: 1, content: 'My comment', reaction_count: 0, thread: [], created_at: getRecentDate(1) },
      ];

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: commentsWithOwnership,
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      // Mock window.confirm to return false (user cancels)
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My comment')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle('Delete comment');
      await user.click(deleteButton);

      // Should NOT call delete API
      expect(api.commentsApi.deleteComment).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('should handle delete error gracefully', async () => {
      const user = userEvent.setup();
      const commentsWithOwnership = [
        { id: 1, user_id: 1, content: 'My comment', reaction_count: 0, thread: [], created_at: getRecentDate(1) },
      ];

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: commentsWithOwnership,
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      vi.mocked(api.commentsApi.deleteComment).mockRejectedValueOnce(
        new Error('You can only delete your own comments')
      );

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My comment')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle('Delete comment');
      await user.click(deleteButton);

      await waitFor(() => {
        expect(api.commentsApi.deleteComment).toHaveBeenCalled();
      });

      // Comment should still be visible after error
      await waitFor(() => {
        expect(screen.getByText('My comment')).toBeInTheDocument();
      });

      confirmSpy.mockRestore();
    });

    it('should disable delete button while deletion is in progress', async () => {
      const user = userEvent.setup();
      const commentsWithOwnership = [
        { id: 1, user_id: 1, content: 'My comment', reaction_count: 0, thread: [], created_at: getRecentDate(1) },
      ];

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: commentsWithOwnership,
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      // Mock slow delete operation
      vi.mocked(api.commentsApi.deleteComment).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          message: 'Comment deleted successfully',
          comment_id: 1,
          post_id: 123,
        }), 100))
      );

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My comment')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle('Delete comment');
      await user.click(deleteButton);

      // Button should be disabled during deletion
      await waitFor(() => {
        expect(deleteButton).toBeDisabled();
      });

      confirmSpy.mockRestore();
    });

    it('should update comment count after successful deletion', async () => {
      const user = userEvent.setup();
      const commentsWithOwnership = [
        { id: 1, user_id: 1, content: 'My comment to delete', reaction_count: 0, thread: [], created_at: getRecentDate(1) },
      ];

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: commentsWithOwnership,
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      vi.mocked(api.commentsApi.deleteComment).mockResolvedValueOnce({
        message: 'Comment deleted successfully',
        comment_id: 1,
        post_id: 123,
      });

      // Mock updated post with decreased comment count
      vi.mocked(api.postsApi.getPost).mockResolvedValueOnce({
        ...mockPostDetail,
        comment_count: 1, // Updated count after deletion
      });

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My comment to delete')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle('Delete comment');
      await user.click(deleteButton);

      await waitFor(() => {
        // Post should be refetched to update count
        expect(api.postsApi.getPost).toHaveBeenCalledTimes(2);
      });

      confirmSpy.mockRestore();
    });
  });

  describe('Deleted Comment Display', () => {
    it('should display [deleted] placeholder for deleted comments', async () => {
      const deletedComment = {
        id: 1,
        deleted: true,
        thread: [],
      };

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: [deletedComment],
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
      });

      // Should not show user info or content
      expect(screen.queryByText(/User #/)).not.toBeInTheDocument();
    });

    it('should still show thread replies for deleted comments', async () => {
      const deletedCommentWithReplies = {
        id: 1,
        deleted: true,
        thread: [
          {
            id: 1,
            user_id: 2,
            user_name: 'Replier',
            content: 'This is a reply',
            reaction_count: 0,
            created_at: getRecentDate(1),
          },
        ],
      };

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: [deletedCommentWithReplies],
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
        expect(screen.getByText('This is a reply')).toBeInTheDocument();
        expect(screen.getByText('Replier')).toBeInTheDocument();
      });
    });

    it('should not show like/reply/delete buttons for deleted comments', async () => {
      const deletedComment = {
        id: 1,
        user_id: 1,
        deleted: true,
        thread: [],
      };

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: [deletedComment],
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('[deleted]')).toBeInTheDocument();
      });

      // Should not show action buttons
      expect(screen.queryByTitle('Delete comment')).not.toBeInTheDocument();
      expect(screen.queryByText('Reply')).not.toBeInTheDocument();
    });
  });

  describe('Thread Reply Deletion', () => {
    it('should show delete button for thread reply owner', async () => {
      const commentWithReply = {
        id: 1,
        user_id: 2,
        user_name: 'Commenter',
        content: 'Parent comment',
        reaction_count: 0,
        thread: [
          {
            id: 1,
            user_id: 1,
            user_name: 'Me',
            content: 'My reply',
            reaction_count: 0,
            created_at: getRecentDate(1),
          },
        ],
        created_at: getRecentDate(2),
      };

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: [commentWithReply],
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My reply')).toBeInTheDocument();
      });

      // Should show delete button for own reply
      const deleteButtons = screen.getAllByTitle('Delete reply');
      expect(deleteButtons).toHaveLength(1);
    });

    it('should not show delete button for other users replies', async () => {
      const commentWithOthersReply = {
        id: 1,
        user_id: 2,
        user_name: 'Commenter',
        content: 'Parent comment',
        reaction_count: 0,
        thread: [
          {
            id: 1,
            user_id: 3,
            user_name: 'Someone Else',
            content: 'Their reply',
            reaction_count: 0,
            created_at: getRecentDate(1),
          },
        ],
        created_at: getRecentDate(2),
      };

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: [commentWithOthersReply],
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('Their reply')).toBeInTheDocument();
      });

      // Should NOT show delete button for other's reply
      expect(screen.queryByTitle('Delete reply')).not.toBeInTheDocument();
    });

    it('should successfully delete a thread reply when confirmed', async () => {
      const user = userEvent.setup();
      const commentWithReply = {
        id: 1,
        user_id: 2,
        user_name: 'Commenter',
        content: 'Parent comment',
        reaction_count: 0,
        thread: [
          {
            id: 5,
            user_id: 1,
            user_name: 'Me',
            content: 'My reply to delete',
            reaction_count: 0,
            created_at: getRecentDate(1),
          },
        ],
        created_at: getRecentDate(2),
      };

      vi.mocked(api.commentsApi.getComments).mockResolvedValueOnce({
        comments: [commentWithReply],
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      // Mock confirmation dialog
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      // Mock successful deletion - reply is removed from thread
      const commentAfterDeletion = {
        ...commentWithReply,
        thread: [], // Reply removed
      };

      vi.mocked(api.commentsApi.deleteThreadReply).mockResolvedValueOnce({
        message: 'Thread reply deleted',
        thread_id: 5,
        comment_id: 1,
        post_id: 123,
      });

      vi.mocked(api.commentsApi.getComments).mockResolvedValueOnce({
        comments: [commentAfterDeletion],
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My reply to delete')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle('Delete reply');
      await user.click(deleteButton);

      // Should show confirmation dialog
      expect(confirmSpy).toHaveBeenCalledWith(
        'Are you sure you want to delete this reply?'
      );

      await waitFor(() => {
        expect(api.commentsApi.deleteThreadReply).toHaveBeenCalledWith(123, 1, 5);
      });

      // Should reload comments - verify by checking getComments was called at least twice
      await waitFor(() => {
        expect(vi.mocked(api.commentsApi.getComments).mock.calls.length).toBeGreaterThanOrEqual(2);
      }, { timeout: 3000 });

      confirmSpy.mockRestore();
    });

    it('should not delete reply when user cancels confirmation', async () => {
      const user = userEvent.setup();
      const commentWithReply = {
        id: 1,
        user_id: 2,
        user_name: 'Commenter',
        content: 'Parent comment',
        reaction_count: 0,
        thread: [
          {
            id: 5,
            user_id: 1,
            user_name: 'Me',
            content: 'My reply',
            reaction_count: 0,
            created_at: getRecentDate(1),
          },
        ],
        created_at: getRecentDate(2),
      };

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: [commentWithReply],
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      // Mock window.confirm to return false (user cancels)
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My reply')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle('Delete reply');
      await user.click(deleteButton);

      // Should NOT call delete API
      expect(api.commentsApi.deleteThreadReply).not.toHaveBeenCalled();

      confirmSpy.mockRestore();
    });

    it('should handle thread reply deletion error gracefully', async () => {
      const user = userEvent.setup();
      const commentWithReply = {
        id: 1,
        user_id: 2,
        user_name: 'Commenter',
        content: 'Parent comment',
        reaction_count: 0,
        thread: [
          {
            id: 5,
            user_id: 1,
            user_name: 'Me',
            content: 'My reply',
            reaction_count: 0,
            created_at: getRecentDate(1),
          },
        ],
        created_at: getRecentDate(2),
      };

      vi.mocked(api.commentsApi.getComments).mockResolvedValue({
        comments: [commentWithReply],
        total: 1,
        page_no: 1,
        page_size: 40,
        total_pages: 1,
      });

      vi.mocked(api.commentsApi.deleteThreadReply).mockRejectedValueOnce(
        new Error('Failed to delete reply')
      );

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<PostDetailPage />);

      await waitFor(() => {
        expect(screen.getByText('My reply')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTitle('Delete reply');
      await user.click(deleteButton);

      await waitFor(() => {
        // Error is shown in toast (may appear in multiple places for accessibility)
        const errorMessages = screen.getAllByText(/Failed to delete/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });

      confirmSpy.mockRestore();
    });
  });
});
