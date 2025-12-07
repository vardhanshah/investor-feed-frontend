import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  authApi,
  postsApi,
  profilesApi,
  feedConfigApi,
  subscriptionsApi,
  feedsApi,
  reactionsApi,
  commentsApi,
} from './api';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'https://dev.investorfeed.in/api';

describe('API Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('authApi', () => {
    describe('login', () => {
      it('should successfully login with valid credentials', async () => {
        const result = await authApi.login({
          email: 'test@example.com',
          password: 'Test123!',
        });

        expect(result).toEqual({
          access_token: 'mock-token-123',
          token_type: 'bearer',
          user_id: 1,
          email: 'test@example.com',
        });
      });

      it('should throw error with invalid credentials', async () => {
        await expect(
          authApi.login({
            email: 'wrong@example.com',
            password: 'wrong',
          })
        ).rejects.toThrow('Invalid credentials');
      });

      it('should send correct request body', async () => {
        let requestBody: any;

        server.use(
          http.post(`${API_BASE_URL}/user/login`, async ({ request }) => {
            requestBody = await request.json();
            return HttpResponse.json({
              access_token: 'token',
              token_type: 'bearer',
              user_id: 1,
              email: 'test@example.com',
            });
          })
        );

        await authApi.login({
          email: 'test@example.com',
          password: 'Test123!',
        });

        expect(requestBody).toEqual({
          email: 'test@example.com',
          password: 'Test123!',
        });
      });
    });

    describe('register', () => {
      it('should successfully register a new user', async () => {
        const result = await authApi.register({
          email: 'newuser@example.com',
          password: 'Test123!',
          confirm_password: 'Test123!',
          full_name: 'New User',
        });

        expect(result).toEqual({
          message: 'User registered successfully',
          user_id: 2,
          email: 'newuser@example.com',
        });
      });

      it('should throw error if email already exists', async () => {
        await expect(
          authApi.register({
            email: 'existing@example.com',
            password: 'Test123!',
            confirm_password: 'Test123!',
            full_name: 'Existing User',
          })
        ).rejects.toThrow('Email already registered');
      });

      it('should send all required fields', async () => {
        let requestBody: any;

        server.use(
          http.post(`${API_BASE_URL}/user/register`, async ({ request }) => {
            requestBody = await request.json();
            return HttpResponse.json({
              message: 'User registered successfully',
              user_id: 2,
              email: 'test@example.com',
            });
          })
        );

        await authApi.register({
          email: 'test@example.com',
          password: 'Test123!',
          confirm_password: 'Test123!',
          full_name: 'Test User',
        });

        expect(requestBody).toEqual({
          email: 'test@example.com',
          password: 'Test123!',
          confirm_password: 'Test123!',
          full_name: 'Test User',
        });
      });
    });

    describe('getCurrentUser', () => {
      it('should return user data with valid token', async () => {
        localStorage.setItem('authToken', 'mock-token-123');

        const result = await authApi.getCurrentUser();

        expect(result).toEqual({
          user_id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          created_at: '2025-01-01T00:00:00',
        });
      });

      it('should throw error without token', async () => {
        await expect(authApi.getCurrentUser()).rejects.toThrow('Not authenticated');
      });

      it('should throw error with invalid token', async () => {
        localStorage.setItem('authToken', 'invalid-token');

        await expect(authApi.getCurrentUser()).rejects.toThrow(
          'Could not validate credentials'
        );
      });

      it('should send Authorization header', async () => {
        let authHeader: string | null = null;

        server.use(
          http.get(`${API_BASE_URL}/user/me`, ({ request }) => {
            authHeader = request.headers.get('Authorization');
            return HttpResponse.json({
              user_id: 1,
              email: 'test@example.com',
              full_name: 'Test User',
              created_at: '2025-01-01T00:00:00',
            });
          })
        );

        localStorage.setItem('authToken', 'test-token');
        await authApi.getCurrentUser();

        expect(authHeader).toBe('Bearer test-token');
      });
    });
  });

  describe('postsApi', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'mock-token-123');
    });

    describe('listPosts', () => {
      it('should return paginated posts', async () => {
        const result = await postsApi.listPosts({ limit: 20, offset: 0 });

        expect(result).toHaveProperty('posts');
        expect(result).toHaveProperty('total');
        expect(result).toHaveProperty('limit');
        expect(result).toHaveProperty('offset');
        expect(Array.isArray(result.posts)).toBe(true);
      });

      it('should filter by profile_id', async () => {
        const result = await postsApi.listPosts({ profile_id: 1 });

        expect(result.posts.every((post) => post.profile.id === 1)).toBe(true);
      });

      it('should handle pagination parameters', async () => {
        const result = await postsApi.listPosts({ limit: 2, offset: 1 });

        expect(result.limit).toBe(2);
        expect(result.offset).toBe(1);
      });

      it('should use default parameters when none provided', async () => {
        const result = await postsApi.listPosts();

        expect(result).toHaveProperty('posts');
      });
    });

    describe('getPost', () => {
      it('should return a single post', async () => {
        const result = await postsApi.getPost(1);

        expect(result).toHaveProperty('id', 1);
        expect(result).toHaveProperty('content');
        expect(result).toHaveProperty('profile');
      });

      it('should throw error for non-existent post', async () => {
        await expect(postsApi.getPost(9999)).rejects.toThrow('Post not found');
      });
    });
  });

  describe('profilesApi', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'mock-token-123');
    });

    describe('listProfiles', () => {
      it('should return paginated profiles', async () => {
        const result = await profilesApi.listProfiles(20, 0);

        expect(result).toHaveProperty('profiles');
        expect(result).toHaveProperty('total');
        expect(Array.isArray(result.profiles)).toBe(true);
      });

      it('should handle pagination', async () => {
        const result = await profilesApi.listProfiles(2, 1);

        expect(result.limit).toBe(2);
        expect(result.offset).toBe(1);
      });
    });

    describe('getProfile', () => {
      it('should return a single profile', async () => {
        const result = await profilesApi.getProfile(1);

        expect(result).toHaveProperty('id', 1);
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('description');
      });

      it('should throw error for non-existent profile', async () => {
        await expect(profilesApi.getProfile(9999)).rejects.toThrow(
          'Profile not found'
        );
      });
    });
  });

  describe('feedConfigApi', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'mock-token-123');
    });

    describe('listFeedConfigurations', () => {
      it('should return feed configurations', async () => {
        const result = await feedConfigApi.listFeedConfigurations();

        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('filter_criteria');
      });

      it('should require authentication', async () => {
        localStorage.clear();

        await expect(feedConfigApi.listFeedConfigurations()).rejects.toThrow(
          'Not authenticated'
        );
      });
    });

    describe('getFeedConfiguration', () => {
      it('should return a specific feed configuration', async () => {
        // First get the list to find a valid ID
        const configs = await feedConfigApi.listFeedConfigurations();
        const firstConfigId = configs[0].id;

        server.use(
          http.get(`${API_BASE_URL}/feeds/config/${firstConfigId}`, () => {
            return HttpResponse.json(configs[0]);
          })
        );

        const result = await feedConfigApi.getFeedConfiguration(firstConfigId);

        expect(result).toHaveProperty('id', firstConfigId);
      });
    });

    describe('createFeedConfiguration', () => {
      it('should create a new feed configuration', async () => {
        const newFeed = {
          name: 'Test Feed',
          description: 'Test Description',
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
        };

        const result = await feedConfigApi.createFeedConfiguration(newFeed);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name', 'Test Feed');
        expect(result).toHaveProperty('filter_criteria');
      });

      it('should require authentication', async () => {
        localStorage.clear();

        await expect(
          feedConfigApi.createFeedConfiguration({
            name: 'Test',
            filter_criteria: {
              filters: [],
              sort_by: 'created_at',
              sort_order: 'desc',
            },
          })
        ).rejects.toThrow('Not authenticated');
      });
    });
  });

  describe('subscriptionsApi', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'mock-token-123');
    });

    describe('getUserSubscriptions', () => {
      it('should return user subscriptions', async () => {
        const result = await subscriptionsApi.getUserSubscriptions();

        expect(Array.isArray(result)).toBe(true);
      });

      it('should require authentication', async () => {
        localStorage.clear();

        await expect(subscriptionsApi.getUserSubscriptions()).rejects.toThrow(
          'Not authenticated'
        );
      });
    });

    describe('subscribeToFeed', () => {
      it('should subscribe to a feed', async () => {
        const result = await subscriptionsApi.subscribeToFeed(1);

        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('feed_id', 1);
        expect(result).toHaveProperty('user_id');
      });

      it('should require authentication', async () => {
        localStorage.clear();

        await expect(subscriptionsApi.subscribeToFeed(1)).rejects.toThrow(
          'Not authenticated'
        );
      });
    });

    describe('unsubscribeFromFeed', () => {
      it('should unsubscribe from a feed', async () => {
        await expect(
          subscriptionsApi.unsubscribeFromFeed(1)
        ).resolves.not.toThrow();
      });

      it('should require authentication', async () => {
        localStorage.clear();

        await expect(subscriptionsApi.unsubscribeFromFeed(1)).rejects.toThrow(
          'Not authenticated'
        );
      });
    });
  });

  describe('feedsApi', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'mock-token-123');
    });

    describe('getFeedPosts', () => {
      it('should return posts from a feed', async () => {
        const result = await feedsApi.getFeedPosts(1);

        expect(result).toHaveProperty('posts');
        expect(Array.isArray(result.posts)).toBe(true);
      });

      it('should handle pagination', async () => {
        const result = await feedsApi.getFeedPosts(1, 10, 5);

        expect(result).toHaveProperty('posts');
      });

      it('should require authentication', async () => {
        localStorage.clear();

        await expect(feedsApi.getFeedPosts(1)).rejects.toThrow(
          'Not authenticated'
        );
      });
    });
  });

  describe('reactionsApi', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'mock-token-123');
    });

    describe('addReaction', () => {
      it('should add reaction to a post', async () => {
        server.use(
          http.put(`${API_BASE_URL}/posts/1/reactions`, () => {
            return new HttpResponse(null, { status: 204 });
          })
        );

        await expect(reactionsApi.addReaction(1)).resolves.not.toThrow();
      });

      it('should send default reaction emoji', async () => {
        let requestBody: any;

        server.use(
          http.put(`${API_BASE_URL}/posts/1/reactions`, async ({ request }) => {
            requestBody = await request.json();
            return new HttpResponse(null, { status: 204 });
          })
        );

        await reactionsApi.addReaction(1);

        expect(requestBody).toEqual({ reaction_emoji: '👍' });
      });

      it('should send custom reaction emoji', async () => {
        let requestBody: any;

        server.use(
          http.put(`${API_BASE_URL}/posts/1/reactions`, async ({ request }) => {
            requestBody = await request.json();
            return new HttpResponse(null, { status: 204 });
          })
        );

        await reactionsApi.addReaction(1, '❤️');

        expect(requestBody).toEqual({ reaction_emoji: '❤️' });
      });

      it('should require authentication', async () => {
        localStorage.clear();

        server.use(
          http.put(`${API_BASE_URL}/posts/1/reactions`, () => {
            return HttpResponse.json(
              { detail: 'Not authenticated' },
              { status: 401 }
            );
          })
        );

        await expect(reactionsApi.addReaction(1)).rejects.toThrow('Not authenticated');
      });
    });
  });

  describe('commentsApi', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'mock-token-123');
    });

    describe('getComments', () => {
      it('should fetch paginated comments', async () => {
        server.use(
          http.get(`${API_BASE_URL}/posts/1/comments`, () => {
            return HttpResponse.json({
              comments: [
                {
                  id: 1,
                  user_id: 2,
                  content: 'Great post!',
                  reaction_count: 5,
                  thread: [],
                  created_at: '2024-10-15T10:00:00',
                },
                {
                  id: 2,
                  user_id: 3,
                  content: 'Thanks for sharing',
                  reaction_count: 3,
                  thread: [],
                  created_at: '2024-10-15T11:00:00',
                },
              ],
              total: 100,
              page_no: 1,
              page_size: 40,
              total_pages: 3,
            });
          })
        );

        const result = await commentsApi.getComments(1, 1, 40);

        expect(result).toHaveProperty('comments');
        expect(result).toHaveProperty('total');
        expect(result).toHaveProperty('page_no');
        expect(result).toHaveProperty('page_size');
        expect(result).toHaveProperty('total_pages');
        expect(Array.isArray(result.comments)).toBe(true);
        expect(result.comments).toHaveLength(2);
      });

      it('should use default pagination values', async () => {
        let requestUrl: string = '';

        server.use(
          http.get(`${API_BASE_URL}/posts/1/comments`, ({ request }) => {
            requestUrl = request.url;
            return HttpResponse.json({
              comments: [],
              total: 0,
              page_no: 1,
              page_size: 40,
              total_pages: 0,
            });
          })
        );

        await commentsApi.getComments(1);

        expect(requestUrl).toContain('page_no=1');
        expect(requestUrl).toContain('page_size=40');
      });

      it('should handle different page sizes', async () => {
        let requestUrl: string = '';

        server.use(
          http.get(`${API_BASE_URL}/posts/1/comments`, ({ request }) => {
            requestUrl = request.url;
            return HttpResponse.json({
              comments: [],
              total: 0,
              page_no: 2,
              page_size: 20,
              total_pages: 0,
            });
          })
        );

        await commentsApi.getComments(1, 2, 20);

        expect(requestUrl).toContain('page_no=2');
        expect(requestUrl).toContain('page_size=20');
      });

      it('should return empty array when beyond last page', async () => {
        server.use(
          http.get(`${API_BASE_URL}/posts/1/comments`, () => {
            return HttpResponse.json({
              comments: [],
              total: 50,
              page_no: 10,
              page_size: 40,
              total_pages: 2,
            });
          })
        );

        const result = await commentsApi.getComments(1, 10, 40);

        expect(result.comments).toEqual([]);
        expect(result.total).toBe(50);
      });
    });

    describe('addComment', () => {
      it('should add comment to a post', async () => {
        server.use(
          http.post(`${API_BASE_URL}/posts/1/comments`, () => {
            return new HttpResponse(null, { status: 204 });
          })
        );

        await expect(commentsApi.addComment(1, 'Great post!')).resolves.not.toThrow();
      });

      it('should send correct request body', async () => {
        let requestBody: any;

        server.use(
          http.post(`${API_BASE_URL}/posts/1/comments`, async ({ request }) => {
            requestBody = await request.json();
            return new HttpResponse(null, { status: 204 });
          })
        );

        await commentsApi.addComment(1, 'This is my comment');

        expect(requestBody).toEqual({ content: 'This is my comment' });
      });

      it('should handle multiline comments', async () => {
        let requestBody: any;

        server.use(
          http.post(`${API_BASE_URL}/posts/1/comments`, async ({ request }) => {
            requestBody = await request.json();
            return new HttpResponse(null, { status: 204 });
          })
        );

        await commentsApi.addComment(1, 'Line 1\nLine 2\nLine 3');

        expect(requestBody).toEqual({ content: 'Line 1\nLine 2\nLine 3' });
      });

      it('should require authentication', async () => {
        localStorage.clear();

        server.use(
          http.post(`${API_BASE_URL}/posts/1/comments`, () => {
            return HttpResponse.json(
              { detail: 'Not authenticated' },
              { status: 401 }
            );
          })
        );

        await expect(commentsApi.addComment(1, 'My comment')).rejects.toThrow('Not authenticated');
      });

      it('should throw error on validation failure', async () => {
        server.use(
          http.post(`${API_BASE_URL}/posts/1/comments`, () => {
            return HttpResponse.json(
              { detail: 'Comment content is required' },
              { status: 422 }
            );
          })
        );

        await expect(commentsApi.addComment(1, '')).rejects.toThrow('Comment content is required');
      });
    });
  });

  describe('Token Refresh', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should automatically refresh token on 401 and retry request', async () => {
      localStorage.setItem('authToken', 'expired-token');

      let attemptCount = 0;

      server.use(
        // First call to /user/me returns 401
        http.get(`${API_BASE_URL}/user/me`, () => {
          attemptCount++;
          if (attemptCount === 1) {
            return HttpResponse.json(
              { detail: 'Token expired' },
              { status: 401 }
            );
          }
          // After refresh, second call succeeds
          return HttpResponse.json({
            user: {
              user_id: 1,
              email: 'test@example.com',
              full_name: 'Test User',
              created_at: '2025-01-01T00:00:00',
            },
          });
        }),
        // Token refresh endpoint
        http.post(`${API_BASE_URL}/user/token`, () => {
          return HttpResponse.json({
            access_token: 'new-refreshed-token',
            token_type: 'bearer',
            user_id: 1,
            email: 'test@example.com',
          });
        })
      );

      const result = await authApi.getCurrentUser();

      expect(result).toEqual({
        user_id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        created_at: '2025-01-01T00:00:00',
      });
      expect(attemptCount).toBe(2); // First call (401) + retry (success)
      expect(localStorage.getItem('authToken')).toBe('new-refreshed-token');
    });

    it('should call /user/token endpoint with credentials on 401', async () => {
      localStorage.setItem('authToken', 'expired-token');

      let tokenRefreshCalled = false;
      let refreshRequestCredentials: RequestCredentials | undefined;

      server.use(
        http.get(`${API_BASE_URL}/user/me`, () => {
          return HttpResponse.json(
            { detail: 'Token expired' },
            { status: 401 }
          );
        }),
        http.post(`${API_BASE_URL}/user/token`, ({ request }) => {
          tokenRefreshCalled = true;
          refreshRequestCredentials = request.credentials;
          return HttpResponse.json({
            access_token: 'new-token',
            token_type: 'bearer',
          });
        })
      );

      try {
        await authApi.getCurrentUser();
      } catch (error) {
        // Expected to fail since we don't mock the retry
      }

      expect(tokenRefreshCalled).toBe(true);
      expect(refreshRequestCredentials).toBe('include');
    });

    it('should clear token and reject if refresh fails', async () => {
      localStorage.setItem('authToken', 'expired-token');

      server.use(
        http.get(`${API_BASE_URL}/user/me`, () => {
          return HttpResponse.json(
            { detail: 'Token expired' },
            { status: 401 }
          );
        }),
        http.post(`${API_BASE_URL}/user/token`, () => {
          return HttpResponse.json(
            { detail: 'Refresh token missing' },
            { status: 401 }
          );
        })
      );

      await expect(authApi.getCurrentUser()).rejects.toThrow();
      expect(localStorage.getItem('authToken')).toBeNull();
    });

    it('should not attempt refresh if no token exists', async () => {
      let tokenRefreshCalled = false;

      server.use(
        http.get(`${API_BASE_URL}/user/me`, () => {
          return HttpResponse.json(
            { detail: 'Not authenticated' },
            { status: 401 }
          );
        }),
        http.post(`${API_BASE_URL}/user/token`, () => {
          tokenRefreshCalled = true;
          return HttpResponse.json({
            access_token: 'new-token',
            token_type: 'bearer',
          });
        })
      );

      await expect(authApi.getCurrentUser()).rejects.toThrow('Not authenticated');
      expect(tokenRefreshCalled).toBe(false);
    });

    it('should handle multiple concurrent 401s without duplicate refresh calls', async () => {
      localStorage.setItem('authToken', 'expired-token');

      let tokenRefreshCallCount = 0;

      server.use(
        http.get(`${API_BASE_URL}/user/me`, () => {
          return HttpResponse.json(
            { detail: 'Token expired' },
            { status: 401 }
          );
        }),
        http.get(`${API_BASE_URL}/feeds/config`, () => {
          return HttpResponse.json(
            { detail: 'Token expired' },
            { status: 401 }
          );
        }),
        http.post(`${API_BASE_URL}/user/token`, () => {
          tokenRefreshCallCount++;
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(
                HttpResponse.json({
                  access_token: 'new-token',
                  token_type: 'bearer',
                })
              );
            }, 50); // Simulate network delay
          });
        })
      );

      // Make two concurrent requests that both return 401
      const promise1 = authApi.getCurrentUser().catch(() => {});
      const promise2 = feedConfigApi.listFeedConfigurations().catch(() => {});

      await Promise.all([promise1, promise2]);

      // Should only call token refresh once, not twice
      expect(tokenRefreshCallCount).toBe(1);
    });

    it('should update Authorization header with new token after refresh', async () => {
      localStorage.setItem('authToken', 'expired-token');

      let secondRequestAuthHeader: string | null = null;

      server.use(
        http.get(`${API_BASE_URL}/user/me`, ({ request }) => {
          const authHeader = request.headers.get('Authorization');

          if (authHeader === 'Bearer expired-token') {
            return HttpResponse.json(
              { detail: 'Token expired' },
              { status: 401 }
            );
          }

          // Store the auth header from the retry
          secondRequestAuthHeader = authHeader;

          return HttpResponse.json({
            user: {
              user_id: 1,
              email: 'test@example.com',
              full_name: 'Test User',
              created_at: '2025-01-01T00:00:00',
            },
          });
        }),
        http.post(`${API_BASE_URL}/user/token`, () => {
          return HttpResponse.json({
            access_token: 'brand-new-token',
            token_type: 'bearer',
          });
        })
      );

      await authApi.getCurrentUser();

      expect(secondRequestAuthHeader).toBe('Bearer brand-new-token');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'mock-token-123');
    });

    it('should handle network errors gracefully', async () => {
      server.use(
        http.get(`${API_BASE_URL}/user/me`, () => {
          return HttpResponse.error();
        })
      );

      await expect(authApi.getCurrentUser()).rejects.toThrow();
    });

    it('should parse error detail from response', async () => {
      server.use(
        http.post(`${API_BASE_URL}/user/login`, () => {
          return HttpResponse.json(
            { detail: 'Custom error message' },
            { status: 400 }
          );
        })
      );

      await expect(
        authApi.login({
          email: 'test@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow('Custom error message');
    });

    it('should handle 204 No Content responses', async () => {
      const result = await subscriptionsApi.unsubscribeFromFeed(1);

      expect(result).toEqual({});
    });

    it('should provide fallback error message for malformed error responses', async () => {
      server.use(
        http.get(`${API_BASE_URL}/user/me`, () => {
          return new HttpResponse('Invalid JSON', { status: 500 });
        })
      );

      await expect(authApi.getCurrentUser()).rejects.toThrow(
        'An unexpected error occurred'
      );
    });
  });
});
