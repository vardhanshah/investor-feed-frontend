import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, type User as ApiUser } from '@/lib/api';
import { shouldLogout } from '@/lib/errorHandler';

// Extended User interface to match frontend needs
export interface User extends ApiUser {
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const fetchUser = async (token: string) => {
    try {
      const userData = await authApi.getCurrentUser();
      // Add isPremium flag (can be determined from backend later)
      const user = {
        ...userData,
        isPremium: false, // TODO: Get from backend
      };
      setUser(user);
    } catch (error) {
      console.error('[AuthContext] Error fetching user:', error);

      // Clear auth if token is invalid or refresh failed
      // The fetchWithAuth wrapper will have already attempted token refresh
      // If we're here with an error, it means refresh failed or token is truly invalid
      if (shouldLogout(error)) {
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
  };

  const login = async (token: string) => {
    setIsLoading(true);
    localStorage.setItem('authToken', token);
    await fetchUser(token);
    setIsLoading(false);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      await fetchUser(token);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout to revoke refresh token
      await authApi.logout();
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
      // Continue with local logout even if API fails
    } finally {
      // Always clear local state
      setUser(null);
      // Note: authApi.logout() already clears localStorage
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        // We have an access token - try to fetch user
        await fetchUser(token);
      } else {
        // No access token, but we might have a refresh_token cookie
        // Try to refresh to get a new access token
        try {
          const refreshResponse = await authApi.refreshToken();
          if (refreshResponse && refreshResponse.access_token) {
            // Store the new token and fetch user
            localStorage.setItem('authToken', refreshResponse.access_token);
            await fetchUser(refreshResponse.access_token);
          }
        } catch {
          // Silently fail - user is just not logged in
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Listen for storage changes (logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && !e.newValue) {
        // Token was removed in another tab - logout
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}