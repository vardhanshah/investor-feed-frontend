import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, User, Activity, MessageCircle, Heart, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  user_id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export default function UserPublicProfilePage() {
  const [match, params] = useRoute('/users/:userId');
  const [, setLocation] = useLocation();
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = params?.userId ? parseInt(params.userId) : null;

  // Check if viewing own profile
  const isOwnProfile = authUser && userId === authUser.user_id;

  useEffect(() => {
    // If viewing own profile, redirect to activity page
    if (isOwnProfile) {
      setLocation('/activity');
      return;
    }

    // Simulate loading - in reality, we'd fetch user data here
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isOwnProfile, setLocation]);

  const getInitials = (id: number) => {
    return `U${id}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => setLocation('/home')}
              className="text-foreground hover:bg-muted font-alata"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Feed
            </Button>
            <h1 className="text-xl font-alata text-foreground">User Profile</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Header */}
        <Card className="bg-gradient-to-br bg-card border-border mb-6">
          <CardContent className="p-8">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] flex items-center justify-center text-black font-alata font-bold text-3xl">
                U
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-alata text-foreground mb-2">
                  User #{userId}
                </h2>
                <p className="text-muted-foreground font-alata">
                  Public user profile
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-gray-900 to-black border-yellow-700 border-2">
          <CardHeader>
            <CardTitle className="text-yellow-500 font-alata flex items-center">
              <Info className="h-5 w-5 mr-2" />
              Backend Endpoint Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground font-alata">
              To display full user profile information and activity, the backend needs to implement
              the following endpoint:
            </p>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-[hsl(280,100%,70%)] font-mono text-sm mb-2">
                GET /users/{'{user_id}'}
              </p>
              <p className="text-muted-foreground text-sm font-alata">
                This endpoint should return:
              </p>
              <ul className="list-disc list-inside text-foreground text-sm font-alata mt-2 space-y-1">
                <li>User ID</li>
                <li>Full name</li>
                <li>Email (optional, for privacy)</li>
                <li>Account creation date</li>
                <li>User's comments (optional)</li>
                <li>User's posts (if applicable)</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg border border-border">
              <p className="text-muted-foreground text-sm font-alata mb-2">
                Additionally, to improve UX, the comments API response should include user
                information:
              </p>
              <p className="text-[hsl(280,100%,70%)] font-mono text-sm mb-2">
                GET /posts/{'{post_id}'}/comments
              </p>
              <p className="text-muted-foreground text-sm font-alata">
                Currently returns: <code className="text-foreground">user_id</code>
              </p>
              <p className="text-muted-foreground text-sm font-alata mt-1">
                Should also include: <code className="text-foreground">user_name</code>, <code className="text-foreground">user_email</code> (optional)
              </p>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-foreground font-alata font-medium mb-2">Current Implementation</h3>
              <p className="text-muted-foreground text-sm font-alata">
                For now, the UI shows "User #{userId}" in comments. Once the backend endpoint
                is implemented, this page will display:
              </p>
              <ul className="list-disc list-inside text-foreground text-sm font-alata mt-2 space-y-1">
                <li>User profile information</li>
                <li>User's recent comments</li>
                <li>User's activity statistics</li>
                <li>Join date and other metadata</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Activity Placeholder */}
        <Tabs defaultValue="overview" className="space-y-6 mt-6">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="overview" className="font-alata">
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="comments" className="font-alata">
              <MessageCircle className="h-4 w-4 mr-2" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="activity" className="font-alata">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-gradient-to-br bg-card border-border">
              <CardContent className="p-12 text-center">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-alata text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground font-alata">
                  User profile information will be displayed here once the backend endpoint is implemented
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6">
            <Card className="bg-gradient-to-br bg-card border-border">
              <CardContent className="p-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-alata text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground font-alata">
                  User's comments and interactions will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-gradient-to-br bg-card border-border">
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-alata text-foreground mb-2">Coming Soon</h3>
                <p className="text-muted-foreground font-alata">
                  User's activity timeline will be displayed here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
