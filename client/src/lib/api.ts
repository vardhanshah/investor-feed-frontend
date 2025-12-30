import { EventSourcePolyfill } from 'event-source-polyfill';

// API Configuration
// Use /api prefix for local dev proxy, or override via VITE_API_BASE_URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// Token refresh state
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Type definitions matching the backend API
export interface User {
  user_id: number;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
}

export interface RegisterResponse {
  message: string;
  user_id: number;
  email: string;
}

export interface ProfileMetaAttributes {
  logo_url?: string | null;
  symbol?: string | null;
  company_bse_id?: string | null;
  website?: string | null;
  isin?: string | null;
  bse_code?: string | null;
  nse_symbol?: string | null;
}

export interface ProfileConfidence {
  yes_percentage: number | null;
  no_percentage: number | null;
  total_votes: number;
  user_vote: 'yes' | 'no' | null;
}

export interface ConfidenceVoteResponse {
  message: string;
  profile_id: number;
  vote: 'yes' | 'no';
  yes_percentage: number;
  no_percentage: number;
  total_votes: number;
}

// Profile autocomplete result (deprecated - use mixed results below)
export interface ProfileAutocompleteItem {
  id: number;
  title: string;
  symbol: string | null;
  logo_url: string | null;
}

// Mixed autocomplete results
export interface AutocompleteCompanyResult {
  type: 'company';
  id: number;
  title: string;
  symbol: string | null;
  logo_url: string | null;
  url: string; // e.g., "/profiles/123"
}

export interface AutocompleteSectorResult {
  type: 'sector';
  value: string; // e.g., "Finance - Financial Services"
  count: number; // Number of companies in this sector
  url: string; // e.g., "/profiles?sector=Finance%20-%20Financial%20Services"
}

export interface AutocompleteSubsectorResult {
  type: 'subsector';
  value: string; // e.g., "Non Banking Financial Company (NBFC)"
  sector: string | null; // Parent sector name
  count: number; // Number of companies in this subsector
  url: string; // e.g., "/profiles?subsector=Non%20Banking%20Financial%20Company%20(NBFC)"
}

export type AutocompleteResult = AutocompleteCompanyResult | AutocompleteSectorResult | AutocompleteSubsectorResult;

export interface Profile {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at?: string;
  meta_attributes?: ProfileMetaAttributes | null;
  attributes?: {
    mcap?: number | null;
    pe_ratio?: number | null;
    pb?: number | null;
    roe?: number | null;
    sector?: string | null;
    subsector?: string | null;
  } | null;
  attributes_metadata?: ProfilesAttributesMetadata | null;
  confidence?: ProfileConfidence | null;
}

export interface PostAttributes {
  category?: string;
  sub_category?: string;
  growth_related?: boolean;
  future_guidance?: boolean;
  order_info?: boolean;
  capacity_expansion?: boolean;
  revenue_insights?: boolean;
  margin_insights?: boolean;
  change_in_management?: boolean;
}

export interface PostAttributesMetadata {
  [key: string]: {
    label: string;
    type: 'boolean';
  };
}

export interface ProfileAttributeMetadata {
  label: string;
  unit?: string | null;
  type: string;
}

export interface ProfilesAttributesMetadata {
  [key: string]: ProfileAttributeMetadata;
}

export interface PostProfile {
  id: number;
  title: string;
  external_id?: string;
  meta_attributes?: ProfileMetaAttributes | null;
  attributes?: Record<string, any>;
  confidence?: ProfileConfidence | null;
}

export interface Post {
  id: number;
  content: string;
  profile: PostProfile;
  source: string | null;
  submission_date?: string;
  created_at: string;
  updated_at?: string;
  images: string[];
  comments?: any[];
  reaction_count: number;
  comment_count: number;
  user_liked: boolean;
  attributes?: PostAttributes | null;
  attributes_metadata?: PostAttributesMetadata;
  confidence?: ProfileConfidence | null;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  limit: number;
  offset: number;
}

export interface FeedPostsResponse {
  posts: Post[];
  profiles_attributes_metadata?: ProfilesAttributesMetadata;
  posts_attributes_metadata?: PostAttributesMetadata;
}

// Simplified post interface for public/unauthenticated endpoints
export interface PublicPost {
  id: number;
  content: string;
  source: string;
  submission_date: string;
  profile: {
    id: number;
    title: string;
    meta_attributes: {
      symbol: string;
      logo_url?: string;
    };
    attributes: {
      sector: string;
      subsector: string;
    };
  };
  attributes: {
    category: string;
    sub_category: string;
    growth_related?: boolean;
    order_info?: boolean;
  };
}

export interface PublicPostsResponse {
  posts: PublicPost[];
}

export interface PostDetailResponse extends Post {
  profiles_attributes_metadata?: ProfilesAttributesMetadata;
  posts_attributes_metadata?: PostAttributesMetadata;
}

