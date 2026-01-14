import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSelector, ProfileSelections } from './ProfileSelector';

// Mock the API - use vi.hoisted to ensure mock is available before vi.mock
const { mockAutocomplete } = vi.hoisted(() => ({
  mockAutocomplete: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/api', () => ({
  profilesApi: {
    autocomplete: mockAutocomplete,
  },
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('ProfileSelector', () => {
  const defaultSelections: ProfileSelections = {
    companies: [],
    sectors: [],
    subsectors: [],
  };

  const mockOnSelectionsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show "All Companies" mode by default when no selections', () => {
    render(
      <ProfileSelector
        selections={defaultSelections}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Check that "All Companies" is visually selected (has the purple styling)
    const allCompaniesButton = screen.getByText('All Companies').closest('button');
    expect(allCompaniesButton).toHaveClass('border-[hsl(280,100%,70%)]');
  });

  it('should show "Select Specific Companies" mode when companies are selected', () => {
    const selectionsWithCompanies: ProfileSelections = {
      companies: [{ id: 1, title: 'Test Company' }],
      sectors: [],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithCompanies}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Check that "Select Specific Companies" is visually selected
    const companiesButton = screen.getByText('Select Specific Companies').closest('button');
    expect(companiesButton).toHaveClass('border-[hsl(280,100%,70%)]');
  });

  it('should show "Filter by Sectors/Subsectors" mode when sectors are selected', () => {
    const selectionsWithSectors: ProfileSelections = {
      companies: [],
      sectors: [{ value: 'Finance' }],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithSectors}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Check that "Filter by Sectors/Subsectors" is visually selected
    const sectorsButton = screen.getByText('Filter by Sectors/Subsectors').closest('button');
    expect(sectorsButton).toHaveClass('border-[hsl(280,100%,70%)]');
  });

  it('should sync scopeMode when selections change externally', async () => {
    const { rerender } = render(
      <ProfileSelector
        selections={defaultSelections}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Initially "All Companies" should be selected
    let allCompaniesButton = screen.getByText('All Companies').closest('button');
    expect(allCompaniesButton).toHaveClass('border-[hsl(280,100%,70%)]');

    // Simulate external update (like loading feed data with profile_ids)
    const newSelections: ProfileSelections = {
      companies: [
        { id: 1, title: 'Company A' },
        { id: 2, title: 'Company B' },
      ],
      sectors: [],
      subsectors: [],
    };

    rerender(
      <ProfileSelector
        selections={newSelections}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Now "Select Specific Companies" should be selected
    await waitFor(() => {
      const companiesButton = screen.getByText('Select Specific Companies').closest('button');
      expect(companiesButton).toHaveClass('border-[hsl(280,100%,70%)]');
    });

    // All Companies should no longer be selected
    allCompaniesButton = screen.getByText('All Companies').closest('button');
    expect(allCompaniesButton).not.toHaveClass('border-[hsl(280,100%,70%)]');
  });

  it('should display selected companies', () => {
    const selectionsWithCompanies: ProfileSelections = {
      companies: [
        { id: 1, title: 'Company A' },
        { id: 2, title: 'Company B' },
      ],
      sectors: [],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithCompanies}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    expect(screen.getByText('Company A')).toBeInTheDocument();
    expect(screen.getByText('Company B')).toBeInTheDocument();
  });

  it('should show search input when in companies mode', () => {
    const selectionsWithCompanies: ProfileSelections = {
      companies: [{ id: 1, title: 'Test Company' }],
      sectors: [],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithCompanies}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Type to search companies...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should show search input when in sectors mode', () => {
    const selectionsWithSectors: ProfileSelections = {
      companies: [],
      sectors: [{ value: 'Finance' }],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithSectors}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should not show search input in "All Companies" mode', () => {
    render(
      <ProfileSelector
        selections={defaultSelections}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    const searchInputCompanies = screen.queryByPlaceholderText('Type to search companies...');
    const searchInputSectors = screen.queryByPlaceholderText('Type to search sectors/subsectors...');
    expect(searchInputCompanies).not.toBeInTheDocument();
    expect(searchInputSectors).not.toBeInTheDocument();
  });

  it('should clear selections when switching to "All Companies" mode', async () => {
    const user = userEvent.setup();
    const selectionsWithCompanies: ProfileSelections = {
      companies: [{ id: 1, title: 'Test Company' }],
      sectors: [],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithCompanies}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Click "All Companies"
    const allCompaniesButton = screen.getByText('All Companies').closest('button');
    await user.click(allCompaniesButton!);

    // Should call onSelectionsChange with empty selections
    expect(mockOnSelectionsChange).toHaveBeenCalledWith({
      companies: [],
      sectors: [],
      subsectors: [],
    });
  });

  it('should show selected count badge', () => {
    const selectionsWithCompanies: ProfileSelections = {
      companies: [
        { id: 1, title: 'Company A' },
        { id: 2, title: 'Company B' },
      ],
      sectors: [],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithCompanies}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('should allow switching to companies mode from all mode', async () => {
    const user = userEvent.setup();

    render(
      <ProfileSelector
        selections={defaultSelections}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Initially "All Companies" should be selected
    const allCompaniesButton = screen.getByText('All Companies').closest('button');
    expect(allCompaniesButton).toHaveClass('border-[hsl(280,100%,70%)]');

    // Click "Select Specific Companies"
    const companiesButton = screen.getByText('Select Specific Companies').closest('button');
    await user.click(companiesButton!);

    // Now "Select Specific Companies" should be selected and show search input
    await waitFor(() => {
      expect(companiesButton).toHaveClass('border-[hsl(280,100%,70%)]');
      expect(screen.getByPlaceholderText('Type to search companies...')).toBeInTheDocument();
    });
  });

  it('should allow switching to sectors mode from all mode', async () => {
    const user = userEvent.setup();

    render(
      <ProfileSelector
        selections={defaultSelections}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Click "Filter by Sectors/Subsectors"
    const sectorsButton = screen.getByText('Filter by Sectors/Subsectors').closest('button');
    await user.click(sectorsButton!);

    // Now "Filter by Sectors/Subsectors" should be selected and show search input
    await waitFor(() => {
      expect(sectorsButton).toHaveClass('border-[hsl(280,100%,70%)]');
      expect(screen.getByPlaceholderText('Type to search sectors/subsectors...')).toBeInTheDocument();
    });
  });

  it('should clear sectors when switching from sectors to all mode', async () => {
    const user = userEvent.setup();
    const selectionsWithSectors: ProfileSelections = {
      companies: [],
      sectors: [{ value: 'Finance' }],
      subsectors: [{ value: 'Banking' }],
    };

    render(
      <ProfileSelector
        selections={selectionsWithSectors}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Click "All Companies"
    const allCompaniesButton = screen.getByText('All Companies').closest('button');
    await user.click(allCompaniesButton!);

    // Should clear all selections
    expect(mockOnSelectionsChange).toHaveBeenCalledWith({
      companies: [],
      sectors: [],
      subsectors: [],
    });
  });

  it('should clear companies when switching from companies to sectors mode', async () => {
    const user = userEvent.setup();
    const selectionsWithCompanies: ProfileSelections = {
      companies: [{ id: 1, title: 'Company A' }],
      sectors: [],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithCompanies}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Click "Filter by Sectors/Subsectors"
    const sectorsButton = screen.getByText('Filter by Sectors/Subsectors').closest('button');
    await user.click(sectorsButton!);

    // Should clear companies
    expect(mockOnSelectionsChange).toHaveBeenCalledWith({
      companies: [],
      sectors: [],
      subsectors: [],
    });
  });

  it('should clear sectors when switching from sectors to companies mode', async () => {
    const user = userEvent.setup();
    const selectionsWithSectors: ProfileSelections = {
      companies: [],
      sectors: [{ value: 'Finance' }],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithSectors}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Click "Select Specific Companies"
    const companiesButton = screen.getByText('Select Specific Companies').closest('button');
    await user.click(companiesButton!);

    // Should clear sectors/subsectors
    expect(mockOnSelectionsChange).toHaveBeenCalledWith({
      companies: [],
      sectors: [],
      subsectors: [],
    });
  });

  it('should show sectors mode when only subsectors are selected', () => {
    const selectionsWithSubsectors: ProfileSelections = {
      companies: [],
      sectors: [],
      subsectors: [{ value: 'Banking' }],
    };

    render(
      <ProfileSelector
        selections={selectionsWithSubsectors}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // "Filter by Sectors/Subsectors" should be selected
    const sectorsButton = screen.getByText('Filter by Sectors/Subsectors').closest('button');
    expect(sectorsButton).toHaveClass('border-[hsl(280,100%,70%)]');
  });

  it('should do nothing when clicking already selected mode', async () => {
    const user = userEvent.setup();
    const selectionsWithCompanies: ProfileSelections = {
      companies: [{ id: 1, title: 'Company A' }],
      sectors: [],
      subsectors: [],
    };

    render(
      <ProfileSelector
        selections={selectionsWithCompanies}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    // Click "Select Specific Companies" which is already selected
    const companiesButton = screen.getByText('Select Specific Companies').closest('button');
    await user.click(companiesButton!);

    // Should not call onSelectionsChange
    expect(mockOnSelectionsChange).not.toHaveBeenCalled();
  });

  it('should display selected sectors and subsectors', () => {
    const selectionsWithSectors: ProfileSelections = {
      companies: [],
      sectors: [{ value: 'Finance' }],
      subsectors: [{ value: 'Banking' }],
    };

    render(
      <ProfileSelector
        selections={selectionsWithSectors}
        onSelectionsChange={mockOnSelectionsChange}
      />
    );

    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Banking')).toBeInTheDocument();
  });

  describe('activeTab syncing with scopeMode', () => {
    it('should sync activeTab to "sector" when loading with sector selections', async () => {
      const user = userEvent.setup();
      const selectionsWithSectors: ProfileSelections = {
        companies: [],
        sectors: [{ value: 'Finance' }],
        subsectors: [],
      };

      render(
        <ProfileSelector
          selections={selectionsWithSectors}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Type in search to trigger autocomplete
      const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'tech');

      // Wait for debounce and verify API is called with 'sector' type
      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('tech', 30, 'sector');
      }, { timeout: 500 });
    });

    it('should sync activeTab to "subsector" when loading with only subsector selections', async () => {
      const user = userEvent.setup();
      const selectionsWithSubsectors: ProfileSelections = {
        companies: [],
        sectors: [],
        subsectors: [{ value: 'Banking' }],
      };

      render(
        <ProfileSelector
          selections={selectionsWithSubsectors}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Type in search to trigger autocomplete
      const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'insur');

      // Wait for debounce and verify API is called with 'subsector' type
      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('insur', 30, 'subsector');
      }, { timeout: 500 });
    });

    it('should sync activeTab to "sector" when loading with both sector and subsector selections', async () => {
      const user = userEvent.setup();
      const selectionsWithBoth: ProfileSelections = {
        companies: [],
        sectors: [{ value: 'Finance' }],
        subsectors: [{ value: 'Banking' }],
      };

      render(
        <ProfileSelector
          selections={selectionsWithBoth}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Type in search to trigger autocomplete
      const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'health');

      // Wait for debounce and verify API is called with 'sector' type (default when both exist)
      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('health', 30, 'sector');
      }, { timeout: 500 });
    });

    it('should sync activeTab to "company" when loading with company selections', async () => {
      const user = userEvent.setup();
      const selectionsWithCompanies: ProfileSelections = {
        companies: [{ id: 1, title: 'Apple Inc' }],
        sectors: [],
        subsectors: [],
      };

      render(
        <ProfileSelector
          selections={selectionsWithCompanies}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Type in search to trigger autocomplete
      const searchInput = screen.getByPlaceholderText('Type to search companies...');
      await user.type(searchInput, 'google');

      // Wait for debounce and verify API is called with 'company' type
      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('google', 30, 'company');
      }, { timeout: 500 });
    });

    it('should call API with "sector" type when user clicks sectors mode button', async () => {
      const user = userEvent.setup();

      render(
        <ProfileSelector
          selections={defaultSelections}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Click "Filter by Sectors/Subsectors" mode
      const sectorsButton = screen.getByText('Filter by Sectors/Subsectors').closest('button');
      await user.click(sectorsButton!);

      // Type in search to trigger autocomplete
      const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'energy');

      // Wait for debounce and verify API is called with 'sector' type
      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('energy', 30, 'sector');
      }, { timeout: 500 });
    });

    it('should call API with "company" type when user clicks companies mode button', async () => {
      const user = userEvent.setup();

      render(
        <ProfileSelector
          selections={defaultSelections}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Click "Select Specific Companies" mode
      const companiesButton = screen.getByText('Select Specific Companies').closest('button');
      await user.click(companiesButton!);

      // Type in search to trigger autocomplete
      const searchInput = screen.getByPlaceholderText('Type to search companies...');
      await user.type(searchInput, 'microsoft');

      // Wait for debounce and verify API is called with 'company' type
      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('microsoft', 30, 'company');
      }, { timeout: 500 });
    });

    it('should switch activeTab to "company" when changing from sectors mode to companies mode', async () => {
      const user = userEvent.setup();
      const selectionsWithSectors: ProfileSelections = {
        companies: [],
        sectors: [{ value: 'Finance' }],
        subsectors: [],
      };

      const { rerender } = render(
        <ProfileSelector
          selections={selectionsWithSectors}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Click "Select Specific Companies" mode (this clears selections)
      const companiesButton = screen.getByText('Select Specific Companies').closest('button');
      await user.click(companiesButton!);

      // Simulate the selection change that would happen
      rerender(
        <ProfileSelector
          selections={{ companies: [], sectors: [], subsectors: [] }}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Now search for companies
      const searchInput = screen.getByPlaceholderText('Type to search companies...');
      await user.type(searchInput, 'amazon');

      // Wait for debounce and verify API is called with 'company' type
      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('amazon', 30, 'company');
      }, { timeout: 500 });
    });

    it('should update activeTab when selections change externally from companies to sectors', async () => {
      const user = userEvent.setup();
      const selectionsWithCompanies: ProfileSelections = {
        companies: [{ id: 1, title: 'Apple' }],
        sectors: [],
        subsectors: [],
      };

      const { rerender } = render(
        <ProfileSelector
          selections={selectionsWithCompanies}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Initially should show companies search
      expect(screen.getByPlaceholderText('Type to search companies...')).toBeInTheDocument();

      // Simulate external update to sectors
      const newSelections: ProfileSelections = {
        companies: [],
        sectors: [{ value: 'Technology' }],
        subsectors: [],
      };

      rerender(
        <ProfileSelector
          selections={newSelections}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Now should show sectors/subsectors search
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type to search sectors/subsectors...')).toBeInTheDocument();
      });

      // Type and verify API is called with sector type
      const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'retail');

      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('retail', 30, 'sector');
      }, { timeout: 500 });
    });

    it('should update activeTab when selections change externally from companies to subsectors only', async () => {
      const user = userEvent.setup();
      const selectionsWithCompanies: ProfileSelections = {
        companies: [{ id: 1, title: 'Apple' }],
        sectors: [],
        subsectors: [],
      };

      const { rerender } = render(
        <ProfileSelector
          selections={selectionsWithCompanies}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Simulate external update to subsectors only
      const newSelections: ProfileSelections = {
        companies: [],
        sectors: [],
        subsectors: [{ value: 'Software' }],
      };

      rerender(
        <ProfileSelector
          selections={newSelections}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Type and verify API is called with subsector type
      const searchInput = await screen.findByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'cloud');

      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('cloud', 30, 'subsector');
      }, { timeout: 500 });
    });
  });

  describe('tab switching within sectors mode', () => {
    it('should call API with "subsector" type when switching to subsector tab', async () => {
      const user = userEvent.setup();
      const selectionsWithSectors: ProfileSelections = {
        companies: [],
        sectors: [{ value: 'Finance' }],
        subsectors: [],
      };

      // Mock API to return sector results so dropdown shows
      mockAutocomplete.mockResolvedValue([
        { type: 'sector', value: 'Technology', count: 100, url: '/sector/tech' },
      ]);

      render(
        <ProfileSelector
          selections={selectionsWithSectors}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Type to open dropdown
      const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'tech');

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByText('Sector')).toBeInTheDocument();
      });

      // Clear previous calls
      mockAutocomplete.mockClear();

      // Click on Sub-Sector tab
      const subsectorTab = screen.getByText('Sub-Sector');
      await user.click(subsectorTab);

      // Verify API is called with 'subsector' type
      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('tech', 30, 'subsector');
      }, { timeout: 500 });
    });

    it('should call API with "sector" type when switching back to sector tab', async () => {
      const user = userEvent.setup();
      const selectionsWithSubsectors: ProfileSelections = {
        companies: [],
        sectors: [],
        subsectors: [{ value: 'Banking' }],
      };

      // Mock API to return subsector results
      mockAutocomplete.mockResolvedValue([
        { type: 'subsector', value: 'Insurance', sector: 'Finance', count: 50, url: '/subsector/ins' },
      ]);

      render(
        <ProfileSelector
          selections={selectionsWithSubsectors}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Type to open dropdown
      const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'ins');

      // Wait for dropdown to appear with tabs
      await waitFor(() => {
        expect(screen.getByText('Sub-Sector')).toBeInTheDocument();
      });

      // Clear previous calls
      mockAutocomplete.mockClear();

      // Click on Sector tab
      const sectorTab = screen.getByText('Sector');
      await user.click(sectorTab);

      // Verify API is called with 'sector' type
      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('ins', 30, 'sector');
      }, { timeout: 500 });
    });
  });

  describe('edge cases for activeTab syncing', () => {
    it('should not call API with "company" type when in sectors mode', async () => {
      const user = userEvent.setup();
      const selectionsWithSectors: ProfileSelections = {
        companies: [],
        sectors: [{ value: 'Finance' }],
        subsectors: [],
      };

      render(
        <ProfileSelector
          selections={selectionsWithSectors}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalled();
      }, { timeout: 500 });

      // Verify no calls were made with 'company' type
      const calls = mockAutocomplete.mock.calls;
      const companyTypeCalls = calls.filter((call: unknown[]) => call[2] === 'company');
      expect(companyTypeCalls.length).toBe(0);
    });

    it('should not call API with "sector" or "subsector" type when in companies mode', async () => {
      const user = userEvent.setup();
      const selectionsWithCompanies: ProfileSelections = {
        companies: [{ id: 1, title: 'Apple' }],
        sectors: [],
        subsectors: [],
      };

      render(
        <ProfileSelector
          selections={selectionsWithCompanies}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      const searchInput = screen.getByPlaceholderText('Type to search companies...');
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalled();
      }, { timeout: 500 });

      // Verify no calls were made with 'sector' or 'subsector' type
      const calls = mockAutocomplete.mock.calls;
      const sectorTypeCalls = calls.filter((call: unknown[]) => call[2] === 'sector' || call[2] === 'subsector');
      expect(sectorTypeCalls.length).toBe(0);
    });

    it('should handle rapid mode switching correctly', async () => {
      const user = userEvent.setup();

      render(
        <ProfileSelector
          selections={defaultSelections}
          onSelectionsChange={mockOnSelectionsChange}
        />
      );

      // Rapidly switch between modes
      const sectorsButton = screen.getByText('Filter by Sectors/Subsectors').closest('button');
      const companiesButton = screen.getByText('Select Specific Companies').closest('button');

      await user.click(sectorsButton!);
      await user.click(companiesButton!);
      await user.click(sectorsButton!);

      // Type and verify final mode is sectors
      const searchInput = screen.getByPlaceholderText('Type to search sectors/subsectors...');
      await user.type(searchInput, 'final');

      await waitFor(() => {
        expect(mockAutocomplete).toHaveBeenCalledWith('final', 30, 'sector');
      }, { timeout: 500 });
    });
  });
});
