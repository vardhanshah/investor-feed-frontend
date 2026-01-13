import { http, HttpResponse } from 'msw';
import { mockUsers, mockPosts, mockProfiles, mockFeedConfigs, mockProfilesAttributesMetadata, mockPostsAttributesMetadata, mockConfidenceWithVotes } from './mockData';

// Use relative URL to match what the app uses when VITE_API_BASE_URL is not set
const API_BASE_URL = '/api';

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

  // User profile endpoint (returns user data with id instead of user_id)
  http.get(`${API_BASE_URL}/user/profile`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    if (token === 'mock-token-123' || token === 'test-token') {
      // Return user data with 'id' field (API format)
      return HttpResponse.json({
        id: mockUsers[0].user_id,
        email: mockUsers[0].email,
        full_name: mockUsers[0].full_name,
        avatar_url: null,
        created_at: mockUsers[0].created_at,
      });
    }

    return HttpResponse.json(
      { detail: 'Could not validate credentials' },
      { status: 401 }
    );
  }),

  // Avatar upload endpoint
  http.post(`${API_BASE_URL}/user/profile/avatar`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: 'https://example.com/avatars/test-avatar.jpg',
      created_at: '2025-01-01T00:00:00',
    });
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

  http.delete(`${API_BASE_URL}/posts/:postId/comments/:commentId`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Authentication required' },
        { status: 401 }
      );
    }

    const { postId, commentId } = params;
    const token = authHeader.replace('Bearer ', '');

    // Mock: check if token is valid
    if (token !== 'mock-token-123' && token !== 'new-refreshed-token') {
      return HttpResponse.json(
        { detail: 'Could not validate credentials' },
        { status: 401 }
      );
    }

    // Mock: Comment 9999 doesn't exist
    if (commentId === '9999') {
      return HttpResponse.json(
        { detail: 'Comment not found' },
        { status: 404 }
      );
    }

    // Mock: Comment 456 doesn't belong to post 1
    if (postId === '1' && commentId === '456') {
      return HttpResponse.json(
        { detail: `Comment ${commentId} does not belong to post ${postId}` },
        { status: 404 }
      );
    }

    // Mock: User owns comment 123 but not comment 999
    if (commentId === '999') {
      return HttpResponse.json(
        { detail: 'You can only delete your own comments' },
        { status: 403 }
      );
    }

    return HttpResponse.json({
      message: 'Comment deleted successfully',
      comment_id: parseInt(commentId as string),
      post_id: parseInt(postId as string),
    });
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

  // Notifications endpoints
  http.get(`${API_BASE_URL}/notifications/count`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }
    return HttpResponse.json({ unread_count: 0 });
  }),

  http.get(`${API_BASE_URL}/notifications/mercure/auth`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }
    return HttpResponse.json({
      mercure_url: 'https://example.com/.well-known/mercure',
      token: 'mock-mercure-token'
    });
  }),

  // Mercure SSE streams endpoint (mock)
  http.get('/streams', () => {
    // Return empty response for SSE - tests don't need real streaming
    return new HttpResponse(null, { status: 200 });
  }),

  // External URLs passthrough (for PostCard source links, etc.)
  http.get('https://example.com/*', () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // Ads config endpoint
  http.get(`${API_BASE_URL}/ads/config`, () => {
    return HttpResponse.json({
      enabled: false,
      ad_client: null,
      ad_slot: null,
      ad_format: null,
      ad_layout_key: null,
      frequency: 5,
    });
  }),

  // Company Confidence vote endpoint
  http.put(`${API_BASE_URL}/profiles/:profileId/confidence`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return HttpResponse.json(
        { detail: 'Not authenticated' },
        { status: 401 }
      );
    }

    const profileId = parseInt(params.profileId as string);
    const profile = mockProfiles.find(p => p.id === profileId);
    if (!profile) {
      return HttpResponse.json(
        { detail: 'Profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json() as { vote: string };
    if (body.vote !== 'yes' && body.vote !== 'no') {
      return HttpResponse.json(
        { detail: 'Invalid vote value. Must be "yes" or "no"' },
        { status: 422 }
      );
    }

    // Simulate vote response with updated percentages
    const currentConfidence = profile.confidence || mockConfidenceWithVotes;
    const newTotalVotes = currentConfidence.total_votes + (currentConfidence.user_vote ? 0 : 1);

    // Simple calculation for mock - in reality backend would compute this
    const yesVotes = body.vote === 'yes'
      ? Math.ceil(newTotalVotes * 0.67)
      : Math.floor(newTotalVotes * 0.33);
    const noVotes = newTotalVotes - yesVotes;

    return HttpResponse.json({
      message: currentConfidence.user_vote
        ? `Vote changed to ${body.vote}`
        : `Vote recorded as ${body.vote}`,
      profile_id: profileId,
      vote: body.vote,
      yes_percentage: Math.round((yesVotes / newTotalVotes) * 100),
      no_percentage: Math.round((noVotes / newTotalVotes) * 100),
      total_votes: newTotalVotes,
    });
  }),
];
