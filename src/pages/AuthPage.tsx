
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { UserRole } from '@/types/auth';
import { Chrome } from 'lucide-react';
import { getReferralIdFromURL, validateReferralId } from '@/utils/referral/referralUtils';
import { processReferralSignup } from '@/services/referralService';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AuthPage = () => {
  const { login, loginWithGoogle, signup, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('login');
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('User');
  
  // Referral state
  const [referralId, setReferralId] = useState<string>('');
  const [isValidReferral, setIsValidReferral] = useState<boolean | null>(null);
  const [referralChecking, setReferralChecking] = useState<boolean>(false);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check for referral code in URL and set the active tab to signup if found
  useEffect(() => {
    const urlReferralId = getReferralIdFromURL();
    
    if (urlReferralId) {
      setReferralId(urlReferralId);
      setActiveTab('signup');
      validateReferralCode(urlReferralId);
    }
    
    // Read the tab parameter from URL query if present
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam === 'signup' || tabParam === 'login') {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
  // Validate referral code
  const validateReferralCode = async (code: string) => {
    if (!code) {
      setIsValidReferral(null);
      return;
    }
    
    setReferralChecking(true);
    try {
      const isValid = await validateReferralId(code);
      setIsValidReferral(isValid);
    } catch (error) {
      console.error('Error validating referral code:', error);
      setIsValidReferral(false);
    } finally {
      setReferralChecking(false);
    }
  };
  
  // Handle referral code change
  const handleReferralCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    setReferralId(code);
    
    if (code) {
      validateReferralCode(code);
    } else {
      setIsValidReferral(null);
    }
  };
  
  useEffect(() => {
    // Redirect to home page if user is already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await login(loginEmail, loginPassword, employeeCode);
      // Navigation will be handled by the effect above
    } catch (error: any) {
      setError(error.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords match
    if (signupPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Check referral code if provided
    if (referralId && isValidReferral === false) {
      setError('Invalid referral code. Please check and try again.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Include referral ID in the additional data
      const additionalData = referralId ? { referralId } : undefined;
      
      // Sign up the user
      const userCredential = await signup(signupEmail, signupPassword, name, role, additionalData);
      
      // If signup successful and we have a referral code, process the referral
      if (userCredential?.user?.uid && referralId) {
        try {
          await processReferralSignup(userCredential.user.uid, referralId);
        } catch (refError) {
          console.error('Error processing referral:', refError);
          // We don't want to fail the signup if referral processing fails
        }
      }
      
      toast({
        title: 'Account created successfully',
        description: 'Please check your email to verify your account',
      });
      setActiveTab('login');
    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      
      // Include referral ID in the additional data if on signup tab
      const additionalData = activeTab === 'signup' && referralId ? { referralId } : undefined;
      
      await loginWithGoogle(additionalData);
    } catch (error: any) {
      setError(error.message || 'Failed to login with Google');
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {activeTab === 'login' ? 'Login to your account' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === 'login' 
              ? 'Enter your credentials to login to your account' 
              : 'Fill in the details below to create your account'}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLoginSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <a 
                      href="#" 
                      className="text-xs text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        toast({
                          title: 'Reset Password',
                          description: 'Please contact support to reset your password.',
                        });
                      }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input 
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employee-code">Employee Code (Optional)</Label>
                  <Input 
                    id="employee-code"
                    placeholder="If applicable"
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                  />
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || loading}
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Google
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignupSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">I am a</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business">Business Owner</SelectItem>
                      <SelectItem value="Influencer">Influencer</SelectItem>
                      <SelectItem value="User">General User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="referral-code">
                    Referral Code <span className="text-xs text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input 
                    id="referral-code"
                    placeholder="Enter referral code"
                    value={referralId}
                    onChange={handleReferralCodeChange}
                    className={
                      isValidReferral === true
                        ? "border-green-500 focus:ring-green-500"
                        : isValidReferral === false
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }
                  />
                  
                  {referralId && isValidReferral !== null && !referralChecking && (
                    <Alert className={`mt-2 ${isValidReferral ? "bg-green-50" : "bg-red-50"} p-2`}>
                      <AlertDescription className={`text-xs ${isValidReferral ? "text-green-600" : "text-red-600"}`}>
                        {isValidReferral 
                          ? "Valid referral code!" 
                          : "Invalid referral code. Please check and try again."}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {referralChecking && (
                    <p className="text-xs text-muted-foreground mt-1">Validating referral code...</p>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || loading}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>
                
                <div className="relative w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleGoogleLogin}
                  disabled={isSubmitting || loading}
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Google
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;
