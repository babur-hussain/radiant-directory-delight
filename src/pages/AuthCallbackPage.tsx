
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/common/LoadingScreen';

const AuthCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Process the authentication callback
    const processAuthCallback = async () => {
      try {
        // After processing, redirect to the appropriate page
        if (isAuthenticated) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        navigate('/auth', { replace: true });
      }
    };

    processAuthCallback();
  }, [isAuthenticated, navigate, location]);

  return <LoadingScreen />;
};

export default AuthCallbackPage;
