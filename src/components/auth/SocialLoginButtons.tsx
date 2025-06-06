
import React from 'react';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

export interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onGoogleLogin }) => {
  const handleGoogleLogin = async () => {
    try {
      await onGoogleLogin();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full py-2.5 text-sm sm:text-base"
        onClick={handleGoogleLogin}
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