export interface SortOption {
  field: string;
  label: string;
  type: 'date' | 'number' | 'string';
  orders: ('asc' | 'desc')[];  // Allowed orders for this field, first is default
}

export interface FeedConfiguration {
  id: number;
  name: string;
  description: string | null;
  filter_criteria: {
    filters: Array<{
      field: string;
      operator: string;
      value: any;
    }>;
    sort_by: string;
    sort_order: string;
  };
  is_default: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  // Sorting metadata
  sort_options: SortOption[];
  default_sort: string;
  default_order: 'asc' | 'desc';
}

export interface Subscription {
  id: number;
  user_id: number;
  feed_id: number;
  feed_name: string;
  subscribed_at: string;
}

export interface ApiError {
  detail: string;
}

// Helper function to refresh access token
async function refreshAccessToken(): Promise<string | null> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    console.log('[Token Refresh] Already refreshing, returning existing promise');
    return refreshPromise;
  }

  console.log('[Token Refresh] Starting token refresh...');
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      // Call refresh endpoint - httpOnly cookie is sent automatically
      console.log('[Token Refresh] Calling POST /user/token with credentials: include');
      const response = await fetch(`${API_BASE_URL}/user/token`, {
        method: 'POST',
        credentials: 'include', // Important: sends cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('[Token Refresh] Response status:', response.status);

      if (!response.ok) {
        // Refresh failed - token expired or session expired
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('[Token Refresh] Failed:', errorData);
        console.error('[Token Refresh] Possible causes:');
        console.error('  1. Refresh token cookie not being sent (check Domain/CORS)');
        console.error('  2. Refresh token expired');
        console.error('  3. Session expired in Redis');
        console.error('  4. Backend not configured to accept cookies from frontend origin');
        localStorage.removeItem('authToken');
        return null;
      }

      const data = await response.json();
      const newAccessToken = data.access_token;
      console.log('[Token Refresh] Success! Got new access token');

      if (newAccessToken) {
        localStorage.setItem('authToken', newAccessToken);
        return newAccessToken;
      }

      console.warn('[Token Refresh] No access token in response');
      return null;
    } catch (error) {
      console.error('[Token Refresh] Exception:', error);
      localStorage.removeItem('authToken');
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
      console.log('[Token Refresh] Completed');
    }
  })();

  return refreshPromise;
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: 'An unexpected error occurred',
    }));
    throw new Error(error.detail);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Helper function to get auth headers
function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const authToken = token || localStorage.getItem('authToken');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return headers;
}

// Enhanced fetch wrapper with automatic token refresh on 401
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  // First attempt
  let response = await fetch(url, {
    ...options,
    credentials: 'include', // Always include cookies
  });

  // If 401 and we have a token, try to refresh
  if (response.status === 401 && localStorage.getItem('authToken')) {
    console.log('[Fetch] Got 401 for:', url, '- attempting token refresh');
    const newToken = await refreshAccessToken();

    if (newToken) {
      console.log('[Fetch] Token refreshed, retrying request to:', url);
      // Retry the request with new token
      const headers = new Headers(options.headers);
      headers.set('Authorization', `Bearer ${newToken}`);

      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
      console.log('[Fetch] Retry response status:', response.status);
    } else {
      console.error('[Fetch] Token refresh failed, user will be logged out');
    }
  }

  return response;
}

// Authentication API
// User Activity types - matching API contract
export interface UserActivity {
  id: number;
  type: 'comment' | 'thread' | 'reaction';
  created_at: string;
  content?: string; // For comment/thread
  reaction_emoji?: string; // For reaction
  comment_id?: number; // For thread (parent comment ID)
  comment_content?: string; // For thread (parent comment content)
  post: {
    id: number;
    content: string;
    profile: {
      id: number;
      title: string;
    };
  };
}

export interface UserActivityResponse {
  user_id: number;
  user_email: string;
  full_name: string;
  avatar_url?: string | null;
  created_at: string; // User account creation date
  activities: UserActivity[]; // Unified array
  total_count: number;
  limit: number;
  offset: number;
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<LoginResponse>(response);
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<RegisterResponse>(response);
  },

  async getCurrentUser(): Promise<User> {
    // Use /user/profile to get full user data including avatar_url
    const response = await fetchWithAuth(`${API_BASE_URL}/user/profile`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<any>(response);
    // Map 'id' from API to 'user_id' for frontend
    // Check for avatar_url or picture (Google OAuth returns 'picture')
    const user = {
      user_id: data.id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url || data.picture || null,
      created_at: data.created_at,
    };
    console.log('[API] getCurrentUser:', user);
    return user;
  },

  async refreshToken(): Promise<LoginResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      return handleResponse<LoginResponse>(response);
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
      });

      // Clear local token regardless of response
      localStorage.removeItem('authToken');

      if (!response.ok) {
        console.warn('Logout request failed, but local token cleared');
      }

      return handleResponse<void>(response);
    } catch (error) {
      // Even if the API call fails, clear local storage
      localStorage.removeItem('authToken');
      console.error('Logout error:', error);
    }
  },

  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/user/profile/avatar`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    return handleResponse<User>(response);
  },
};

// User Activity API
export const userActivityApi = {
  async getUserActivity(userId: number, limit = 40, offset = 0): Promise<UserActivityResponse> {
    const response = await fetch(
      `${API_BASE_URL}/user/${userId}/activity?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(),
        credentials: 'include',
      }
    );
    return handleResponse<UserActivityResponse>(response);
  },
};

