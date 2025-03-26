import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { normalizeRole } from '@/types/auth';

const AuthPage = () => {
  const { login, signup, currentUser, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const redirectPath = location.state?.from || '/';

  useEffect(() => {
    if (currentUser) {
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, navigate, redirectPath]);

  const handleLoginSubmit = async (data: any) => {
    setIsSubmitting(true);
    setLoginError(null);
    try {
      await login(data.email, data.password, data.employeeCode);
      navigate(redirectPath || '/');
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoginError(error.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSignupError(null);
    try {
      const userData = {
        ...data,
        role: normalizeRole(data.role) // Normalize the role
      };
      
      const user = await signup(
        data.email,
        data.password,
        userData
      );
      
      if (user) {
        navigate(redirectPath || '/');
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      setSignupError(error.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    setIsSubmitting(true);
    setResetError(null);
    try {
      const success = await resetPassword(email);
      if (success) {
        setResetEmailSent(true);
        setResetEmail(email);
      } else {
        setResetError('Failed to send reset email. Please try again.');
      }
    } catch (error: any) {
      console.error("Reset password failed:", error);
      setResetError(error.message || 'Failed to send reset email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Authentication</CardTitle>
          <CardDescription className="text-center">
            {showResetPassword
              ? 'Reset your password'
              : 'Enter your credentials to access your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!showResetPassword ? (
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm
                  onSubmit={handleLoginSubmit}
                  isSubmitting={isSubmitting}
                  error={loginError}
                  onResetPassword={() => setShowResetPassword(true)}
                />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm
                  onSubmit={handleSignupSubmit}
                  isSubmitting={isSubmitting}
                  error={signupError}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <ResetPasswordForm
              onSubmit={handleResetPassword}
              isSubmitting={isSubmitting}
              error={resetError}
              emailSent={resetEmailSent}
              email={resetEmail}
              onBackToLogin={() => setShowResetPassword(false)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
