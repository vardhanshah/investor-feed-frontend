import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FaGoogle, FaTwitter } from 'react-icons/fa';
import { CheckCircle, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Validation helper functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('At least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('One number');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('One special character');
  
  return { isValid: errors.length === 0, errors };
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s\-']+$/.test(name);
};

export default function Signup() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationState, setValidationState] = useState({
    email: { isValid: false, message: '' },
    name: { isValid: false, message: '' },
    password: { isValid: false, errors: [] as string[] },
    confirmPassword: { isValid: false, message: '' },
    canSubmit: false,
  });

  // Redirect authenticated users to feed
  useEffect(() => {
    if (!authLoading && user) {
      setLocation('/home');
    }
  }, [user, authLoading, setLocation]);

  // Real-time validation effect
  useEffect(() => {
    const newValidationState = {
      email: {
        isValid: formData.email.length > 0 && validateEmail(formData.email),
        message: formData.email.length > 0 && !validateEmail(formData.email) ? 'Please enter a valid email address' : '',
      },
      name: {
        isValid: validateName(formData.name),
        message: formData.name.length > 0 && !validateName(formData.name) ? 'Name must be at least 2 characters and contain only letters, spaces, hyphens, and apostrophes' : '',
      },
      password: validatePassword(formData.password),
      confirmPassword: {
        isValid: formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword,
        message: formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword ? 'Passwords do not match' : '',
      },
      canSubmit: false,
    };

    // Check if all fields are valid and terms are accepted
    newValidationState.canSubmit = 
      newValidationState.email.isValid &&
      newValidationState.name.isValid &&
      newValidationState.password.isValid &&
      newValidationState.confirmPassword.isValid &&
      formData.acceptTerms;

    setValidationState(newValidationState);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Frontend validation check before API call
    if (!validationState.canSubmit) {
      console.error('Please fix all validation errors before submitting');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        full_name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });

      // Show success message
      toast({
        title: 'Account Created!',
        description: `Welcome, ${formData.name}! Please log in to continue.`,
      });

      // Redirect to login page
      setLocation('/login');
    } catch (error) {
      const errorInfo = getErrorMessage(error);

      toast({
        variant: 'destructive',
        title: errorInfo.title,
        description: errorInfo.message,
      });

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(280,100%,70%)]" />
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
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white font-alata flex items-center">
                  Full Name
                  {formData.name && (
                    validationState.name.isValid ? 
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500" /> :
                      <XCircle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`bg-gray-800 border-gray-600 text-white font-alata focus:border-[hsl(280,100%,70%)] ${
                    formData.name && !validationState.name.isValid ? 'border-red-500' : 
                    formData.name && validationState.name.isValid ? 'border-green-500' : ''
                  }`}
                  placeholder="John Doe"
                />
                {validationState.name.message && (
                  <p className="text-red-400 text-sm font-alata">{validationState.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-alata flex items-center">
                  Email
                  {formData.email && (
                    validationState.email.isValid ? 
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500" /> :
                      <XCircle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`bg-gray-800 border-gray-600 text-white font-alata focus:border-[hsl(280,100%,70%)] ${
                    formData.email && !validationState.email.isValid ? 'border-red-500' : 
                    formData.email && validationState.email.isValid ? 'border-green-500' : ''
                  }`}
                  placeholder="investor@example.com"
                />
                {validationState.email.message && (
                  <p className="text-red-400 text-sm font-alata">{validationState.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-alata flex items-center">
                  Password
                  {formData.password && (
                    validationState.password.isValid ? 
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500" /> :
                      <XCircle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`bg-gray-800 border-gray-600 text-white font-alata focus:border-[hsl(280,100%,70%)] pr-10 ${
                      formData.password && !validationState.password.isValid ? 'border-red-500' : 
                      formData.password && validationState.password.isValid ? 'border-green-500' : ''
                    }`}
                    placeholder="Create a strong password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="grid grid-cols-2 gap-1 text-xs font-alata">
                      {validationState.password.errors.map((error, index) => (
                        <div key={index} className="flex items-center text-red-400">
                          <XCircle className="mr-1 h-3 w-3" />
                          {error}
                        </div>
                      ))}
                      {validationState.password.isValid && (
                        <div className="col-span-2 flex items-center text-green-400">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Password meets all requirements
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white font-alata flex items-center">
                  Confirm Password
                  {formData.confirmPassword && (
                    validationState.confirmPassword.isValid ? 
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500" /> :
                      <XCircle className="ml-2 h-4 w-4 text-red-500" />
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className={`bg-gray-800 border-gray-600 text-white font-alata focus:border-[hsl(280,100%,70%)] pr-10 ${
                      formData.confirmPassword && !validationState.confirmPassword.isValid ? 'border-red-500' : 
                      formData.confirmPassword && validationState.confirmPassword.isValid ? 'border-green-500' : ''
                    }`}
                    placeholder="Confirm your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationState.confirmPassword.message && (
                  <p className="text-red-400 text-sm font-alata">{validationState.confirmPassword.message}</p>
                )}
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
              
              {/* Form Status Indicator */}
              {!validationState.canSubmit && formData.name && formData.email && formData.password && formData.confirmPassword && (
                <Alert className="bg-yellow-900/20 border-yellow-600">
                  <AlertDescription className="text-yellow-200 font-alata text-sm">
                    Please complete all validation requirements before submitting
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading || !validationState.canSubmit}
                className={`w-full font-alata transition-all duration-200 ${
                  validationState.canSubmit 
                    ? 'bg-gradient-to-r from-[hsl(280,100%,70%)] to-[hsl(200,100%,70%)] hover:from-[hsl(280,100%,75%)] hover:to-[hsl(200,100%,75%)] text-black' 
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </span>
                ) : validationState.canSubmit ? (
                  'Create account'
                ) : (
                  'Complete form to continue'
                )}
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