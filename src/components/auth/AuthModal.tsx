
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
      <DialogContent className="sm:max-w-[480px] w-[95vw] max-w-[95vw] sm:w-full p-0 overflow-hidden h-[95vh] sm:h-auto sm:max-h-[90vh] bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 border-0 shadow-2xl backdrop-blur-sm flex flex-col">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-blue-400/20 to-indigo-400/20 rounded-full blur-xl"></div>
        </div>
        
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-8 pb-2 bg-transparent relative z-10 flex-shrink-0">
          <DialogTitle className="text-center text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {activeTab === 'login' ? 'Welcome Back!' : 'Join Our Community'}
          </DialogTitle>
          <p className="text-center text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">
            {activeTab === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Create your account and start your journey'
            }
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden relative z-10">
          <ScrollArea className="h-full">
            <div className="px-4 sm:px-6 pb-4 sm:pb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-1">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-md data-[state=active]:font-semibold rounded-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4 sm:space-y-6 mt-0">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
                    <SocialLoginButtons onGoogleLogin={handleGoogleLogin} />
                    
                    <div className="relative my-4 sm:my-6">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 py-1 text-gray-500 font-medium rounded-full shadow-sm">
                          Or continue with email
                        </span>
                      </div>
                    </div>
                    
                    <LoginForm 
                      onSuccess={handleAuthSuccess}
                      onSwitchToRegister={handleSwitchToRegister}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4 sm:space-y-6 mt-0">
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl border border-white/20">
                    <SocialLoginButtons onGoogleLogin={handleGoogleLogin} />
                    
                    <div className="relative my-4 sm:my-6">
                      <div className="absolute inset-0 flex items-center">
                        <Separator className="w-full bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 py-1 text-gray-500 font-medium rounded-full shadow-sm">
                          Or create account with email
                        </span>
                      </div>
                    </div>
                    
                    <RegisterForm />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
