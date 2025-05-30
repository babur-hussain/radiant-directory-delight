
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import RegistrationForm from '@/components/auth/RegistrationForm';
import LoginForm from '@/components/auth/LoginForm';

const AuthPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('register');

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
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join <span className="text-orange-600">GROW BHARAT VYAPAAR</span>
          </h1>
          <p className="text-gray-600">
            India's premier platform connecting businesses and influencers
          </p>
        </div>

        <div className="flex justify-center items-start">
          {activeTab === 'register' ? (
            <RegistrationForm
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          ) : (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setActiveTab('register')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
