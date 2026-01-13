import type { User, Post, Profile, FeedConfiguration, ProfilesAttributesMetadata, PostAttributesMetadata, ProfileConfidence } from '@/lib/api';

// Shared metadata for profile attributes
export const mockProfilesAttributesMetadata: ProfilesAttributesMetadata = {
  sector: { label: 'Sector', type: 'string' },
  region: { label: 'Region', type: 'string' },
  type: { label: 'Type', type: 'string' },
  mcap: { label: 'Market Cap', unit: 'Cr', type: 'number' },
  pe_ratio: { label: 'P/E Ratio', type: 'number' },
};

// Shared metadata for post attributes
export const mockPostsAttributesMetadata: PostAttributesMetadata = {
  growth_related: { label: 'Growth Related', type: 'boolean' },
  future_guidance: { label: 'Future Guidance', type: 'boolean' },
  revenue_insights: { label: 'Revenue Insights', type: 'boolean' },
  funding_related: { label: 'Funding Related', type: 'boolean' },
};

// Mock confidence data for testing different scenarios
export const mockConfidenceWithVotes: ProfileConfidence = {
  yes_percentage: 67,
  no_percentage: 33,
  total_votes: 3,
  user_vote: 'yes',
};

export const mockConfidenceNoUserVote: ProfileConfidence = {
  yes_percentage: 50,
  no_percentage: 50,
  total_votes: 2,
  user_vote: null,
};

export const mockConfidenceNoVotes: ProfileConfidence = {
  yes_percentage: null,
  no_percentage: null,
  total_votes: 0,
  user_vote: null,
};

export const mockUsers: User[] = [
  {
    user_id: 1,
    email: 'test@example.com',
    full_name: 'Test User',
    created_at: '2025-01-01T00:00:00',
  },
  {
    user_id: 2,
    email: 'john@example.com',
    full_name: 'John Doe',
    created_at: '2025-01-15T00:00:00',
  },
];

export const mockProfiles: Profile[] = [
  {
    id: 1,
    title: 'TechCorp Inc',
    description: 'Leading technology company',
    created_at: '2025-01-01T00:00:00',
    confidence: mockConfidenceWithVotes,
  },
  {
    id: 2,
    title: 'InvestPro Capital',
    description: 'Venture capital firm',
    created_at: '2025-01-02T00:00:00',
    confidence: mockConfidenceNoUserVote,
  },
  {
    id: 3,
    title: 'FinanceHub',
    description: 'Financial services provider',
    created_at: '2025-01-03T00:00:00',
    confidence: null, // No votes yet
  },
];

export const mockPosts: Post[] = [
  {
    id: 1,
    content: 'Excited to announce our Q3 results - 25% growth!',
    profile: {
      id: 1,
      title: 'TechCorp Inc',
      attributes: { sector: 'Technology', region: 'North America' },
    },
    source: 'https://example.com/news/1',
    created_at: '2025-10-15T10:00:00',
    images: [],
    comments: [],
    reaction_count: 42,
    comment_count: 5,
    user_liked: false,
    confidence: mockConfidenceWithVotes,
  },
  {
    id: 2,
    content: 'Just closed a $50M Series B round led by top VCs',
    profile: {
      id: 1,
      title: 'TechCorp Inc',
      attributes: { sector: 'Technology', region: 'North America' },
    },
    source: null,
    created_at: '2025-10-15T09:00:00',
    images: [],
    comments: [],
    reaction_count: 128,
    comment_count: 12,
    user_liked: true,
    confidence: mockConfidenceWithVotes,
  },
  {
    id: 3,
    content: 'Launching new AI-powered investment platform',
    profile: {
      id: 2,
      title: 'InvestPro Capital',
      attributes: { sector: 'Finance', type: 'Venture Capital' },
    },
    source: 'https://example.com/news/3',
    created_at: '2025-10-15T08:00:00',
    images: [],
    comments: [],
    reaction_count: 67,
    comment_count: 8,
    user_liked: false,
    confidence: mockConfidenceNoUserVote,
  },
  {
    id: 4,
    content: 'Expanding operations to 5 new markets across Asia',
    profile: {
      id: 3,
      title: 'FinanceHub',
      attributes: { sector: 'Financial Services', region: 'Asia Pacific' },
    },
    source: null,
    created_at: '2025-10-14T15:00:00',
    images: [],
    comments: [],
    reaction_count: 34,
    comment_count: 3,
    user_liked: false,
    confidence: null,
  },
  {
    id: 5,
    content: 'Partnership announcement with Fortune 500 company',
    profile: {
      id: 1,
      title: 'TechCorp Inc',
      attributes: { sector: 'Technology', region: 'North America' },
    },
    source: 'https://example.com/news/5',
    created_at: '2025-10-14T12:00:00',
    images: [],
    comments: [],
    reaction_count: 89,
    comment_count: 15,
    user_liked: true,
    confidence: mockConfidenceWithVotes,
  },
];

export const mockFeedConfigs: FeedConfiguration[] = [
  {
    id: 1,
    name: 'Growth Feed',
    description: 'Posts about company growth',
    filter_criteria: {
      filters: [
        {
          field: 'growth_related',
          operator: 'eq',
          value: true,
        },
      ],
      sort_by: 'submission_date',
      sort_order: 'desc',
    },
    is_default: true,
    created_by: 1,
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
    // Default feed has restricted sort options (only desc, no dropdown shown)
    sort_options: [
      { field: 'submission_date', label: 'Date', type: 'date', orders: ['desc'] },
    ],
    default_sort: 'submission_date',
    default_order: 'desc',
  },
  {
    id: 2,
    name: 'Funding News',
    description: 'Funding and investment related posts',
    filter_criteria: {
      filters: [
        {
          field: 'funding_related',
          operator: 'eq',
          value: true,
        },
      ],
      sort_by: 'submission_date',
      sort_order: 'desc',
    },
    is_default: false,
    created_by: 1,
    created_at: '2025-01-05T00:00:00',
    updated_at: '2025-01-05T00:00:00',
    // Custom feeds have all sort options with per-field orders
    sort_options: [
      { field: 'submission_date', label: 'Date', type: 'date', orders: ['desc', 'asc'] },
      { field: 'mcap', label: 'Market Cap', type: 'number', orders: ['desc', 'asc'] },
      { field: 'pe_ratio', label: 'P/E Ratio', type: 'number', orders: ['desc', 'asc'] },
      { field: 'roe', label: 'ROE', type: 'number', orders: ['desc', 'asc'] },
      { field: 'pb', label: 'P/B Ratio', type: 'number', orders: ['desc', 'asc'] },
      { field: 'sector', label: 'Sector', type: 'string', orders: ['asc'] },
      { field: 'subsector', label: 'Sub-Sector', type: 'string', orders: ['asc'] },
    ],
    default_sort: 'submission_date',
    default_order: 'desc',
  },
];
