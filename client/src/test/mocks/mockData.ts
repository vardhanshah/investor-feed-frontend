import type { User, Post, Profile, FeedConfiguration } from '@/lib/api';

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
  },
  {
    id: 2,
    title: 'InvestPro Capital',
    description: 'Venture capital firm',
    created_at: '2025-01-02T00:00:00',
  },
  {
    id: 3,
    title: 'FinanceHub',
    description: 'Financial services provider',
    created_at: '2025-01-03T00:00:00',
  },
];

export const mockPosts: Post[] = [
  {
    id: 1,
    content: 'Excited to announce our Q3 results - 25% growth!',
    profile_id: 1,
    profile_title: 'TechCorp Inc',
    source: 'https://example.com/news/1',
    created_at: '2025-10-15T10:00:00',
    images: [],
    comments: [],
    reaction_count: 42,
    comment_count: 5,
    user_liked: false,
  },
  {
    id: 2,
    content: 'Just closed a $50M Series B round led by top VCs',
    profile_id: 1,
    profile_title: 'TechCorp Inc',
    source: null,
    created_at: '2025-10-15T09:00:00',
    images: [],
    comments: [],
    reaction_count: 128,
    comment_count: 12,
    user_liked: true,
  },
  {
    id: 3,
    content: 'Launching new AI-powered investment platform',
    profile_id: 2,
    profile_title: 'InvestPro Capital',
    source: 'https://example.com/news/3',
    created_at: '2025-10-15T08:00:00',
    images: [],
    comments: [],
    reaction_count: 67,
    comment_count: 8,
    user_liked: false,
  },
  {
    id: 4,
    content: 'Expanding operations to 5 new markets across Asia',
    profile_id: 3,
    profile_title: 'FinanceHub',
    source: null,
    created_at: '2025-10-14T15:00:00',
    images: [],
    comments: [],
    reaction_count: 34,
    comment_count: 3,
    user_liked: false,
  },
  {
    id: 5,
    content: 'Partnership announcement with Fortune 500 company',
    profile_id: 1,
    profile_title: 'TechCorp Inc',
    source: 'https://example.com/news/5',
    created_at: '2025-10-14T12:00:00',
    images: [],
    comments: [],
    reaction_count: 89,
    comment_count: 15,
    user_liked: true,
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
      sort_by: 'created_at',
      sort_order: 'desc',
    },
    is_default: true,
    created_by: 1,
    created_at: '2025-01-01T00:00:00',
    updated_at: '2025-01-01T00:00:00',
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
      sort_by: 'reaction_count',
      sort_order: 'desc',
    },
    is_default: false,
    created_by: 1,
    created_at: '2025-01-05T00:00:00',
    updated_at: '2025-01-05T00:00:00',
  },
];
