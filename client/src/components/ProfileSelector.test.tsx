import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileSelector, ProfileSelections } from './ProfileSelector';

// Mock the API
vi.mock('@/lib/api', () => ({
  profilesApi: {
    autocomplete: vi.fn().mockResolvedValue([]),
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
});
