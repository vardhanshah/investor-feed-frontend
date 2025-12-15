import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils';
import { userEvent } from '@testing-library/user-event';
import CompanyConfidence from './CompanyConfidence';
import * as api from '@/lib/api';
import type { ProfileConfidence } from '@/lib/api';

// Mock the API
vi.mock('@/lib/api', () => ({
  confidenceApi: {
    vote: vi.fn(),
  },
}));

const mockConfidenceWithVotes: ProfileConfidence = {
  yes_percentage: 67,
  no_percentage: 33,
  total_votes: 3,
  user_vote: 'yes',
};

const mockConfidenceNoUserVote: ProfileConfidence = {
  yes_percentage: 50,
  no_percentage: 50,
  total_votes: 2,
  user_vote: null,
};

const mockConfidenceNoVotes: ProfileConfidence = {
  yes_percentage: null,
  no_percentage: null,
  total_votes: 0,
  user_vote: null,
};

describe('CompanyConfidence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render Yes and No buttons', () => {
      const { container } = render(<CompanyConfidence profileId={1} confidence={null} />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0]).toHaveTextContent('Yes');
      expect(buttons[1]).toHaveTextContent('No');
    });

    it('should not show percentage when user has not voted', () => {
      const { container } = render(<CompanyConfidence profileId={1} confidence={mockConfidenceNoUserVote} />);
      // Check that there's no standalone percentage displayed (before buttons)
      const percentageSpan = container.querySelector('span.font-bold');
      expect(percentageSpan).not.toBeInTheDocument();
    });

    it('should show user vote percentage when user voted yes', () => {
      const { container } = render(<CompanyConfidence profileId={1} confidence={mockConfidenceWithVotes} />);
      const percentageSpan = container.querySelector('span.font-bold.text-green-500');
      expect(percentageSpan).toBeInTheDocument();
      expect(percentageSpan).toHaveTextContent('67%');
    });

    it('should show user vote percentage when user voted no', () => {
      const confidenceNoVote: ProfileConfidence = {
        yes_percentage: 33,
        no_percentage: 67,
        total_votes: 3,
        user_vote: 'no',
      };
      const { container } = render(<CompanyConfidence profileId={1} confidence={confidenceNoVote} />);
      const percentageSpan = container.querySelector('span.font-bold.text-red-500');
      expect(percentageSpan).toBeInTheDocument();
      expect(percentageSpan).toHaveTextContent('67%');
    });

    it('should show total votes when votes exist', () => {
      render(<CompanyConfidence profileId={1} confidence={mockConfidenceWithVotes} />);
      expect(screen.getByText('Total Votes: 3')).toBeInTheDocument();
    });

    it('should not show total votes when no votes exist', () => {
      render(<CompanyConfidence profileId={1} confidence={mockConfidenceNoVotes} />);
      expect(screen.queryByText(/Total Votes:/)).not.toBeInTheDocument();
    });
  });

  describe('User Vote Highlighting', () => {
    it('should highlight Yes button when user voted yes', () => {
      const { container } = render(
        <CompanyConfidence profileId={1} confidence={mockConfidenceWithVotes} />
      );
      const buttons = container.querySelectorAll('button');
      const yesButton = buttons[0];
      expect(yesButton?.className).toContain('text-green-500');
      expect(yesButton?.className).toContain('bg-green-500/20');
    });

    it('should highlight No button when user voted no', () => {
      const confidenceWithNoVote: ProfileConfidence = {
        ...mockConfidenceWithVotes,
        user_vote: 'no',
      };
      const { container } = render(
        <CompanyConfidence profileId={1} confidence={confidenceWithNoVote} />
      );
      const buttons = container.querySelectorAll('button');
      const noButton = buttons[1];
      expect(noButton?.className).toContain('text-red-500');
      expect(noButton?.className).toContain('bg-red-500/20');
    });

    it('should not highlight either button when user has not voted', () => {
      const { container } = render(
        <CompanyConfidence profileId={1} confidence={mockConfidenceNoUserVote} />
      );
      const buttons = container.querySelectorAll('button');
      const yesButton = buttons[0];
      const noButton = buttons[1];
      // Check for the active (non-hover) highlight classes
      expect(yesButton?.className).not.toContain('bg-green-500/20');
      expect(noButton?.className).not.toContain('bg-red-500/20');
    });

    it('should show green percentage when user voted yes', () => {
      const { container } = render(<CompanyConfidence profileId={1} confidence={mockConfidenceWithVotes} />);
      const percentageSpan = container.querySelector('span.font-bold.text-green-500');
      expect(percentageSpan).toBeInTheDocument();
      expect(percentageSpan?.className).toContain('text-green-500');
    });

    it('should show red percentage when user voted no', () => {
      const confidenceWithNoVote: ProfileConfidence = {
        yes_percentage: 33,
        no_percentage: 67,
        total_votes: 3,
        user_vote: 'no',
      };
      const { container } = render(<CompanyConfidence profileId={1} confidence={confidenceWithNoVote} />);
      const percentageSpan = container.querySelector('span.font-bold.text-red-500');
      expect(percentageSpan).toBeInTheDocument();
      expect(percentageSpan?.className).toContain('text-red-500');
    });
  });

  describe('Voting Functionality', () => {
    it('should call vote API when YES button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(api.confidenceApi.vote).mockResolvedValueOnce({
        message: 'Vote recorded',
        profile_id: 1,
        vote: 'yes',
        yes_percentage: 67,
        no_percentage: 33,
        total_votes: 1,
      });

      render(<CompanyConfidence profileId={1} confidence={null} />);

      const yesButton = screen.getByRole('button', { name: /yes/i });
      await user.click(yesButton);

      await waitFor(() => {
        expect(api.confidenceApi.vote).toHaveBeenCalledWith(1, 'yes');
      });
    });

    it('should call vote API when NO button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(api.confidenceApi.vote).mockResolvedValueOnce({
        message: 'Vote recorded',
        profile_id: 1,
        vote: 'no',
        yes_percentage: 33,
        no_percentage: 67,
        total_votes: 1,
      });

      render(<CompanyConfidence profileId={1} confidence={null} />);

      const noButton = screen.getByRole('button', { name: /no/i });
      await user.click(noButton);

      await waitFor(() => {
        expect(api.confidenceApi.vote).toHaveBeenCalledWith(1, 'no');
      });
    });

    it('should update UI optimistically when voting', async () => {
      const user = userEvent.setup();
      vi.mocked(api.confidenceApi.vote).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          message: 'Vote recorded',
          profile_id: 1,
          vote: 'yes',
          yes_percentage: 100,
          no_percentage: 0,
          total_votes: 1,
        }), 100))
      );

      const { container } = render(<CompanyConfidence profileId={1} confidence={null} />);

      const buttons = container.querySelectorAll('button');
      const yesButton = buttons[0];
      await user.click(yesButton);

      // Check optimistic update shows immediately - percentage should be displayed
      const percentageSpan = container.querySelector('span.font-bold.text-green-500');
      expect(percentageSpan).toBeInTheDocument();
      expect(percentageSpan).toHaveTextContent('100%');
    });

    it('should call onVoteSuccess callback after successful vote', async () => {
      const user = userEvent.setup();
      const onVoteSuccess = vi.fn();
      vi.mocked(api.confidenceApi.vote).mockResolvedValueOnce({
        message: 'Vote recorded',
        profile_id: 1,
        vote: 'yes',
        yes_percentage: 67,
        no_percentage: 33,
        total_votes: 3,
      });

      render(
        <CompanyConfidence
          profileId={1}
          confidence={null}
          onVoteSuccess={onVoteSuccess}
        />
      );

      const yesButton = screen.getByRole('button', { name: /yes/i });
      await user.click(yesButton);

      await waitFor(() => {
        expect(onVoteSuccess).toHaveBeenCalledWith({
          yes_percentage: 67,
          no_percentage: 33,
          total_votes: 3,
          user_vote: 'yes',
        });
      });
    });

    it('should allow changing vote from YES to NO', async () => {
      const user = userEvent.setup();
      vi.mocked(api.confidenceApi.vote).mockResolvedValueOnce({
        message: 'Vote changed',
        profile_id: 1,
        vote: 'no',
        yes_percentage: 33,
        no_percentage: 67,
        total_votes: 3,
      });

      render(<CompanyConfidence profileId={1} confidence={mockConfidenceWithVotes} />);

      const noButton = screen.getByRole('button', { name: /no/i });
      await user.click(noButton);

      await waitFor(() => {
        expect(api.confidenceApi.vote).toHaveBeenCalledWith(1, 'no');
      });
    });

    it('should not call API when clicking same vote again', async () => {
      const user = userEvent.setup();

      render(<CompanyConfidence profileId={1} confidence={mockConfidenceWithVotes} />);

      // User already voted yes, clicking yes again should do nothing
      const yesButton = screen.getByRole('button', { name: /yes/i });
      await user.click(yesButton);

      expect(api.confidenceApi.vote).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should revert optimistic update on API error', async () => {
      const user = userEvent.setup();
      vi.mocked(api.confidenceApi.vote).mockRejectedValueOnce(new Error('Network error'));

      render(<CompanyConfidence profileId={1} confidence={mockConfidenceNoUserVote} />);

      const yesButton = screen.getByRole('button', { name: /yes/i });
      await user.click(yesButton);

      // Should revert to original state
      await waitFor(() => {
        // Original state had 50% each
        const percentages = screen.getAllByText('50%');
        expect(percentages.length).toBe(2);
      });
    });
  });

  describe('Loading State', () => {
    it('should disable buttons while voting', async () => {
      const user = userEvent.setup();
      vi.mocked(api.confidenceApi.vote).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          message: 'Vote recorded',
          profile_id: 1,
          vote: 'yes',
          yes_percentage: 100,
          no_percentage: 0,
          total_votes: 1,
        }), 100))
      );

      render(<CompanyConfidence profileId={1} confidence={null} />);

      const yesButton = screen.getByRole('button', { name: /yes/i });
      const noButton = screen.getByRole('button', { name: /no/i });
      await user.click(yesButton);

      // Only the confidence buttons should be disabled during voting
      expect(yesButton).toBeDisabled();
      expect(noButton).toBeDisabled();
    });

    it('should prevent double-click while loading', async () => {
      const user = userEvent.setup();
      vi.mocked(api.confidenceApi.vote).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          message: 'Vote recorded',
          profile_id: 1,
          vote: 'yes',
          yes_percentage: 100,
          no_percentage: 0,
          total_votes: 1,
        }), 100))
      );

      render(<CompanyConfidence profileId={1} confidence={null} />);

      const yesButton = screen.getByRole('button', { name: /yes/i });

      // Click multiple times rapidly
      await user.click(yesButton);
      await user.click(yesButton);
      await user.click(yesButton);

      // API should only be called once
      await waitFor(() => {
        expect(api.confidenceApi.vote).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Event Propagation', () => {
    it('should stop click propagation on container', async () => {
      const parentClickHandler = vi.fn();

      const { container } = render(
        <div onClick={parentClickHandler}>
          <CompanyConfidence profileId={1} confidence={null} />
        </div>
      );

      const confidenceContainer = container.querySelector('.flex.flex-col');
      if (confidenceContainer) {
        await userEvent.click(confidenceContainer as HTMLElement);
      }

      expect(parentClickHandler).not.toHaveBeenCalled();
    });

    it('should stop click propagation on YES button', async () => {
      const user = userEvent.setup();
      const parentClickHandler = vi.fn();
      vi.mocked(api.confidenceApi.vote).mockResolvedValueOnce({
        message: 'Vote recorded',
        profile_id: 1,
        vote: 'yes',
        yes_percentage: 100,
        no_percentage: 0,
        total_votes: 1,
      });

      render(
        <div onClick={parentClickHandler}>
          <CompanyConfidence profileId={1} confidence={null} />
        </div>
      );

      const yesButton = screen.getByRole('button', { name: /yes/i });
      await user.click(yesButton);

      expect(parentClickHandler).not.toHaveBeenCalled();
    });

    it('should stop click propagation on NO button', async () => {
      const user = userEvent.setup();
      const parentClickHandler = vi.fn();
      vi.mocked(api.confidenceApi.vote).mockResolvedValueOnce({
        message: 'Vote recorded',
        profile_id: 1,
        vote: 'no',
        yes_percentage: 0,
        no_percentage: 100,
        total_votes: 1,
      });

      render(
        <div onClick={parentClickHandler}>
          <CompanyConfidence profileId={1} confidence={null} />
        </div>
      );

      const noButton = screen.getByRole('button', { name: /no/i });
      await user.click(noButton);

      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Size Variants', () => {
    it('should render small size by default', () => {
      const { container } = render(
        <CompanyConfidence profileId={1} confidence={mockConfidenceWithVotes} />
      );
      const percentageSpan = container.querySelector('span.font-bold.text-green-500');
      expect(percentageSpan?.className).toContain('text-sm');
    });

    it('should render medium size when specified', () => {
      const { container } = render(
        <CompanyConfidence profileId={1} confidence={mockConfidenceWithVotes} size="md" />
      );
      const percentageSpan = container.querySelector('span.font-bold.text-green-500');
      expect(percentageSpan?.className).toContain('text-base');
    });
  });
});
