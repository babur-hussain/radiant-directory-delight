
import React from 'react';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';

export interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ onGoogleLogin }) => {
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGoogleLogin}
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
