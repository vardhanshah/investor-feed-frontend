import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaGoogle } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Link, useLocation, useSearch } from 'wouter';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { AUTH_MESSAGES } from '@/lib/messages';

export default function Login() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, isLoading: authLoading, login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for OAuth error in query params
  useEffect(() => {
    const params = new URLSearchParams(search);
    const oauthError = params.get('error');
    if (oauthError) {
      setError(oauthError);
      // Clear the error from URL without triggering a reload
      window.history.replaceState({}, '', '/login');
    }
  }, [search]);

  // Redirect authenticated users to feed
  useEffect(() => {
    if (!authLoading && user) {
      setLocation('/home');
    }
  }, [user, authLoading, setLocation]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting login...');
      const response = await authApi.login({ email, password });
      console.log('Login API response:', response);

      // Store token and update auth context
      console.log('Calling login with token...');
      await login(response.access_token);
      console.log('Login completed, user should be set');

      // Show success message
      toast(AUTH_MESSAGES.LOGIN_SUCCESS);

      // Redirect to home feed
      console.log('Redirecting to /home...');
      setLocation('/home');
      console.log('setLocation called');
    } catch (err) {
      console.error('Login error:', err);
      const errorInfo = getErrorMessage(err);
      setError(errorInfo.message);

      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  const handleXLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/twitter`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/">
            <span className="text-3xl font-alata font-medium text-foreground cursor-pointer hover:text-primary transition-colors">
              Investor Feed
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-alata text-foreground">
            Sign in to your <span className="gradient-text">account</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-alata">
            Or{' '}
            <Link href="/signup">
              <span className="text-primary hover:opacity-80 cursor-pointer">
                create a new account
              </span>
            </Link>
          </p>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-alata text-foreground text-center">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground font-alata text-center">
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="bg-card border-border text-foreground hover:bg-muted font-alata"
              >
                <FaGoogle className="mr-2 h-4 w-4 text-[#4285F4]" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleXLogin}
                className="bg-card border-border text-foreground hover:bg-muted font-alata"
              >
                <FaXTwitter className="mr-2 h-4 w-4" />
                X
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-alata">Or continue with email</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/20 border-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-alata">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-alata">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-card border-border text-foreground font-alata focus:border-primary focus:ring-primary"
                  placeholder="investor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-alata">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-card border-border text-foreground font-alata focus:border-primary focus:ring-primary"
                  placeholder="Enter your password"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full gradient-bg hover:opacity-90 text-white font-alata"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="text-center">
              <Link href="/forgot-password">
                <span className="text-sm text-muted-foreground hover:text-primary cursor-pointer font-alata">
                  Forgot your password?
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer font-alata">
              &larr; Back to home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
