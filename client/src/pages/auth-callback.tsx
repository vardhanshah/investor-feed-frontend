import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

function getErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    invalid_state: 'Authentication session expired. Please try again.',
    token_exchange_failed: 'Failed to authenticate. Please try again.',
    user_creation_failed: 'Failed to create account. Please try again.',
    account_exists_unverified: 'An account with this email already exists. Please login with your password.',
    link_failed: 'Failed to link account. Please try again.',
  };
  return messages[errorCode] || 'Authentication failed. Please try again.';
}

export default function AuthCallback() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { login } = useAuth();
  const [status, setStatus] = useState<'processing' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    const error = params.get('error');
    const message = params.get('message');

    const handleAuth = async () => {
      if (token) {
        try {
          // Store the token via auth context
          await login(token);
          // Redirect to home feed
          setLocation('/home', { replace: true });
        } catch (err) {
          console.error('Failed to process auth callback:', err);
          setStatus('error');
          setErrorMessage('Failed to complete authentication. Please try again.');
        }
      } else if (error) {
        // Handle error - show briefly then redirect to login with error
        const errorMsg = message || getErrorMessage(error);
        setStatus('error');
        setErrorMessage(errorMsg);

        // Redirect to home with error after a brief delay
        setTimeout(() => {
          setLocation(`/?error=${encodeURIComponent(errorMsg)}`, { replace: true });
        }, 1500);
      } else {
        // No token or error - invalid callback
        setStatus('error');
        setErrorMessage('Invalid authentication callback.');
        setTimeout(() => {
          setLocation('/', { replace: true });
        }, 1500);
      }
    };

    handleAuth();
  }, [search, login, setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        {status === 'processing' ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-[hsl(280,100%,70%)] mx-auto" />
            <p className="text-foreground font-alata text-lg">Completing authentication...</p>
          </>
        ) : (
          <>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <p className="text-foreground font-alata text-lg">{errorMessage}</p>
            <p className="text-muted-foreground font-alata text-sm">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
