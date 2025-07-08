
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SocialLoginButtons from './SocialLoginButtons';
import { Separator } from '@/components/ui/separator';

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
  const [modalTop, setModalTop] = useState(80); // default fallback

  useEffect(() => {
    function updateModalTop() {
      const header = document.querySelector('.main-header');
      const headerHeight = header ? header.offsetHeight : 64;
      setModalTop(headerHeight + 16); // 16px gap
    }
    updateModalTop();
    window.addEventListener('resize', updateModalTop);
    return () => window.removeEventListener('resize', updateModalTop);
  }, []);

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
      <DialogContent
        style={{
          top: `${modalTop}px`,
          transform: 'translate(-50%, 0)', // Remove vertical centering
        }}
        className="max-w-md w-[95vw] sm:w-full p-0 max-h-[95vh] bg-white border shadow-2xl overflow-hidden flex flex-col"
      >
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b bg-white">
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            {activeTab === 'login' ? 'Welcome Back!' : 'Join Our Community'}
          </DialogTitle>
          <p className="text-center text-gray-600 text-sm mt-2">
            {activeTab === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Create your account and start your journey'
            }
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-6 mt-0">
                <div className="bg-gray-50 rounded-xl p-6">
                  <SocialLoginButtons onGoogleLogin={handleGoogleLogin} />
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-50 px-4 py-1 text-gray-500 font-medium">
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
              
              <TabsContent value="register" className="space-y-6 mt-0">
                <div className="bg-gray-50 rounded-xl p-6">
                  <SocialLoginButtons onGoogleLogin={handleGoogleLogin} />
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-gray-50 px-4 py-1 text-gray-500 font-medium">
                        Or create account with email
                      </span>
                    </div>
                  </div>
                  
                  <RegisterForm />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