// Profiles API
export const profilesApi = {
  async listProfiles(
    limit = 20,
    offset = 0,
    sector?: string,
    subsector?: string
  ): Promise<Profile[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (sector) params.append('sector', sector);
    if (subsector) params.append('subsector', subsector);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/profiles?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<Profile[]>(response);
  },

  async getProfile(profileId: number): Promise<Profile> {
    const response = await fetchWithAuth(`${API_BASE_URL}/profiles/${profileId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Profile>(response);
  },

  async autocomplete(query: string, limit = 10, type?: 'company' | 'sector' | 'subsector'): Promise<AutocompleteResult[]> {
    if (!query.trim()) {
      return [];
    }
    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    if (type) params.append('type', type);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/profiles/autocomplete?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<AutocompleteResult[]>(response);
  },
};

// Posts API
export const postsApi = {
  async listPosts(params?: { limit?: number; offset?: number; profile_id?: number }): Promise<PostsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.profile_id) queryParams.append('profile_id', params.profile_id.toString());

    const response = await fetchWithAuth(
      `${API_BASE_URL}/posts?${queryParams.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<PostsResponse>(response);
  },

  async getPost(postId: number): Promise<PostDetailResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<PostDetailResponse>(response);
  },

  async getPostWithComments(postId: number): Promise<Post> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Post>(response);
  },
};

// Feed Configurations API
export const feedConfigApi = {
  async listFeedConfigurations(): Promise<FeedConfiguration[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/feeds/config`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<FeedConfiguration[]>(response);
  },

  async getFeedConfiguration(feedId: number): Promise<FeedConfiguration> {
    const response = await fetchWithAuth(`${API_BASE_URL}/feeds/config/${feedId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<FeedConfiguration>(response);
  },

  async createFeedConfiguration(data: {
    name: string;
    description?: string;
    filter_criteria: FeedConfiguration['filter_criteria'];
  }): Promise<FeedConfiguration> {
    const response = await fetchWithAuth(`${API_BASE_URL}/feeds/config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<FeedConfiguration>(response);
  },

  async updateFeedConfiguration(feedId: number, data: {
    name?: string;
    description?: string;
    filter_criteria?: FeedConfiguration['filter_criteria'];
  }): Promise<FeedConfiguration> {
    const response = await fetchWithAuth(`${API_BASE_URL}/feeds/config/${feedId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<FeedConfiguration>(response);
  },

  async deleteFeedConfiguration(feedId: number): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/feeds/config/${feedId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// Feed Subscriptions API
export const subscriptionsApi = {
  async getUserSubscriptions(): Promise<Subscription[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/subscriptions`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Subscription[]>(response);
  },

  async subscribeToFeed(feedId: number): Promise<Subscription> {
    const response = await fetchWithAuth(`${API_BASE_URL}/subscriptions/feeds/${feedId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<Subscription>(response);
  },

  async unsubscribeFromFeed(feedId: number): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/subscriptions/feeds/${feedId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// Feeds API
export const feedsApi = {
  async getFeedPosts(
    feedId: number,
    limit = 20,
    offset = 0,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<FeedPostsResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (sortBy) params.append('sort_by', sortBy);
    if (sortOrder) params.append('sort_order', sortOrder);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/feeds/${feedId}/posts?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<FeedPostsResponse>(response);
  },

  async getPublicFeedPosts(
    limit = 20,
    offset = 0,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<FeedPostsResponse> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (sortBy) params.append('sort_by', sortBy);
    if (sortOrder) params.append('sort_order', sortOrder);

    // No auth headers - public endpoint
    const response = await fetch(
      `${API_BASE_URL}/feeds/public/posts?${params.toString()}`
    );
    return handleResponse<FeedPostsResponse>(response);
  },

  async getProfileFeed(profileId: number, limit = 40, offset = 0): Promise<FeedPostsResponse> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/profiles/${profileId}/posts?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<FeedPostsResponse>(response);
  },
};

// Reactions API
export const reactionsApi = {
  async addReaction(postId: number, reactionEmoji: string = '👍'): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/reactions`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reaction_emoji: reactionEmoji }),
    });
    return handleResponse<void>(response);
  },
};

// Comments API
export const commentsApi = {
  async getComments(postId: number, pageNo: number = 1, pageSize: number = 40): Promise<{
    comments: any[];
    total: number;
    page_no: number;
    page_size: number;
    total_pages: number;
  }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/posts/${postId}/comments?page_no=${pageNo}&page_size=${pageSize}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  async addComment(postId: number, content: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse<void>(response);
  },

  async addThreadReply(postId: number, commentId: number, content: string): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/threads`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse<void>(response);
  },

  async addCommentReaction(postId: number, commentId: number, reactionEmoji: string = '👍'): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/engagements`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reaction_emoji: reactionEmoji }),
    });
    return handleResponse<void>(response);
  },

  async addThreadReaction(postId: number, commentId: number, threadId: number, reactionEmoji: string = '👍'): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/threads/${threadId}/engagements`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reaction_emoji: reactionEmoji }),
    });
    return handleResponse<void>(response);
  },

  async deleteComment(postId: number, commentId: number): Promise<{ message: string; comment_id: number; post_id: number }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string; comment_id: number; post_id: number }>(response);
  },

  async deleteThreadReply(postId: number, commentId: number, threadId: number): Promise<{ message: string; thread_id: number; comment_id: number; post_id: number }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/threads/${threadId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string; thread_id: number; comment_id: number; post_id: number }>(response);
  },
};

