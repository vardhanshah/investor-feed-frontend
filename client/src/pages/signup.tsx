import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FaGoogle, FaTwitter } from 'react-icons/fa';
import { Link, useLocation } from 'wouter';

export default function Signup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      console.error('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (!formData.acceptTerms) {
      console.error('Please accept the terms and conditions');
      setIsLoading(false);
      return;
    }
    
    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store auth token
        localStorage.setItem('authToken', data.token);
        setLocation('/dashboard');
      } else {
        console.error('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // TODO: Replace with actual Google OAuth redirect
    window.location.href = '/api/auth/google';
  };

  const handleXSignup = () => {
    // TODO: Replace with actual X OAuth redirect
    window.location.href = '/api/auth/twitter';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/">
            <span className="text-3xl font-alata font-medium text-white cursor-pointer hover:text-[hsl(280,100%,70%)] transition-colors">
              Investor Feed
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-alata text-white">
            Create your <span className="gradient-text">account</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400 font-alata">
            Already have an account?{' '}
            <Link href="/login">
              <span className="text-[hsl(280,100%,70%)] hover:text-[hsl(280,100%,80%)] cursor-pointer">
                Sign in here
              </span>
            </Link>
          </p>
        </div>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-alata text-white text-center">Join Investor Feed</CardTitle>
            <CardDescription className="text-gray-400 font-alata text-center">
              Get exclusive access to premium insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Signup Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleSignup}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 font-alata"
              >
                <FaGoogle className="mr-2 h-4 w-4" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleXSignup}
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 font-alata"
              >
                <FaTwitter className="mr-2 h-4 w-4" />
                X (Twitter)
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400 font-alata">Or continue with</span>
              </div>
            </div>

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-alata">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800 border-gray-600 text-white font-alata focus:border-[hsl(280,100%,70%)]"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-alata">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800 border-gray-600 text-white font-alata focus:border-[hsl(280,100%,70%)]"
                  placeholder="investor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-alata">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800 border-gray-600 text-white font-alata focus:border-[hsl(280,100%,70%)]"
                  placeholder="Create a strong password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white font-alata">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="bg-gray-800 border-gray-600 text-white font-alata focus:border-[hsl(280,100%,70%)]"
                  placeholder="Confirm your password"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, acceptTerms: checked === true }))
                  }
                  className="border-gray-600 data-[state=checked]:bg-[hsl(280,100%,70%)]"
                />
                <Label htmlFor="acceptTerms" className="text-sm text-gray-400 font-alata">
                  I agree to the{' '}
                  <Link href="/terms">
                    <span className="text-[hsl(280,100%,70%)] hover:underline">Terms of Service</span>
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy">
                    <span className="text-[hsl(280,100%,70%)] hover:underline">Privacy Policy</span>
                  </Link>
                </Label>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !formData.acceptTerms}
                className="w-full bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black font-alata disabled:opacity-50"
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/">
            <span className="text-sm text-gray-400 hover:text-white cursor-pointer font-alata">
              ← Back to home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}