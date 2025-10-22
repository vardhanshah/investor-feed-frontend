// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://0.0.0.0:8000';

// Token refresh state
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// Type definitions matching the backend API
export interface User {
  user_id: number;
  email: string;
  full_name: string;
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

export interface Profile {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at?: string;
  attributes?: {
    mcap?: number | null;
    pe_ratio?: number | null;
    sector?: string | null;
    subsector?: string | null;
  } | null;
}

export interface PostAttributes {
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

export interface Post {
  id: number;
  content: string;
  profile_id: number;
  profile_title?: string;
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
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  limit: number;
  offset: number;
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
    const response = await fetchWithAuth(`${API_BASE_URL}/user/me`, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse<any>(response);

    // Backend returns { user: {...}, session: {...} } structure
    // Extract the user object
    if (data.user) {
      return data.user as User;
    }

    // Fallback: if backend returns user directly (old format)
    return data as User;
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
  async listProfiles(limit = 20, offset = 0): Promise<{ profiles: Profile[]; total: number; limit: number; offset: number }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/profiles?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  async getProfile(profileId: number): Promise<Profile> {
    const response = await fetchWithAuth(`${API_BASE_URL}/profiles/${profileId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Profile>(response);
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

  async getPost(postId: number): Promise<Post> {
    const response = await fetchWithAuth(`${API_BASE_URL}/posts/${postId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<Post>(response);
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
  async getFeedPosts(feedId: number, limit = 20, offset = 0): Promise<{ posts: Post[] }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/feeds/${feedId}/posts?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  async getProfileFeed(profileId: number, limit = 40, offset = 0): Promise<{ posts: Post[] }> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/profiles/${profileId}/posts?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
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
};

// Filters API
export interface FilterConfig {
  field: string;
  label: string;
  type: 'number' | 'boolean';
  description: string;
  range?: {
    min: number;
    max: number;
  };
  unit?: string | null;
  operators?: Array<'gte' | 'lte' | 'lt' | 'gt' | 'eq'>;
}

export interface FilterConfigResponse {
  filters: FilterConfig[];
}

export const filtersApi = {
  async getFilterConfig(): Promise<FilterConfigResponse> {
    const response = await fetch(`${API_BASE_URL}/filters/config`);
    return handleResponse<FilterConfigResponse>(response);
  },
};
