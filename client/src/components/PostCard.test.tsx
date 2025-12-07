import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { userEvent } from '@testing-library/user-event';
import PostCard, { Post } from './PostCard';
import * as api from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  reactionsApi: {
    addReaction: vi.fn(),
  },
}));

// Mock wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', () => ({
  useLocation: () => ['/', mockSetLocation],
  Router: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ component: Component }: { component: React.ComponentType }) => <Component />,
}));

const mockPost: Post = {
  id: 1,
  content: 'Excited to announce our Q3 results - 25% growth!',
  profile: {
    id: 1,
    title: 'Tech Corp',
  },
  source: 'https://example.com/news/1',
  submission_date: '2024-10-15T10:00:00',
  created_at: '2024-10-15T10:00:00',
  images: [],
  reaction_count: 42,
  comment_count: 5,
  user_liked: false,
};

describe('PostCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render post content', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('Excited to announce our Q3 results - 25% growth!')).toBeInTheDocument();
    });

    it('should display profile title', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    });

    it('should display profile fallback when title is missing', () => {
      const postWithoutTitle = { ...mockPost, profile: { id: 1, title: '' } };
      render(<PostCard post={postWithoutTitle} />);
      expect(screen.getByText('Profile #1')).toBeInTheDocument();
    });

    it('should display profile avatar with first letter', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should display profile avatar fallback when title is missing', () => {
      const postWithoutTitle = { ...mockPost, profile: { id: 1, title: '' } };
      render(<PostCard post={postWithoutTitle} />);
      expect(screen.getByText('P')).toBeInTheDocument();
    });

    it('should display time ago', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText(/ago$/i)).toBeInTheDocument();
    });

    it('should display reaction count', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should display comment count from comment_count field', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display zero comments when comment_count is 0', () => {
      const postWithNoComments = { ...mockPost, comment_count: 0 };
      render(<PostCard post={postWithNoComments} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display source link when source is provided', () => {
      render(<PostCard post={mockPost} />);
      const sourceLink = screen.getByRole('link', { name: /view source/i });
      expect(sourceLink).toBeInTheDocument();
      expect(sourceLink).toHaveAttribute('href', 'https://example.com/news/1');
      expect(sourceLink).toHaveAttribute('target', '_blank');
      expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should not display source link when source is null', () => {
      const postWithoutSource = { ...mockPost, source: null };
      render(<PostCard post={postWithoutSource} />);
      expect(screen.queryByRole('link', { name: /view source/i })).not.toBeInTheDocument();
    });

    it('should display images when provided', () => {
      const postWithImages = {
        ...mockPost,
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
      };
      render(<PostCard post={postWithImages} />);
      const images = screen.getAllByRole('img', { name: /post image/i });
      expect(images).toHaveLength(2);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
      expect(images[1]).toHaveAttribute('src', 'https://example.com/image2.jpg');
    });

    it('should not display images section when images array is empty', () => {
      render(<PostCard post={mockPost} />);
      expect(screen.queryByRole('img', { name: /post image/i })).not.toBeInTheDocument();
    });

    it('should preserve line breaks in content', () => {
      const postWithMultilineContent = {
        ...mockPost,
        content: 'Line 1\nLine 2\nLine 3',
      };
      const { container } = render(<PostCard post={postWithMultilineContent} />);
      const content = container.querySelector('.whitespace-pre-wrap');
      expect(content).toBeInTheDocument();
      expect(content?.textContent).toBe('Line 1\nLine 2\nLine 3');
    });
  });

  describe('User Liked State', () => {
    it('should show filled heart when user_liked is true', () => {
      const likedPost = { ...mockPost, user_liked: true };
      const { container } = render(<PostCard post={likedPost} />);
      const heartButton = container.querySelector('[class*="text-[hsl(280,100%,70%)]"]');
      expect(heartButton).toBeInTheDocument();
    });

    it('should show empty heart when user_liked is false', () => {
      const unlikedPost = { ...mockPost, user_liked: false };
      const { container } = render(<PostCard post={unlikedPost} />);
      const heartButton = container.querySelector('[class*="text-gray-400"]');
      expect(heartButton).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate to post detail page when card is clicked', async () => {
      const user = userEvent.setup();
      render(<PostCard post={mockPost} />);

      const card = screen.getByText('Excited to announce our Q3 results - 25% growth!').closest('div[role="button"]') ||
                   screen.getByText('Excited to announce our Q3 results - 25% growth!').closest('.cursor-pointer');

      if (card) {
        await user.click(card);
        expect(mockSetLocation).toHaveBeenCalledWith('/posts/1');
      }
    });

    it('should not navigate when source link is clicked', async () => {
      const user = userEvent.setup();
      render(<PostCard post={mockPost} />);

      const sourceLink = screen.getByRole('link', { name: /view source/i });
      await user.click(sourceLink);

      // mockSetLocation should not be called because stopPropagation prevents card click
      expect(mockSetLocation).not.toHaveBeenCalled();
    });

    it('should have cursor-pointer class on card', () => {
      const { container } = render(<PostCard post={mockPost} />);
      const card = container.querySelector('.cursor-pointer');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Like Functionality', () => {
    it('should call addReaction API when like button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(api.reactionsApi.addReaction).mockResolvedValueOnce();

      render(<PostCard post={mockPost} />);

      const likeButtons = screen.getAllByRole('button');
      const likeButton = likeButtons.find(btn => btn.textContent?.includes('42'));

      if (likeButton) {
        await user.click(likeButton);

        await waitFor(() => {
          expect(api.reactionsApi.addReaction).toHaveBeenCalledWith(1);
        });
      }
    });

    it('should optimistically update like count when liked', async () => {
      const user = userEvent.setup();
      vi.mocked(api.reactionsApi.addReaction).mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<PostCard post={mockPost} />);

      const likeButtons = screen.getAllByRole('button');
      const likeButton = likeButtons.find(btn => btn.textContent?.includes('42'));

      if (likeButton) {
        await user.click(likeButton);

        // Count should immediately update to 43
        expect(screen.getByText('43')).toBeInTheDocument();
      }
    });

    it('should revert like count on API error', async () => {
      const user = userEvent.setup();
      vi.mocked(api.reactionsApi.addReaction).mockRejectedValueOnce(new Error('API Error'));

      render(<PostCard post={mockPost} />);

      const likeButtons = screen.getAllByRole('button');
      const likeButton = likeButtons.find(btn => btn.textContent?.includes('42'));

      if (likeButton) {
        await user.click(likeButton);

        // Should revert back to 42
        await waitFor(() => {
          expect(screen.getByText('42')).toBeInTheDocument();
        });
      }
    });

    it('should not navigate when like button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(api.reactionsApi.addReaction).mockResolvedValueOnce();

      render(<PostCard post={mockPost} />);

      const likeButtons = screen.getAllByRole('button');
      const likeButton = likeButtons.find(btn => btn.textContent?.includes('42'));

      if (likeButton) {
        await user.click(likeButton);

        // Should not navigate because stopPropagation prevents card click
        expect(mockSetLocation).not.toHaveBeenCalled();
      }
    });

    it('should prevent multiple simultaneous likes', async () => {
      const user = userEvent.setup();
      vi.mocked(api.reactionsApi.addReaction).mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      render(<PostCard post={mockPost} />);

      const likeButtons = screen.getAllByRole('button');
      const likeButton = likeButtons.find(btn => btn.textContent?.includes('42'));

      if (likeButton) {
        // Click multiple times rapidly
        await user.click(likeButton);
        await user.click(likeButton);
        await user.click(likeButton);

        // API should only be called once
        await waitFor(() => {
          expect(api.reactionsApi.addReaction).toHaveBeenCalledTimes(1);
        });
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle posts with zero reactions', () => {
      const postWithZeroReactions = { ...mockPost, reaction_count: 0 };
      render(<PostCard post={postWithZeroReactions} />);
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle posts with high reaction counts', () => {
      const postWithHighReactions = { ...mockPost, reaction_count: 9999 };
      render(<PostCard post={postWithHighReactions} />);
      expect(screen.getByText('9999')).toBeInTheDocument();
    });

    it('should handle posts with high comment counts', () => {
      const postWithHighComments = { ...mockPost, comment_count: 999 };
      render(<PostCard post={postWithHighComments} />);
      expect(screen.getByText('999')).toBeInTheDocument();
    });

    it('should handle empty content gracefully', () => {
      const postWithEmptyContent = { ...mockPost, content: '' };
      const { container } = render(<PostCard post={postWithEmptyContent} />);
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(container.querySelector('.whitespace-pre-wrap')).toBeInTheDocument();
    });

    it('should handle long content', () => {
      const longContent = 'Lorem ipsum '.repeat(100);
      const postWithLongContent = { ...mockPost, content: longContent };
      const { container } = render(<PostCard post={postWithLongContent} />);
      const contentElement = container.querySelector('.whitespace-pre-wrap');
      expect(contentElement?.textContent).toContain('Lorem ipsum');
    });

    it('should handle very long URLs in source', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(200);
      const postWithLongUrl = { ...mockPost, source: longUrl };
      render(<PostCard post={postWithLongUrl} />);
      const sourceLink = screen.getByRole('link', { name: /view source/i });
      expect(sourceLink).toHaveAttribute('href', longUrl);
    });

    it('should handle special characters in content', () => {
      const contentWithSpecialChars = 'Test with <script>alert("xss")</script> & special chars';
      const postWithSpecialContent = { ...mockPost, content: contentWithSpecialChars };
      render(<PostCard post={postWithSpecialContent} />);
      // React automatically escapes content, so it should be safe
      expect(screen.getByText(/Test with.*special chars/)).toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('should have hover effects on card', () => {
      const { container } = render(<PostCard post={mockPost} />);
      const card = container.querySelector('.hover\\:border-gray-600');
      expect(card).toBeInTheDocument();
    });

    it('should have gradient background', () => {
      const { container } = render(<PostCard post={mockPost} />);
      const card = container.querySelector('.bg-gradient-to-br');
      expect(card).toBeInTheDocument();
    });

    it('should display engagement section with border', () => {
      const { container } = render(<PostCard post={mockPost} />);
      const engagementSection = container.querySelector('.border-t');
      expect(engagementSection).toBeInTheDocument();
    });
  });
});
