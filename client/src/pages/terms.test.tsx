import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import Terms from './terms';

describe('Terms Page', () => {
  it('should render terms of service title', () => {
    render(<Terms />);

    expect(screen.getByText('Terms of')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('should display last updated date', () => {
    render(<Terms />);

    expect(screen.getByText('Last updated: January 2025')).toBeInTheDocument();
  });

  it('should render all terms sections', () => {
    render(<Terms />);

    // Check all section headings
    expect(screen.getByText('1. Acceptance of Terms')).toBeInTheDocument();
    expect(screen.getByText('2. Service Description')).toBeInTheDocument();
    expect(screen.getByText('3. Disclaimer')).toBeInTheDocument();
    expect(screen.getByText('4. User Responsibilities')).toBeInTheDocument();
    expect(screen.getByText('5. Limitation of Liability')).toBeInTheDocument();
    expect(screen.getByText('6. Contact Information')).toBeInTheDocument();
  });

  it('should have a back to home link', () => {
    render(<Terms />);

    const backLink = screen.getByText('Back to Home');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should display contact email', () => {
    render(<Terms />);

    const emailLink = screen.getByText('investor@investorfeed.in');
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:investor@investorfeed.in');
  });

  it('should describe acceptance terms', () => {
    render(<Terms />);

    expect(
      screen.getByText(/By accessing and using Investor Feed's services/)
    ).toBeInTheDocument();
  });

  it('should list service offerings', () => {
    render(<Terms />);

    expect(screen.getByText('Real-time market intelligence updates')).toBeInTheDocument();
    expect(screen.getByText('Analysis of Indian Stock Exchange announcements')).toBeInTheDocument();
    expect(screen.getByText('Financial insights and commentary')).toBeInTheDocument();
    expect(screen.getByText('Investment-related educational content')).toBeInTheDocument();
  });

  it('should display Twitter handle', () => {
    render(<Terms />);

    expect(screen.getByText(/\(@_Investor_Feed_\)/)).toBeInTheDocument();
  });

  it('should include investment disclaimer', () => {
    render(<Terms />);

    expect(screen.getByText(/This is NOT investment advice/)).toBeInTheDocument();
    expect(screen.getByText(/we are NOT SEBI registered investment advisors/)).toBeInTheDocument();
  });

  it('should advise consulting financial professionals', () => {
    render(<Terms />);

    expect(
      screen.getByText(/You should consult with qualified financial professionals/)
    ).toBeInTheDocument();
  });

  it('should list user responsibilities', () => {
    render(<Terms />);

    expect(screen.getByText('Use our content responsibly and at their own risk')).toBeInTheDocument();
    expect(screen.getByText('Not redistribute our content without permission')).toBeInTheDocument();
    expect(screen.getByText('Respect intellectual property rights')).toBeInTheDocument();
    expect(screen.getByText('Follow applicable laws and regulations')).toBeInTheDocument();
  });

  it('should include limitation of liability statement', () => {
    render(<Terms />);

    expect(
      screen.getByText(/Investor Feed shall not be liable for any direct, indirect/)
    ).toBeInTheDocument();
  });

  it('should apply correct styling to main container', () => {
    const { container } = render(<Terms />);

    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass('bg-background', 'text-white', 'py-20');
  });

  it('should have responsive container width', () => {
    const { container } = render(<Terms />);

    const contentContainer = container.querySelector('.max-w-4xl');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('mx-auto', 'px-4');
  });

  it('should apply gradient text effect to "Service"', () => {
    const { container } = render(<Terms />);

    const gradientText = container.querySelector('.gradient-text');
    expect(gradientText).toBeInTheDocument();
    expect(gradientText).toHaveTextContent('Service');
  });

  it('should style section containers with gradient background', () => {
    const { container } = render(<Terms />);

    const sections = container.querySelectorAll('.bg-gradient-to-br.from-gray-900.to-black');
    expect(sections.length).toBe(6); // 6 sections

    // Each section should have proper styling
    sections.forEach(section => {
      expect(section).toHaveClass('rounded-2xl', 'p-8', 'shadow-lg', 'border', 'border-gray-700');
    });
  });

  it('should have proper heading hierarchy', () => {
    render(<Terms />);

    // Main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();

    // Section headings
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(6); // 6 sections
  });

  it('should style contact email with brand colors', () => {
    render(<Terms />);

    const emailLink = screen.getByText('investor@investorfeed.in');
    expect(emailLink).toHaveClass('text-[hsl(280,100%,70%)]', 'hover:underline');
  });

  it('should style back button with gradient', () => {
    render(<Terms />);

    const backButton = screen.getByText('Back to Home');
    expect(backButton).toHaveClass(
      'inline-flex',
      'items-center',
      'px-6',
      'py-3',
      'bg-gradient-to-r',
      'from-[hsl(280,100%,70%)]',
      'to-[hsl(200,100%,70%)]'
    );
  });

  it('should have proper list formatting for service description', () => {
    const { container } = render(<Terms />);

    const lists = container.querySelectorAll('ul.list-disc');
    expect(lists.length).toBeGreaterThan(0);

    lists.forEach(list => {
      expect(list).toHaveClass('text-gray-300', 'font-alata', 'mb-4', 'pl-6');
    });
  });

  it('should apply consistent text styling', () => {
    const { container } = render(<Terms />);

    const paragraphs = container.querySelectorAll('p.text-gray-300');
    expect(paragraphs.length).toBeGreaterThan(0);

    paragraphs.forEach(p => {
      expect(p).toHaveClass('font-alata');
    });
  });

  it('should have proper spacing between sections', () => {
    const { container } = render(<Terms />);

    const sections = container.querySelectorAll('.mb-8');
    expect(sections.length).toBe(6);
  });

  it('should center align the title section', () => {
    const { container } = render(<Terms />);

    const titleSection = container.querySelector('.text-center.mb-12');
    expect(titleSection).toBeInTheDocument();
  });

  it('should center align the footer section', () => {
    const { container } = render(<Terms />);

    const footerSection = container.querySelector('.text-center.mt-12');
    expect(footerSection).toBeInTheDocument();
  });

  it('should emphasize important disclaimer text', () => {
    render(<Terms />);

    const importantText = screen.getByText('Important:');
    expect(importantText.tagName).toBe('STRONG');
  });

  it('should mention past performance disclaimer', () => {
    render(<Terms />);

    expect(
      screen.getByText(/Past performance does not guarantee future results/)
    ).toBeInTheDocument();
  });

  it('should have correct title font styling', () => {
    render(<Terms />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-4xl', 'lg:text-5xl', 'font-alata', 'text-white', 'mb-4');
  });

  it('should style last updated text correctly', () => {
    render(<Terms />);

    const lastUpdated = screen.getByText('Last updated: January 2025');
    expect(lastUpdated).toHaveClass('text-gray-400', 'font-alata');
  });
});