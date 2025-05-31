
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SocialLoginButtons from './SocialLoginButtons';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'register';
  redirectUrl?: string;
}

const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onOpenChange,
  defaultTab = 'login',
  redirectUrl,
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const { isAuthenticated, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Close modal and redirect if user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && open) {
      onOpenChange(false);
      if (redirectUrl) {
        navigate(redirectUrl);
      }
    }
  }, [isAuthenticated, open, onOpenChange, navigate, redirectUrl]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      if (redirectUrl) {
        navigate(redirectUrl);
      }
    } catch (error) {
      console.error('Error logging in with Google:', error);
    }
  };

  const handleAuthSuccess = () => {
    onOpenChange(false);
    if (redirectUrl) {
      navigate(redirectUrl);
    }
  };

  const handleSwitchToRegister = () => {
    setActiveTab('register');
  };

  const handleSwitchToLogin = () => {
    setActiveTab('login');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] max-w-[95vw] sm:w-full p-0 overflow-hidden max-h-[95vh] sm:max-h-[90vh] bg-white border-0 shadow-2xl">
        <DialogHeader className="px-4 pt-4 pb-0 bg-white">
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold text-gray-900">
            {activeTab === 'login' ? 'Welcome Back' : 'Create an Account'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(95vh-80px)] sm:max-h-[calc(90vh-120px)] bg-white">
          <div className="px-4 pb-4 bg-white">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-white">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-white">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-0">
                <SocialLoginButtons onGoogleLogin={handleGoogleLogin} />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <LoginForm 
                  onSuccess={handleAuthSuccess}
                  onSwitchToRegister={handleSwitchToRegister}
                />
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-0 pt-0">
                <SocialLoginButtons onGoogleLogin={handleGoogleLogin} />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
