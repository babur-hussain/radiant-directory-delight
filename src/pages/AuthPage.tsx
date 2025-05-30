
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import RegistrationForm from '@/components/auth/RegistrationForm';
import LoginForm from '@/components/auth/LoginForm';

const AuthPage = () => {
  const { isAuthenticated, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'login' || tab === 'register') {
      setActiveTab(tab);
    }
    
    // Check for referral code - if present, default to register
    const ref = searchParams.get('ref');
    if (ref) {
      setActiveTab('register');
    }
  }, [location.search]);

  const handleAuthSuccess = () => {
    toast({
      title: "Success!",
      description: "You have been successfully authenticated.",
    });
    navigate('/');
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      await resetPassword(resetEmail);
      setShowForgotPassword(false);
      setResetEmail('');
      toast({
        title: "Reset email sent",
        description: "Please check your inbox for password reset instructions.",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message || "Failed to send reset email.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="container flex items-center justify-center min-h-screen py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="text-gray-600 mt-2">
              Enter your email address and we'll send you a reset link.
            </p>
          </div>
          
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            <div className="flex space-x-3">
              <button
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isResetting ? 'Sending...' : 'Send Reset Link'}
              </button>
              
              <button
                onClick={() => setShowForgotPassword(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-6xl h-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join <span className="text-orange-600">GROW BHARAT VYAPAAR</span>
          </h1>
          <p className="text-gray-600">
            India's premier platform connecting businesses and influencers
          </p>
        </div>

        <div className="flex justify-center items-start min-h-[80vh]">
          {activeTab === 'register' ? (
            <RegistrationForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          ) : (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setActiveTab('register')}
              onForgotPassword={() => setShowForgotPassword(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
