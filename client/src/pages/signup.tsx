import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { FaGoogle } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { CheckCircle, XCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { authApi } from '@/lib/api';
import { getErrorMessage } from '@/lib/errorHandler';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
        message: formData.name.length > 0 && !validateName(formData.name) ? 'Name must be at least 2 characters' : '',
      },
      password: validatePassword(formData.password),
      confirmPassword: {
        isValid: formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword,
        message: formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword ? 'Passwords do not match' : '',
      },
      canSubmit: false,
    };

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
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleXSignup = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
    window.location.href = `${backendUrl}/api/auth/twitter`;
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
            Create your <span className="gradient-text">account</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground font-alata">
            Already have an account?{' '}
            <Link href="/login">
              <span className="text-primary hover:opacity-80 cursor-pointer">
                Sign in here
              </span>
            </Link>
          </p>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-alata text-foreground text-center">Join Investor Feed</CardTitle>
            <CardDescription className="text-muted-foreground font-alata text-center">
              Get access to real-time market updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Signup Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleGoogleSignup}
                className="bg-card border-border text-foreground hover:bg-muted font-alata"
              >
                <FaGoogle className="mr-2 h-4 w-4 text-[#4285F4]" />
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleXSignup}
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

            {/* Email Signup Form */}
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-alata flex items-center">
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
                  className={`bg-card border-border text-foreground font-alata focus:border-primary focus:ring-primary ${
                    formData.name && !validationState.name.isValid ? 'border-red-500' :
                    formData.name && validationState.name.isValid ? 'border-green-500' : ''
                  }`}
                  placeholder="John Doe"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-alata flex items-center">
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
                  className={`bg-card border-border text-foreground font-alata focus:border-primary focus:ring-primary ${
                    formData.email && !validationState.email.isValid ? 'border-red-500' :
                    formData.email && validationState.email.isValid ? 'border-green-500' : ''
                  }`}
                  placeholder="investor@example.com"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-alata flex items-center">
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
                    className={`bg-card border-border text-foreground font-alata focus:border-primary focus:ring-primary pr-10 ${
                      formData.password && !validationState.password.isValid ? 'border-red-500' :
                      formData.password && validationState.password.isValid ? 'border-green-500' : ''
                    }`}
                    placeholder="Create a strong password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {formData.password && !validationState.password.isValid && (
                  <div className="grid grid-cols-2 gap-1 text-xs font-alata">
                    {validationState.password.errors.map((error, index) => (
                      <div key={index} className="flex items-center text-red-500">
                        <XCircle className="mr-1 h-3 w-3" />
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-alata flex items-center">
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
                    className={`bg-card border-border text-foreground font-alata focus:border-primary focus:ring-primary pr-10 ${
                      formData.confirmPassword && !validationState.confirmPassword.isValid ? 'border-red-500' :
                      formData.confirmPassword && validationState.confirmPassword.isValid ? 'border-green-500' : ''
                    }`}
                    placeholder="Confirm your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {validationState.confirmPassword.message && (
                  <p className="text-red-500 text-sm font-alata">{validationState.confirmPassword.message}</p>
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
                  className="border-border data-[state=checked]:bg-primary"
                />
                <Label htmlFor="acceptTerms" className="text-sm text-muted-foreground font-alata">
                  I agree to the{' '}
                  <Link href="/terms">
                    <span className="text-primary hover:underline">Terms of Service</span>
                  </Link>
                  {' '}and{' '}
                  <Link href="/privacy">
                    <span className="text-primary hover:underline">Privacy Policy</span>
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !validationState.canSubmit}
                className={`w-full font-alata transition-all duration-200 ${
                  validationState.canSubmit
                    ? 'gradient-bg hover:opacity-90 text-white'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Creating account...' : validationState.canSubmit ? 'Create account' : 'Complete form to continue'}
              </Button>
            </form>
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
