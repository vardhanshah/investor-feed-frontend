import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import NotFound from './not-found';

describe('NotFound Page', () => {
  it('should render 404 page with correct title', () => {
    render(<NotFound />);

    expect(screen.getByText('404 Page Not Found')).toBeInTheDocument();
  });

  it('should display error icon', () => {
    const { container } = render(<NotFound />);

    // Check for AlertCircle icon
    const icon = container.querySelector('svg.text-red-500');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-8', 'w-8', 'text-red-500');
  });

  it('should show helpful message', () => {
    render(<NotFound />);

    expect(
      screen.getByText('Did you forget to add the page to the router?')
    ).toBeInTheDocument();
  });

  it('should render within a Card component', () => {
    const { container } = render(<NotFound />);

    // Check for Card structure
    const card = container.querySelector('[class*="rounded-lg"][class*="border"]');
    expect(card).toBeInTheDocument();
  });

  it('should have correct layout classes', () => {
    const { container } = render(<NotFound />);

    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveClass('w-full', 'flex', 'items-center', 'justify-center');
  });

  it('should apply correct styling to title', () => {
    render(<NotFound />);

    const title = screen.getByText('404 Page Not Found');
    expect(title).toHaveClass('text-2xl', 'font-bold', 'text-foreground');
  });

  it('should apply correct styling to message', () => {
    render(<NotFound />);

    const message = screen.getByText('Did you forget to add the page to the router?');
    expect(message).toHaveClass('text-sm', 'text-muted-foreground');
  });

  it('should have proper responsive width constraints', () => {
    const { container } = render(<NotFound />);

    const card = container.querySelector('.max-w-md');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('w-full', 'mx-4');
  });

  it('should display icon and title in flex layout', () => {
    const { container } = render(<NotFound />);

    const flexContainer = container.querySelector('.flex.gap-2');
    expect(flexContainer).toBeInTheDocument();

    // Check both icon and title are children
    const icon = flexContainer?.querySelector('svg');
    const title = flexContainer?.querySelector('h1');

    expect(icon).toBeInTheDocument();
    expect(title).toBeInTheDocument();
  });

  it('should have correct icon dimensions', () => {
    const { container } = render(<NotFound />);

    const icon = container.querySelector('svg');
    expect(icon).toHaveClass('h-8', 'w-8');
  });

  it('should apply background color to page', () => {
    const { container } = render(<NotFound />);

    const wrapper = container.querySelector('.bg-background');
    expect(wrapper).toBeInTheDocument();
  });

  it('should have correct card content padding', () => {
    const { container } = render(<NotFound />);

    const cardContent = container.querySelector('.pt-6');
    expect(cardContent).toBeInTheDocument();
  });

  it('should maintain semantic HTML structure', () => {
    render(<NotFound />);

    // Check for heading element
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('404 Page Not Found');

    // Check for paragraph element
    const paragraph = screen.getByText('Did you forget to add the page to the router?');
    expect(paragraph.tagName).toBe('P');
  });

  it('should have proper margin between elements', () => {
    const { container } = render(<NotFound />);

    // Check for margin on flex container
    const flexContainer = container.querySelector('.mb-4');
    expect(flexContainer).toBeInTheDocument();

    // Check for margin on paragraph
    const paragraph = container.querySelector('.mt-4');
    expect(paragraph).toBeInTheDocument();
  });

  it('should be accessible with proper color contrast', () => {
    render(<NotFound />);

    // Title should have high contrast
    const title = screen.getByText('404 Page Not Found');
    expect(title).toHaveClass('text-foreground');

    // Message should have readable contrast
    const message = screen.getByText('Did you forget to add the page to the router?');
    expect(message).toHaveClass('text-muted-foreground');
  });
});