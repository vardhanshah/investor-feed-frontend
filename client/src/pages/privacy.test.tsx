import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import Privacy from './privacy';

describe('Privacy Page', () => {
  it('should render privacy policy title', () => {
    render(<Privacy />);

    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Policy')).toBeInTheDocument();
  });

  it('should display last updated date', () => {
    render(<Privacy />);

    expect(screen.getByText('Last updated: December 2025')).toBeInTheDocument();
  });

  it('should render all privacy policy sections', () => {
    render(<Privacy />);

    // Check all section headings
    expect(screen.getByText('1. Information We Collect')).toBeInTheDocument();
    expect(screen.getByText('2. How We Use Your Information')).toBeInTheDocument();
    expect(screen.getByText('3. Information Sharing')).toBeInTheDocument();
    expect(screen.getByText('4. Third-Party Services')).toBeInTheDocument();
    expect(screen.getByText('5. Cookies & Sessions')).toBeInTheDocument();
    expect(screen.getByText('6. Data Retention')).toBeInTheDocument();
    expect(screen.getByText('7. Data Security')).toBeInTheDocument();
    expect(screen.getByText('8. Your Rights')).toBeInTheDocument();
    expect(screen.getByText('9. Changes to This Policy')).toBeInTheDocument();
    expect(screen.getByText('10. Contact Us')).toBeInTheDocument();
  });

  it('should have a back to home link', () => {
    render(<Privacy />);

    const backLink = screen.getByText('Back to Home');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should display contact email', () => {
    render(<Privacy />);

    const emailLink = screen.getByText('investor@investorfeed.in');
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:investor@investorfeed.in');
  });

  it('should list account information collected', () => {
    render(<Privacy />);

    expect(screen.getByText('Account Information')).toBeInTheDocument();
    expect(screen.getByText('Email address')).toBeInTheDocument();
    expect(screen.getByText('First name and last name')).toBeInTheDocument();
    expect(screen.getByText('Profile picture (if provided via OAuth)')).toBeInTheDocument();
  });

  it('should list data usage purposes', () => {
    render(<Privacy />);

    expect(screen.getByText('Create and manage your account')).toBeInTheDocument();
    expect(screen.getByText('Provide access to our filtering and sorting tools')).toBeInTheDocument();
    expect(screen.getByText('Authenticate your identity when you log in')).toBeInTheDocument();
    expect(screen.getByText('Send important service-related communications')).toBeInTheDocument();
    expect(screen.getByText('Improve our website and services')).toBeInTheDocument();
    expect(screen.getByText('Comply with legal obligations')).toBeInTheDocument();
  });

  it('should state information sharing policy', () => {
    render(<Privacy />);

    // The text has "NOT" inside a <strong> tag, so we search for parts of it
    expect(screen.getByText(/sell, trade, or rent your personal information/)).toBeInTheDocument();
  });

  it('should list third-party services', () => {
    render(<Privacy />);

    expect(screen.getByText(/Google:/)).toBeInTheDocument();
    expect(screen.getByText(/Twitter\/X:/)).toBeInTheDocument();
    expect(screen.getByText(/Razorpay:/)).toBeInTheDocument();
  });

  it('should list user rights', () => {
    render(<Privacy />);

    expect(screen.getByText('Access your personal information we hold')).toBeInTheDocument();
    expect(screen.getByText('Request correction of inaccurate data')).toBeInTheDocument();
    expect(screen.getByText('Request deletion of your account and data')).toBeInTheDocument();
    expect(screen.getByText('Withdraw consent where applicable')).toBeInTheDocument();
    expect(screen.getByText('File complaints with relevant data protection authorities')).toBeInTheDocument();
  });

  it('should mention cookie usage', () => {
    render(<Privacy />);

    expect(screen.getByText(/We use essential cookies and session storage/)).toBeInTheDocument();
  });

  it('should apply correct styling to main container', () => {
    const { container } = render(<Privacy />);

    const mainDiv = container.querySelector('.min-h-screen');
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass('bg-background', 'text-white', 'py-20');
  });

  it('should have responsive container width', () => {
    const { container } = render(<Privacy />);

    const contentContainer = container.querySelector('.max-w-4xl');
    expect(contentContainer).toBeInTheDocument();
    expect(contentContainer).toHaveClass('mx-auto', 'px-4');
  });

  it('should apply gradient text effect to "Policy"', () => {
    const { container } = render(<Privacy />);

    const gradientText = container.querySelector('.gradient-text');
    expect(gradientText).toBeInTheDocument();
    expect(gradientText).toHaveTextContent('Policy');
  });

  it('should style section containers with gradient background', () => {
    const { container } = render(<Privacy />);

    const sections = container.querySelectorAll('.bg-gradient-to-br.from-gray-900.to-black');
    expect(sections.length).toBe(10); // 10 sections

    // Each section should have proper styling
    sections.forEach(section => {
      expect(section).toHaveClass('rounded-2xl', 'p-8', 'shadow-lg', 'border', 'border-gray-700');
    });
  });

  it('should have proper heading hierarchy', () => {
    render(<Privacy />);

    // Main heading
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();

    // Section headings
    const sectionHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(sectionHeadings).toHaveLength(10); // 10 sections
  });

  it('should style contact email with brand colors', () => {
    render(<Privacy />);

    const emailLink = screen.getByText('investor@investorfeed.in');
    expect(emailLink).toHaveClass('text-[hsl(280,100%,70%)]', 'hover:underline');
  });

  it('should style back button with gradient', () => {
    render(<Privacy />);

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

  it('should have proper list formatting', () => {
    const { container } = render(<Privacy />);

    const lists = container.querySelectorAll('ul.list-disc');
    expect(lists.length).toBeGreaterThan(0);

    lists.forEach(list => {
      expect(list).toHaveClass('text-gray-300', 'font-alata', 'mb-4', 'pl-6');
    });
  });

  it('should apply consistent text styling', () => {
    const { container } = render(<Privacy />);

    const paragraphs = container.querySelectorAll('p.text-gray-300');
    expect(paragraphs.length).toBeGreaterThan(0);

    paragraphs.forEach(p => {
      expect(p).toHaveClass('font-alata');
    });
  });

  it('should have proper spacing between sections', () => {
    const { container } = render(<Privacy />);

    const sections = container.querySelectorAll('.mb-8');
    expect(sections.length).toBe(10);
  });

  it('should center align the title section', () => {
    const { container } = render(<Privacy />);

    const titleSection = container.querySelector('.text-center.mb-12');
    expect(titleSection).toBeInTheDocument();
  });

  it('should center align the footer section', () => {
    const { container } = render(<Privacy />);

    const footerSection = container.querySelector('.text-center.mt-12');
    expect(footerSection).toBeInTheDocument();
  });

  it('should list data security measures', () => {
    render(<Privacy />);

    expect(screen.getByText('Encrypted data transmission (HTTPS)')).toBeInTheDocument();
    expect(screen.getByText('Secure password storage using industry-standard hashing')).toBeInTheDocument();
    expect(screen.getByText('Regular security assessments')).toBeInTheDocument();
  });

  it('should explain data retention', () => {
    render(<Privacy />);

    expect(screen.getByText(/Account data:/)).toBeInTheDocument();
    expect(screen.getByText(/Session data:/)).toBeInTheDocument();
  });
});
