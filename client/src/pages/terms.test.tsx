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

    expect(screen.getByText('Last updated: December 2025')).toBeInTheDocument();
  });

  it('should render all terms sections', () => {
    render(<Terms />);

    // Check all section headings
    expect(screen.getByText('1. Acceptance of Terms')).toBeInTheDocument();
    expect(screen.getByText('2. Service Description')).toBeInTheDocument();
    expect(screen.getByText('3. Important Disclaimers')).toBeInTheDocument();
    expect(screen.getByText('4. User Eligibility')).toBeInTheDocument();
    expect(screen.getByText('5. Account Terms')).toBeInTheDocument();
    expect(screen.getByText('6. Prohibited Activities')).toBeInTheDocument();
    expect(screen.getByText('7. Intellectual Property')).toBeInTheDocument();
    expect(screen.getByText('8. Limitation of Liability')).toBeInTheDocument();
    expect(screen.getByText('9. Indemnification')).toBeInTheDocument();
    expect(screen.getByText('10. Termination')).toBeInTheDocument();
    expect(screen.getByText('11. Modifications')).toBeInTheDocument();
    expect(screen.getByText('12. Governing Law & Dispute Resolution')).toBeInTheDocument();
    expect(screen.getByText('13. Severability')).toBeInTheDocument();
    expect(screen.getByText('14. Contact Information')).toBeInTheDocument();
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

  it('should list service description', () => {
    render(<Terms />);

    expect(screen.getByText(/information aggregation platform/)).toBeInTheDocument();
    expect(screen.getByText(/Aggregates and displays publicly available corporate announcements/)).toBeInTheDocument();
    expect(screen.getByText(/Provides tools to filter, sort, and organize/)).toBeInTheDocument();
    expect(screen.getByText(/Offers a curated feed of updates from publicly listed companies/)).toBeInTheDocument();
  });

  it('should include investment disclaimer', () => {
    render(<Terms />);

    expect(screen.getByText(/NOT INVESTMENT ADVICE/)).toBeInTheDocument();
    expect(screen.getByText(/We are NOT SEBI registered investment advisors/)).toBeInTheDocument();
  });

  it('should include data accuracy disclaimer', () => {
    render(<Terms />);

    expect(screen.getByText(/DATA ACCURACY & SOURCE VERIFICATION/)).toBeInTheDocument();
    expect(screen.getByText(/We do NOT guarantee the accuracy, completeness/)).toBeInTheDocument();
  });

  it('should list user eligibility requirements', () => {
    render(<Terms />);

    expect(screen.getByText('Be at least 18 years of age')).toBeInTheDocument();
    expect(screen.getByText('Have the legal capacity to enter into binding agreements')).toBeInTheDocument();
    expect(screen.getByText('Not be prohibited from using the services under applicable laws')).toBeInTheDocument();
  });

  it('should list prohibited activities', () => {
    render(<Terms />);

    expect(screen.getByText(/Use automated tools, bots, or scrapers to access our services/)).toBeInTheDocument();
    expect(screen.getByText(/Redistribute, resell, or commercially exploit our content without permission/)).toBeInTheDocument();
    expect(screen.getByText(/Use our services for any illegal or unauthorized purpose/)).toBeInTheDocument();
  });

  it('should include limitation of liability statement', () => {
    render(<Terms />);

    expect(
      screen.getByText(/TO THE MAXIMUM EXTENT PERMITTED BY LAW/)
    ).toBeInTheDocument();
  });

  it('should apply correct styling to main container', () => {
    const { container } = render(<Terms />);

    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass('bg-background', 'text-foreground', 'py-20');
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

  it('should style section containers with card background', () => {
    const { container } = render(<Terms />);

    const sections = container.querySelectorAll('.bg-card');
    expect(sections.length).toBe(14); // 14 sections

    // Each section should have proper styling
    sections.forEach(section => {
      expect(section).toHaveClass('rounded-2xl', 'p-8', 'shadow-lg', 'border', 'border-border');
    });
  });

  it('should have proper heading hierarchy', () => {
    render(<Terms />);

    // Main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();

    // Section headings
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(14); // 14 sections
  });

  it('should style contact email with brand colors', () => {
    render(<Terms />);

    const emailLink = screen.getByText('investor@investorfeed.in');
    expect(emailLink).toHaveClass('text-primary', 'hover:underline');
  });

  it('should style back button with gradient', () => {
    render(<Terms />);

    const backButton = screen.getByText('Back to Home');
    expect(backButton).toHaveClass(
      'inline-flex',
      'items-center',
      'px-6',
      'py-3',
      'gradient-bg'
    );
  });

  it('should have proper list formatting for service description', () => {
    const { container } = render(<Terms />);

    // Check main lists (not nested ones)
    const mainLists = container.querySelectorAll('ul.list-disc.text-muted-foreground');
    expect(mainLists.length).toBeGreaterThan(0);

    mainLists.forEach(list => {
      expect(list).toHaveClass('font-alata', 'pl-6');
    });
  });

  it('should apply consistent text styling', () => {
    const { container } = render(<Terms />);

    const paragraphs = container.querySelectorAll('p.text-muted-foreground');
    expect(paragraphs.length).toBeGreaterThan(0);

    paragraphs.forEach(p => {
      expect(p).toHaveClass('font-alata');
    });
  });

  it('should have proper spacing between sections', () => {
    const { container } = render(<Terms />);

    const sections = container.querySelectorAll('.mb-8');
    expect(sections.length).toBeGreaterThanOrEqual(14);
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

  it('should have correct title font styling', () => {
    render(<Terms />);

    const title = screen.getByRole('heading', { level: 1 });
    expect(title).toHaveClass('text-4xl', 'lg:text-5xl', 'font-alata', 'text-foreground', 'mb-4');
  });

  it('should style last updated text correctly', () => {
    render(<Terms />);

    const lastUpdated = screen.getByText('Last updated: December 2025');
    expect(lastUpdated).toHaveClass('text-muted-foreground', 'font-alata');
  });

  it('should display governing law information', () => {
    render(<Terms />);

    expect(screen.getByText(/governed by and construed in accordance with the laws of India/)).toBeInTheDocument();
    expect(screen.getByText(/exclusive jurisdiction of the courts in Ahmedabad, Gujarat, India/)).toBeInTheDocument();
  });

  it('should have highlighted disclaimer section', () => {
    const { container } = render(<Terms />);

    // The Important Disclaimers section has a yellow left border
    const highlightedSection = container.querySelector('.border-l-yellow-500');
    expect(highlightedSection).toBeInTheDocument();
  });
});
