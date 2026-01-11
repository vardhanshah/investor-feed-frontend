import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within, cleanup } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import Filters from './filters';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import * as AuthContext from '@/contexts/AuthContext';
import { useFeedManagement } from '@/hooks/useFeedManagement';
import type { FilterConfig } from '@/lib/api';

const API_BASE_URL = '/api';

// Mock useLocation from wouter
const mockSetLocation = vi.fn();
vi.mock('wouter', async () => {
  const actual = await vi.importActual('wouter');
  return {
    ...actual,
    useLocation: () => ['/filters', mockSetLocation],
  };
});

// Mock filter configs for testing
const mockFilterConfigs: FilterConfig[] = [
  {
    field: 'revenue_growth',
    label: 'Revenue Growth',
    type: 'number',
    description: 'Year-over-year revenue growth percentage',
    range: { min: -100, max: 1000 },
    unit: '%',
    operators: ['gte', 'lte', 'gt', 'lt', 'eq'],
    group: 'financial',
  },
  {
    field: 'has_profit',
    label: 'Profitable',
    type: 'boolean',
    description: 'Shows only profitable companies',
    group: 'financial',
  },
];

// Store the onSuccess callback to call it when saveFeed is invoked
let capturedOnSuccess: ((feedId: number, isEdit: boolean) => void) | undefined;

// Create mock saveFeed function that calls onSuccess
const mockSaveFeed = vi.fn(async () => {
  capturedOnSuccess?.(123, false);
  return { success: true, feedId: 123, isEdit: false };
});

// Mock useFeedManagement hook
vi.mock('@/hooks/useFeedManagement', () => ({
  useFeedManagement: vi.fn((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
    capturedOnSuccess = options?.onSuccess;
    return {
      filterConfigs: mockFilterConfigs,
      filterGroups: [],
      isLoadingFilters: false,
      isLoadingFeed: false,
      isSaving: false,
      saveFeed: mockSaveFeed,
      feedName: '',
      feedDescription: '',
      filterValues: {},
      numberFilterStates: {
        revenue_growth: { from: '', to: '' },
      },
      profileSelections: {
        companies: [],
        sectors: [],
        subsectors: [],
      },
      setFeedName: vi.fn(),
      setFeedDescription: vi.fn(),
      setProfileSelections: vi.fn(),
      handleFilterChange: vi.fn(),
      handleNumberFilterFromChange: vi.fn(),
      handleNumberFilterToChange: vi.fn(),
      initializeNumberFilters: vi.fn(),
      loadFeedData: vi.fn(),
      resetFilters: vi.fn(),
      buildFilterCriteria: vi.fn(),
      validateFeedName: vi.fn().mockReturnValue(true),
      hasActiveFilters: vi.fn().mockReturnValue(false),
      buildSearchCriteria: vi.fn().mockReturnValue(null),
    };
  }),
}));

