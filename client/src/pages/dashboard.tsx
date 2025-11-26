import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FaTwitter, FaSignOutAlt, FaUser, FaCog } from 'react-icons/fa';
import { Bell, TrendingUp, FileText, Calendar } from 'lucide-react';
import { useLocation } from 'wouter';
import { formatLocalizedDate } from '@/lib/dateUtils';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  joinedDate: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      setLocation('/login');
      return;
    }

    // TODO: Replace with actual API call to get user data
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          // Token invalid, redirect to login
          localStorage.removeItem('authToken');
          setLocation('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // For demo purposes, set a mock user
        setUser({
          id: '1',
          name: 'John Investor',
          email: 'john@example.com',
          isPremium: false,
          joinedDate: '2025-01-01',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white font-alata">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-alata font-medium text-white">
                Investor Feed
              </span>
              {user.isPremium && (
                <Badge className="ml-2 bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] text-black">
                  Premium
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                <FaCog className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-white hover:bg-gray-800 font-alata"
              >
                <FaSignOutAlt className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-alata text-white mb-2">
            Welcome back, <span className="gradient-text">{user.name.split(' ')[0]}</span>!
          </h1>
          <p className="text-gray-400 font-alata">
            Stay ahead with your personalized market intelligence dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-alata text-gray-400">Today's Updates</CardTitle>
              <TrendingUp className="h-4 w-4 text-[hsl(280,100%,70%)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-alata text-white font-bold">12</div>
              <p className="text-xs text-gray-400 font-alata">+3 from yesterday</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-alata text-gray-400">Insights Read</CardTitle>
              <FileText className="h-4 w-4 text-[hsl(200,100%,70%)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-alata text-white font-bold">47</div>
              <p className="text-xs text-gray-400 font-alata">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-alata text-gray-400">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-[hsl(320,100%,75%)]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-alata text-white font-bold">
                {formatLocalizedDate(user.joinedDate, { month: 'short', year: 'numeric' })}
              </div>
              <p className="text-xs text-gray-400 font-alata">Active member</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Updates */}
          <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-alata text-white">Latest Market Updates</CardTitle>
              <CardDescription className="text-gray-400 font-alata">
                Personalized insights based on your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-alata text-white font-medium">RELIANCE Q3 Results</h4>
                  <Badge variant="outline" className="text-xs">2 min ago</Badge>
                </div>
                <p className="text-sm text-gray-300 font-alata">
                  Quarterly earnings beat expectations with 15% growth in petrochemicals segment.
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-alata text-white font-medium">TCS Buyback Announcement</h4>
                  <Badge variant="outline" className="text-xs">5 min ago</Badge>
                </div>
                <p className="text-sm text-gray-300 font-alata">
                  Board approves ₹18,000 crore buyback program at ₹4,150 per share.
                </p>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-alata text-white font-medium">HDFC Bank Credit Growth</h4>
                  <Badge variant="outline" className="text-xs">12 min ago</Badge>
                </div>
                <p className="text-sm text-gray-300 font-alata">
                  Retail credit portfolio grows 18% YoY, maintaining asset quality metrics.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Premium Upgrade / Social */}
          <div className="space-y-6">
            {!user.isPremium && (
              <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-xl font-alata text-white">Upgrade to Premium</CardTitle>
                  <CardDescription className="text-gray-300 font-alata">
                    Get exclusive insights and real-time alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center text-sm text-gray-300 font-alata">
                      <span className="w-2 h-2 bg-[hsl(280,100%,70%)] rounded-full mr-2"></span>
                      Real-time push notifications
                    </li>
                    <li className="flex items-center text-sm text-gray-300 font-alata">
                      <span className="w-2 h-2 bg-[hsl(200,100%,70%)] rounded-full mr-2"></span>
                      Advanced market analysis
                    </li>
                    <li className="flex items-center text-sm text-gray-300 font-alata">
                      <span className="w-2 h-2 bg-[hsl(320,100%,75%)] rounded-full mr-2"></span>
                      Priority customer support
                    </li>
                  </ul>
                  <Button className="w-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata">
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl font-alata text-white">Follow Us on X</CardTitle>
                <CardDescription className="text-gray-400 font-alata">
                  Get updates directly on your timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="mb-4">
                    <div className="text-3xl font-alata text-white font-bold">6K+</div>
                    <div className="text-sm text-gray-400 font-alata">Active followers</div>
                  </div>
                  <a
                    href="https://twitter.com/_Investor_Feed_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata rounded-lg transition-all duration-200"
                  >
                    <FaTwitter className="mr-2" />
                    Follow @_Investor_Feed_
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}