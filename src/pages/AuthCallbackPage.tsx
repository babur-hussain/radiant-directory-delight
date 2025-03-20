
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the URL hash
      const hash = window.location.hash;
      
      try {
        if (hash) {
          // Process the OAuth callback
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing auth callback:', error);
            navigate('/auth');
            return;
          }
          
          if (data.session) {
            // Redirect to home page or dashboard
            navigate('/');
          } else {
            navigate('/auth');
          }
        } else {
          // No hash, redirect to auth page
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg">Completing authentication...</p>
    </div>
  );
};

export default AuthCallbackPage;