// Filters API
export interface FilterConfig {
  field: string;
  label: string;
  type: 'number' | 'boolean' | 'string';
  description: string;
  group: string; // Group ID reference
  range?: {
    min: number;
    max: number;
  };
  unit?: string | null;
  operators?: Array<'gte' | 'lte' | 'lt' | 'gt' | 'eq'>;
}

export interface FilterGroup {
  group_id: string;
  group_label: string;
  group_description?: string;
  group_operator: 'and' | 'or';
  order: number;
}

export interface FilterConfigResponse {
  filters: FilterConfig[];
  groups: FilterGroup[]; // Array of groups, sorted by order
}

export const filtersApi = {
  async getFilterConfig(): Promise<FilterConfigResponse> {
    const response = await fetch(`${API_BASE_URL}/filters/config`);
    return handleResponse<FilterConfigResponse>(response);
  },
};

// Notifications API
export interface Notification {
  id: number;
  message: string;
  delivered: boolean;
  read: boolean;
  created_at: string;
  delivered_at: string | null;
  post_id: number | null;
}

export interface NotificationCountResponse {
  unread_count: number;
}

export const notificationsApi = {
  async getNotifications(unreadOnly: boolean = false, limit: number = 50): Promise<Notification[]> {
    const queryParams = new URLSearchParams();
    if (unreadOnly) queryParams.append('unread_only', 'true');
    queryParams.append('limit', limit.toString());

    const response = await fetchWithAuth(
      `${API_BASE_URL}/notifications?${queryParams.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<Notification[]>(response);
  },

  async getUnreadCount(): Promise<NotificationCountResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/count`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<NotificationCountResponse>(response);
  },

  async markAsRead(notificationId: number): Promise<void> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/notifications/${notificationId}/mark-read`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<void>(response);
  },

  async markAllAsRead(): Promise<void> {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },

  // Get Mercure authentication details (token and topic only)
  async getMercureAuth(): Promise<{ token: string; topic: string }> {
    const response = await fetchWithAuth(`${API_BASE_URL}/notifications/mercure/auth`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ token: string; topic: string }>(response);
  },

  // SSE connection for real-time notifications using Mercure
  async createSSEConnection(): Promise<EventSource> {
    // 1. Get auth details from backend (token and topic)
    const { token, topic } = await this.getMercureAuth();

    // 2. Connect to Mercure at {host}/streams
    const url = new URL('/streams', window.location.origin);
    url.searchParams.append('topic', topic);

    // Use EventSourcePolyfill to support Authorization header
    const eventSource = new EventSourcePolyfill(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      withCredentials: true,
    }) as EventSource;

    return eventSource;
  },
};

// Company Confidence API
export const confidenceApi = {
  async vote(profileId: number, vote: 'yes' | 'no'): Promise<ConfidenceVoteResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/profiles/${profileId}/confidence`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ vote }),
    });
    return handleResponse<ConfidenceVoteResponse>(response);
  },
};

// Ads Configuration API
export interface AdsConfig {
  enabled: boolean;
  frequency: number;
  ad_client: string | null;
  ad_slot: string | null;
  ad_format: string;
  ad_layout_key: string | null;
}

export const adsApi = {
  async getConfig(): Promise<AdsConfig> {
    const response = await fetch(`${API_BASE_URL}/ads/config`);
    if (!response.ok) {
      throw new Error('Failed to fetch ads config');
    }
    return response.json();
  },
};
