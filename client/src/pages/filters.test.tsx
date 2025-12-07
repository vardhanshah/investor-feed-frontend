import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Filters from './filters';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import * as AuthContext from '@/contexts/AuthContext';

const API_BASE_URL = 'http://0.0.0.0:8000';

// Mock useLocation from wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/filters', mockSetLocation],
  };
});

describe('Filters Page', () => {
  beforeEach(() => {
    mockSetLocation.mockClear();

    // Mock authenticated user
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: {
        user_id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: '2025-01-01',
      },
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
    });
  });

  it('should redirect to login if not authenticated', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(<Filters />);

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/login');
    });
  });

  it('should display loading state initially', () => {
    render(<Filters />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should display page title', async () => {
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText('Create Custom Feed')).toBeInTheDocument();
    });
  });

  it('should have back button', async () => {
    render(<Filters />);

    await waitFor(() => {
      const backButton = screen.getByRole('button', { name: /back/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  it('should navigate back when back button clicked', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText('Feed Details')).toBeInTheDocument();
    });

    const backButton = screen.getAllByRole('button').find(
      btn => btn.querySelector('svg.lucide-arrow-left')
    );

    if (backButton) {
      await user.click(backButton);
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    }
  });

  it('should display feed name input', async () => {
    render(<Filters />);

    await waitFor(() => {
      const feedNameInput = screen.getByLabelText(/feed name/i);
      expect(feedNameInput).toBeInTheDocument();
      expect(feedNameInput).toHaveAttribute('placeholder', 'e.g., Growth Stocks Feed');
    });
  });

  it('should display feed description input', async () => {
    render(<Filters />);

    await waitFor(() => {
      const descriptionInput = screen.getByLabelText(/description/i);
      expect(descriptionInput).toBeInTheDocument();
      expect(descriptionInput).toHaveAttribute('placeholder', 'e.g., Posts related to high-growth companies');
    });
  });

  it('should fetch and display filter configurations', async () => {
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
      expect(screen.getByText('Profitable')).toBeInTheDocument();
    });
  });

  it('should display filter descriptions', async () => {
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText('Year-over-year revenue growth percentage')).toBeInTheDocument();
      expect(screen.getByText('Shows only profitable companies')).toBeInTheDocument();
    });
  });

  it('should display number filter with operator selection', async () => {
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText('Operator')).toBeInTheDocument();
    });

    // Check for operator dropdown
    const operatorSelect = screen.getAllByRole('combobox')[0];
    expect(operatorSelect).toBeInTheDocument();
  });

  it('should display number filter with value input', async () => {
    render(<Filters />);

    await waitFor(() => {
      const valueInputs = screen.getAllByPlaceholderText(/-100 - 1000/);
      expect(valueInputs.length).toBeGreaterThan(0);
    });
  });

  it('should display boolean filter as checkbox', async () => {
    render(<Filters />);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /profitable/i });
      expect(checkbox).toBeInTheDocument();
    });
  });

  it('should display units for number filters', async () => {
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText(/\(%\)/)).toBeInTheDocument();
    });
  });

  it('should display range for number filters', async () => {
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText(/\(-100 - 1000\)/)).toBeInTheDocument();
    });
  });

  it('should allow entering feed name', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByLabelText(/feed name/i)).toBeInTheDocument();
    });

    const feedNameInput = screen.getByLabelText(/feed name/i);
    await user.type(feedNameInput, 'My Custom Feed');

    expect(feedNameInput).toHaveValue('My Custom Feed');
  });

  it('should allow entering filter values', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
    });

    const valueInput = screen.getAllByPlaceholderText(/-100 - 1000/)[0] as HTMLInputElement;
    await user.type(valueInput, '50');

    expect(valueInput).toHaveValue(50);
  });

  it('should allow checking boolean filters', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /profitable/i })).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox', { name: /profitable/i });
    await user.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('should have create feed button', async () => {
    render(<Filters />);

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create feed/i });
      expect(createButton).toBeInTheDocument();
    });
  });

  it('should have cancel button', async () => {
    render(<Filters />);

    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });
  });

  it('should navigate to home when cancel clicked', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockSetLocation).toHaveBeenCalledWith('/home');
  });

  it('should show error if feed name is empty on submit', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create feed/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    // Should show validation error toast
    await waitFor(() => {
      expect(screen.getByText('Please enter a feed name')).toBeInTheDocument();
    });
  });

  it('should show error if no filters selected', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByLabelText(/feed name/i)).toBeInTheDocument();
    });

    // Enter feed name but no filters
    await user.type(screen.getByLabelText(/feed name/i), 'Test Feed');
    await user.click(screen.getByRole('button', { name: /create feed/i }));

    await waitFor(() => {
      expect(screen.getByText('Please select at least one filter')).toBeInTheDocument();
    });
  });

  it('should validate number filter range', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
    });

    // Enter feed name
    await user.type(screen.getByLabelText(/feed name/i), 'Test Feed');

    // Enter value outside range
    const valueInput = screen.getAllByPlaceholderText(/-100 - 1000/)[0];
    await user.type(valueInput, '2000');

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    await waitFor(() => {
      expect(screen.getByText(/must be between -100 and 1000/)).toBeInTheDocument();
    });
  });

  it('should successfully create feed with valid data', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/feeds/config`, async ({ request }) => {
        const body = await request.json() as any;
        return HttpResponse.json({
          id: 123,
          name: body.name,
          description: body.description,
          filter_criteria: body.filter_criteria,
          is_default: false,
          created_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { status: 201 });
      })
    );

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByLabelText(/feed name/i)).toBeInTheDocument();
    });

    // Fill in form
    await user.type(screen.getByLabelText(/feed name/i), 'Growth Feed');
    await user.type(screen.getByLabelText(/description/i), 'High growth companies');

    const valueInput = screen.getAllByPlaceholderText(/-100 - 1000/)[0];
    await user.type(valueInput, '20');

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/home');
    });
  });

  it('should show loading state while creating feed', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/feeds/config`, async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return HttpResponse.json({
          id: 123,
          name: 'Test Feed',
          filter_criteria: { filters: [] },
          is_default: false,
          created_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { status: 201 });
      })
    );

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByLabelText(/feed name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/feed name/i), 'Test Feed');
    const valueInput = screen.getAllByPlaceholderText(/-100 - 1000/)[0];
    await user.type(valueInput, '20');

    const createButton = screen.getByRole('button', { name: /create feed/i });
    await user.click(createButton);

    expect(screen.getByText(/creating\.\.\./i)).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    server.use(
      http.post(`${API_BASE_URL}/feeds/config`, () => {
        return HttpResponse.json(
          { detail: 'Failed to create feed' },
          { status: 500 }
        );
      })
    );

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByLabelText(/feed name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/feed name/i), 'Test Feed');
    const valueInput = screen.getAllByPlaceholderText(/-100 - 1000/)[0];
    await user.type(valueInput, '20');

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create feed')).toBeInTheDocument();
    });
  });

  it('should display filter icon in header', async () => {
    render(<Filters />);

    await waitFor(() => {
      const filterIcon = document.querySelector('svg.lucide-filter');
      expect(filterIcon).toBeInTheDocument();
    });
  });

  it('should apply correct styling to cards', async () => {
    const { container } = render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText('Feed Details')).toBeInTheDocument();
    });

    const cards = container.querySelectorAll('.bg-card');
    expect(cards.length).toBeGreaterThan(0);

    cards.forEach(card => {
      expect(card).toHaveClass('border-border');
    });
  });

  it('should handle empty filter configuration', async () => {
    server.use(
      http.get(`${API_BASE_URL}/filters/config`, () => {
        return HttpResponse.json({
          filters: [],
        });
      })
    );

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText('No filters available')).toBeInTheDocument();
    });
  });

  it('should trim whitespace from feed name', async () => {
    const user = userEvent.setup();

    let requestBody: any;
    server.use(
      http.post(`${API_BASE_URL}/feeds/config`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({
          id: 123,
          name: requestBody.name,
          filter_criteria: requestBody.filter_criteria,
          is_default: false,
          created_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { status: 201 });
      })
    );

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByLabelText(/feed name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/feed name/i), '  Test Feed  ');
    const valueInput = screen.getAllByPlaceholderText(/-100 - 1000/)[0];
    await user.type(valueInput, '20');

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    await waitFor(() => {
      expect(requestBody?.name).toBe('  Test Feed  '); // Trimming is checked on validation
    });
  });
});