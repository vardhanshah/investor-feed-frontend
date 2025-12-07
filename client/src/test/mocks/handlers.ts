import { http, HttpResponse } from 'msw';
import { mockUsers, mockPosts, mockProfiles, mockFeedConfigs, mockProfilesAttributesMetadata, mockPostsAttributesMetadata } from './mockData';

const API_BASE_URL = 'https://dev.investorfeed.in/api';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/user/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'Test123!') {
      return HttpResponse.json({
        access_token: 'mock-token-123',
        token_type: 'bearer',
        user_id: 1,
        email: 'test@example.com',
      });
    }

    return HttpResponse.json(
      { detail: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/user/register`, async ({ request }) => {
    const body = await request.json() as any;

    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { detail: 'Email already registered' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      message: 'User registered successfully',
      user_id: 2,
      email: body.email,
    });
  }),

  http.get(`${API_BASE_URL}/user/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (token === 'mock-token-123') {
      return HttpResponse.json(mockUsers[0]);
    }

    return HttpResponse.json(
      { detail: 'Could not validate credentials' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/user/token`, ({ request }) => {
    // Token refresh endpoint
    const cookie = request.headers.get('Cookie');

    // If no refresh token cookie, return 401
    if (!cookie || !cookie.includes('refresh_token')) {
      return HttpResponse.json(
        { detail: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Return new access token
    return HttpResponse.json({
      access_token: 'mock-refreshed-token-456',
      token_type: 'bearer',
    });
  }),

  http.post(`${API_BASE_URL}/user/logout`, ({ request }) => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Posts endpoints
  http.get(`${API_BASE_URL}/posts`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const profileId = url.searchParams.get('profile_id');

    let filteredPosts = mockPosts;
    if (profileId) {
      filteredPosts = mockPosts.filter(p => p.profile.id === parseInt(profileId));
    }

    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    return HttpResponse.json({
      posts: paginatedPosts,
      total: filteredPosts.length,
      limit,
      offset,
    });
  }),

  http.get(`${API_BASE_URL}/posts/:postId`, ({ params }) => {
    const post = mockPosts.find(p => p.id === parseInt(params.postId as string));
    if (!post) {
      return HttpResponse.json(
        { detail: 'Post not found' },
        { status: 404 }
      );
    }
    // Return post with response-level metadata
    return HttpResponse.json({
      ...post,
      profiles_attributes_metadata: mockProfilesAttributesMetadata,
      posts_attributes_metadata: mockPostsAttributesMetadata,
    });
  }),

  // Profiles endpoints
  http.get(`${API_BASE_URL}/profiles`, ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const paginatedProfiles = mockProfiles.slice(offset, offset + limit);

    return HttpResponse.json({
      profiles: paginatedProfiles,
      total: mockProfiles.length,
      limit,
      offset,
    });
  }),

  http.get(`${API_BASE_URL}/profiles/:profileId`, ({ params }) => {
    const profile = mockProfiles.find(p => p.id === parseInt(params.profileId as string));
    if (!profile) {
      return HttpResponse.json(
        { detail: 'Profile not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json(profile);
  }),

  // Feed config endpoints
  http.get(`${API_BASE_URL}/feeds/config`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }
    return HttpResponse.json(mockFeedConfigs);
  }),

  http.post(`${API_BASE_URL}/feeds/config`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json() as any;
    const newConfig = {
      id: mockFeedConfigs.length + 1,
      ...body,
      is_default: false,
      created_by: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(newConfig, { status: 201 });
  }),

  // Feed posts endpoint
  http.get(`${API_BASE_URL}/feeds/:feedId/posts`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const paginatedPosts = mockPosts.slice(offset, offset + limit);

    return HttpResponse.json({
      posts: paginatedPosts,
      profiles_attributes_metadata: mockProfilesAttributesMetadata,
      posts_attributes_metadata: mockPostsAttributesMetadata,
    });
  }),

  // Subscriptions endpoints
  http.get(`${API_BASE_URL}/subscriptions`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }
    return HttpResponse.json([]);
  }),

  http.post(`${API_BASE_URL}/subscriptions/feeds/:feedId`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: 1,
      user_id: 1,
      feed_id: parseInt(params.feedId as string),
      feed_name: 'Test Feed',
      subscribed_at: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.delete(`${API_BASE_URL}/subscriptions/feeds/:feedId`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Reactions endpoints
  http.put(`${API_BASE_URL}/posts/:postId/reactions`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json() as { reaction_emoji: string };
    // In a real implementation, this would update the post's reaction count
    return new HttpResponse(null, { status: 204 });
  }),

  // Comments endpoints
  http.get(`${API_BASE_URL}/posts/:postId/comments`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const pageNo = parseInt(url.searchParams.get('page_no') || '1');
    const pageSize = parseInt(url.searchParams.get('page_size') || '40');

    // Mock comments data
    const allComments = [
      {
        id: 1,
        content: 'Great news!',
        user_id: 1,
        user_name: 'Test User',
        created_at: '2025-10-15T11:00:00',
      },
      {
        id: 2,
        content: 'Congratulations on the growth!',
        user_id: 2,
        user_name: 'John Doe',
        created_at: '2025-10-15T11:05:00',
      },
      {
        id: 3,
        content: 'Looking forward to Q4 results',
        user_id: 1,
        user_name: 'Test User',
        created_at: '2025-10-15T11:10:00',
      },
    ];

    const startIndex = (pageNo - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedComments = allComments.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allComments.length / pageSize);

    return HttpResponse.json({
      comments: paginatedComments,
      total: allComments.length,
      page_no: pageNo,
      page_size: pageSize,
      total_pages: totalPages,
    });
  }),

  http.post(`${API_BASE_URL}/posts/:postId/comments`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json() as { content: string };

    if (!body.content || body.content.trim() === '') {
      return HttpResponse.json(
        { detail: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

    // Return the newly created comment
    const newComment = {
      id: Date.now(),
      content: body.content,
      user_id: 1,
      user_name: 'Test User',
      created_at: new Date().toISOString(),
    };

    return HttpResponse.json(newComment, { status: 201 });
  }),

  // Filters endpoint
  http.get(`${API_BASE_URL}/filters/config`, () => {
    return HttpResponse.json({
      filters: [
        {
          field: 'revenue_growth',
          label: 'Revenue Growth',
          type: 'number',
          description: 'Year-over-year revenue growth percentage',
          range: { min: -100, max: 1000 },
          unit: '%',
          operators: ['gte', 'lte', 'gt', 'lt', 'eq'],
        },
        {
          field: 'has_profit',
          label: 'Profitable',
          type: 'boolean',
          description: 'Shows only profitable companies',
        },
      ],
    });
  }),

  // User activity endpoint
  http.get(`${API_BASE_URL}/user/:userId/activity`, ({ params }) => {
    return HttpResponse.json({
      user_id: parseInt(params.userId as string),
      user_email: 'test@example.com',
      full_name: 'Test User',
      created_at: '2025-01-01',
      activities: [
        {
          id: 1,
          type: 'comment',
          created_at: '2025-10-15T11:00:00',
          content: 'Great analysis!',
          post: {
            id: 1,
            content: 'Sample post content',
            profile: {
              id: 1,
              title: 'Sample Profile',
            },
          },
        },
      ],
      total_count: 1,
      limit: 40,
      offset: 0,
    });
  }),

  // Delete feed configuration endpoint
  http.delete(`${API_BASE_URL}/feeds/config/:feedId`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Profile posts endpoint
  http.get(`${API_BASE_URL}/profiles/:profileId/posts`, ({ request, params }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '40');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const profilePosts = mockPosts.filter(
      p => p.profile.id === parseInt(params.profileId as string)
    );
    const paginatedPosts = profilePosts.slice(offset, offset + limit);

    return HttpResponse.json({
      posts: paginatedPosts,
      profiles_attributes_metadata: mockProfilesAttributesMetadata,
      posts_attributes_metadata: mockPostsAttributesMetadata,
    });
  }),
];
