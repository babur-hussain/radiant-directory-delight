
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ResetPasswordForm from './ResetPasswordForm';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: 'login' | 'register' | 'reset-password';
  callbackUrl?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onOpenChange,
  initialTab = 'login',
  callbackUrl
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const { loginWithGoogle } = useAuth();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleLoginSuccess = () => {
    toast({
      title: "Login successful!",
      description: "You are now logged in"
    });
    onOpenChange(false);
  };

  const handleRegisterSuccess = () => {
    toast({
      title: "Registration successful!",
      description: "Your account has been created"
    });
    setActiveTab('login');
  };

  const handleResetSuccess = () => {
    toast({
      title: "Password reset email sent",
      description: "Please check your email for instructions"
    });
    setActiveTab('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{activeTab === 'login' ? 'Login' : activeTab === 'register' ? 'Create an account' : 'Reset password'}</DialogTitle>
          <DialogDescription>
            {activeTab === 'login' ? 'Enter your credentials to access your account' 
             : activeTab === 'register' ? 'Fill in the information below to create your account' 
             : 'Enter your email to receive password reset instructions'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-4">
            <LoginForm 
              onSuccess={handleLoginSuccess} 
              onRegisterClick={() => setActiveTab('register')}
              onForgotPasswordClick={() => setActiveTab('reset-password')}
              callbackUrl={callbackUrl}
            />
          </TabsContent>
          <TabsContent value="register" className="mt-4">
            <RegisterForm 
              onSuccess={handleRegisterSuccess} 
              onLoginClick={() => setActiveTab('login')}
            />
          </TabsContent>
          <TabsContent value="reset-password" className="mt-4">
            <ResetPasswordForm 
              onSuccess={handleResetSuccess}
              onBackToLoginClick={() => setActiveTab('login')} 
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
