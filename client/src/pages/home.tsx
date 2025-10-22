import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Follow from "@/components/Follow";
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to feed
  useEffect(() => {
    if (!isLoading && user) {
      setLocation('/home');
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
      </div>
    );
  }

  // Don't show home page to authenticated users (they'll be redirected)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Follow />
    </div>
  );
}