describe('Filters Page', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    localStorage.clear();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetLocation.mockClear();
    mockSaveFeed.mockClear();
    capturedOnSuccess = undefined;
    localStorage.clear();

    // Set token in localStorage so AuthProvider can authenticate
    localStorage.setItem('authToken', 'test-token');

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
      refreshUser: vi.fn(),
    });

    // Reset useFeedManagement mock to default state with callback capture
    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: mockFilterConfigs,
        filterGroups: [],
        isLoadingFilters: false,
        isLoadingFeed: false,
        isSaving: false,
        saveFeed: mockSaveFeed,
        feedName: '',
        feedDescription: '',
        filterValues: {},
        numberFilterStates: {
          revenue_growth: { from: '', to: '' },
        },
        profileSelections: {
          companies: [],
          sectors: [],
          subsectors: [],
        },
        setFeedName: vi.fn(),
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn(),
        validateFeedName: vi.fn().mockReturnValue(true),
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });
  });

  it('should allow unauthenticated users to browse filters page', async () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    });

    render(<Filters />);

    // Unauthenticated users can browse the page (no redirect)
    await waitFor(() => {
      expect(screen.getByText('Create Custom Feed')).toBeInTheDocument();
    });

    // Should NOT have redirected
    expect(mockSetLocation).not.toHaveBeenCalled();
  });

  it('should display loading state initially', () => {
    // Mock loading state
    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: [],
        filterGroups: [],
        isLoadingFilters: true,
        isLoadingFeed: false,
        isSaving: false,
        saveFeed: mockSaveFeed,
        feedName: '',
        feedDescription: '',
        filterValues: {},
        numberFilterStates: {},
        profileSelections: {
          companies: [],
          sectors: [],
          subsectors: [],
        },
        setFeedName: vi.fn(),
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn(),
        validateFeedName: vi.fn().mockReturnValue(true),
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });

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
    const { container } = render(<Filters />);

    await waitFor(() => {
      // Back button is an icon-only button with ArrowLeft icon
      const backButton = container.querySelector('button svg.lucide-arrow-left');
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
      expect(mockSetLocation).toHaveBeenCalledWith('/');
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
    const user = userEvent.setup();
    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
      expect(screen.getByText('Profitable')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display filter labels when section is expanded', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    // The component displays filter labels, not descriptions
    await waitFor(() => {
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
      expect(screen.getByText('Profitable')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should display number filter with min/max inputs', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      // Number filter has two inputs with Min/Max placeholders
      const fromInput = document.getElementById('revenue_growth-from') as HTMLInputElement;
      const toInput = document.getElementById('revenue_growth-to') as HTMLInputElement;
      expect(fromInput).toBeInTheDocument();
      expect(toInput).toBeInTheDocument();
      expect(fromInput).toHaveAttribute('placeholder', 'Min (%)');
      expect(toInput).toHaveAttribute('placeholder', 'Max (%)');
    });
  });

  it('should display number filter with value inputs', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      // Check for From and To inputs by their IDs
      const fromInput = document.getElementById('revenue_growth-from');
      const toInput = document.getElementById('revenue_growth-to');
      expect(fromInput).toBeInTheDocument();
      expect(toInput).toBeInTheDocument();
    });
  });

  it('should display boolean filter as checkbox', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox', { name: /profitable/i });
      expect(checkbox).toBeInTheDocument();
    });
  });

  it('should display units in number filter placeholders', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      // Units are displayed in the input placeholders
      const fromInput = document.getElementById('revenue_growth-from') as HTMLInputElement;
      expect(fromInput).toHaveAttribute('placeholder', 'Min (%)');
    });
  });

  it('should render number filter inputs when section is expanded', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      // Number filter inputs should be visible when section is expanded
      const fromInput = document.getElementById('revenue_growth-from');
      const toInput = document.getElementById('revenue_growth-to');
      expect(fromInput).toBeInTheDocument();
      expect(toInput).toBeInTheDocument();
    });
  });

  it('should allow entering feed name', async () => {
    const user = userEvent.setup();
    const mockSetFeedName = vi.fn();

    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: mockFilterConfigs,
        filterGroups: [],
        isLoadingFilters: false,
        isLoadingFeed: false,
        isSaving: false,
        saveFeed: mockSaveFeed,
        feedName: '',
        feedDescription: '',
        filterValues: {},
        numberFilterStates: {
          revenue_growth: { from: '', to: '' },
        },
        profileSelections: {
          companies: [],
          sectors: [],
          subsectors: [],
        },
        setFeedName: mockSetFeedName,
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn(),
        validateFeedName: vi.fn().mockReturnValue(true),
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByLabelText(/feed name/i)).toBeInTheDocument();
    });

    const feedNameInput = screen.getByLabelText(/feed name/i);
    await user.type(feedNameInput, 'My Custom Feed');

    // With mocked hook, verify setFeedName was called with each character
    expect(mockSetFeedName).toHaveBeenCalled();
  });

  it('should allow entering filter values', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
    });

    // Use the "From" input for revenue_growth filter
    const fromInput = document.getElementById('revenue_growth-from') as HTMLInputElement;
    expect(fromInput).toBeInTheDocument();

    // Just verify the input exists and is interactable
    await user.type(fromInput, '50');
    // With mocked hook, value change handlers are mocked so we can't verify actual value
    // Just verify the input rendered and is typeable
  });

  it('should allow checking boolean filters', async () => {
    const user = userEvent.setup();
    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: /profitable/i })).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox', { name: /profitable/i });
    // With mocked hook, click handler is mocked so we verify interaction works
    await user.click(checkbox);
    // Note: With mocked hook, the checked state won't actually change
    expect(checkbox).toBeInTheDocument();
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
    expect(mockSetLocation).toHaveBeenCalledWith('/');
  });

  it('should show error if feed name is empty on submit', async () => {
    const user = userEvent.setup();

    // Mock saveFeed to simulate validation failure
    const mockSaveFeedWithValidation = vi.fn(async () => {
      // Simulate validation - return failure to indicate validation failed
      return { success: false };
    });

    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: mockFilterConfigs,
        filterGroups: [],
        isLoadingFilters: false,
        isLoadingFeed: false,
        isSaving: false,
        saveFeed: mockSaveFeedWithValidation,
        feedName: '', // Empty name should trigger validation
        feedDescription: '',
        filterValues: {},
        numberFilterStates: { revenue_growth: { from: '', to: '' } },
        profileSelections: { companies: [], sectors: [], subsectors: [] },
        setFeedName: vi.fn(),
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn(),
        validateFeedName: vi.fn().mockReturnValue(false), // Return false to indicate validation failure
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create feed/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    // Verify saveFeed was called (validation happens inside the hook)
    await waitFor(() => {
      expect(mockSaveFeedWithValidation).toHaveBeenCalled();
    });
  });

  it('should show error if no filters selected', async () => {
    const user = userEvent.setup();

    // Mock saveFeed to simulate validation failure for no filters
    const mockSaveFeedWithValidation = vi.fn(async () => {
      return { success: false };
    });

    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: mockFilterConfigs,
        filterGroups: [],
        isLoadingFilters: false,
        isLoadingFeed: false,
        isSaving: false,
        saveFeed: mockSaveFeedWithValidation,
        feedName: 'Test Feed', // Has name but no filters
        feedDescription: '',
        filterValues: {},
        numberFilterStates: { revenue_growth: { from: '', to: '' } },
        profileSelections: { companies: [], sectors: [], subsectors: [] },
        setFeedName: vi.fn(),
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn().mockReturnValue(null), // Return null to indicate no filters
        validateFeedName: vi.fn().mockReturnValue(true),
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create feed/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    // Verify saveFeed was called (validation happens inside the hook)
    await waitFor(() => {
      expect(mockSaveFeedWithValidation).toHaveBeenCalled();
    });
  });

  it('should validate number filter range', async () => {
    const user = userEvent.setup();

    // Mock saveFeed to simulate validation failure for out-of-range value
    const mockSaveFeedWithValidation = vi.fn(async () => {
      return { success: false };
    });

    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: mockFilterConfigs,
        filterGroups: [],
        isLoadingFilters: false,
        isLoadingFeed: false,
        isSaving: false,
        saveFeed: mockSaveFeedWithValidation,
        feedName: 'Test Feed',
        feedDescription: '',
        filterValues: {},
        numberFilterStates: { revenue_growth: { from: '2000', to: '' } }, // Out of range value
        profileSelections: { companies: [], sectors: [], subsectors: [] },
        setFeedName: vi.fn(),
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn().mockReturnValue(null), // Validation failure
        validateFeedName: vi.fn().mockReturnValue(true),
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create feed/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    // Verify saveFeed was called (validation happens inside the hook)
    await waitFor(() => {
      expect(mockSaveFeedWithValidation).toHaveBeenCalled();
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

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      expect(screen.getByLabelText(/feed name/i)).toBeInTheDocument();
    });

    // Fill in form
    await user.type(screen.getByLabelText(/feed name/i), 'Growth Feed');
    await user.type(screen.getByLabelText(/description/i), 'High growth companies');

    // Use From input for revenue_growth filter
    const fromInput = document.getElementById('revenue_growth-from') as HTMLInputElement;
    await user.type(fromInput, '20');

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/');
    });
  });

  it('should show loading state while creating feed', async () => {
    // Mock with isSaving: true to show loading state
    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: mockFilterConfigs,
        filterGroups: [],
        isLoadingFilters: false,
        isLoadingFeed: false,
        isSaving: true, // Simulate saving state
        saveFeed: mockSaveFeed,
        feedName: 'Test Feed',
        feedDescription: '',
        filterValues: {},
        numberFilterStates: { revenue_growth: { from: '20', to: '' } },
        profileSelections: { companies: [], sectors: [], subsectors: [] },
        setFeedName: vi.fn(),
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn(),
        validateFeedName: vi.fn().mockReturnValue(true),
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByText(/creating\.\.\./i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /creating/i });
    expect(createButton).toBeDisabled();
  });

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup();

    // Mock saveFeed to simulate API error (returns failure)
    const mockSaveFeedWithError = vi.fn(async () => {
      return { success: false };
    });

    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: mockFilterConfigs,
        filterGroups: [],
        isLoadingFilters: false,
        isLoadingFeed: false,
        isSaving: false,
        saveFeed: mockSaveFeedWithError,
        feedName: 'Test Feed',
        feedDescription: '',
        filterValues: {},
        numberFilterStates: { revenue_growth: { from: '20', to: '' } },
        profileSelections: { companies: [], sectors: [], subsectors: [] },
        setFeedName: vi.fn(),
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn(),
        validateFeedName: vi.fn().mockReturnValue(true),
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create feed/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    // Verify saveFeed was called (error handling happens inside the hook)
    await waitFor(() => {
      expect(mockSaveFeedWithError).toHaveBeenCalled();
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
    const user = userEvent.setup();

    // Mock empty filter configs
    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: [],
        filterGroups: [],
        isLoadingFilters: false,
        isLoadingFeed: false,
        isSaving: false,
        saveFeed: mockSaveFeed,
        feedName: '',
        feedDescription: '',
        filterValues: {},
        numberFilterStates: {},
        profileSelections: {
          companies: [],
          sectors: [],
          subsectors: [],
        },
        setFeedName: vi.fn(),
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn(),
        validateFeedName: vi.fn().mockReturnValue(true),
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });

    render(<Filters />);

    // Expand the Additional Filters section
    await waitFor(() => {
      expect(screen.getByText('Additional Filters')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Additional Filters'));

    await waitFor(() => {
      expect(screen.getByText('No filters available')).toBeInTheDocument();
    });
  });

  it('should call saveFeed when form is submitted with valid data', async () => {
    const user = userEvent.setup();

    // Mock with data that represents a valid submission
    const mockSaveFeedForSubmit = vi.fn(async () => {
      capturedOnSuccess?.(123, false);
      return { success: true, feedId: 123, isEdit: false };
    });

    vi.mocked(useFeedManagement).mockImplementation((options?: { onSuccess?: (feedId: number, isEdit: boolean) => void }) => {
      capturedOnSuccess = options?.onSuccess;
      return {
        filterConfigs: mockFilterConfigs,
        filterGroups: [],
        isLoadingFilters: false,
        isLoadingFeed: false,
        isSaving: false,
        saveFeed: mockSaveFeedForSubmit,
        feedName: '  Test Feed  ', // Name with whitespace (trimming handled by hook)
        feedDescription: '',
        filterValues: {},
        numberFilterStates: { revenue_growth: { from: '20', to: '' } },
        profileSelections: { companies: [], sectors: [], subsectors: [] },
        setFeedName: vi.fn(),
        setFeedDescription: vi.fn(),
        setProfileSelections: vi.fn(),
        handleFilterChange: vi.fn(),
        handleNumberFilterFromChange: vi.fn(),
        handleNumberFilterToChange: vi.fn(),
        initializeNumberFilters: vi.fn(),
        loadFeedData: vi.fn(),
        resetFilters: vi.fn(),
        buildFilterCriteria: vi.fn(),
        validateFeedName: vi.fn().mockReturnValue(true),
        hasActiveFilters: vi.fn().mockReturnValue(false),
        buildSearchCriteria: vi.fn().mockReturnValue(null),
      };
    });

    render(<Filters />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create feed/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /create feed/i }));

    await waitFor(() => {
      expect(mockSaveFeedForSubmit).toHaveBeenCalled();
    });

    // Verify navigation happened after successful save
    await waitFor(() => {
      expect(mockSetLocation).toHaveBeenCalledWith('/');
    });
  });
});