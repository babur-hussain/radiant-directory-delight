
import React from "react";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  isDisabled?: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleLogin,
  isDisabled = false,
}) => {
  const { loginWithGoogle } = useAuth();
  
  // If no onGoogleLogin function is provided, use the default from useAuth
  const handleGoogleLogin = async () => {
    if (onGoogleLogin) {
      onGoogleLogin();
    } else if (loginWithGoogle) {
      try {
        await loginWithGoogle();
      } catch (error) {
        console.error("Google login error:", error);
      }
    }
  };

  return (
    <div className="grid gap-2">
      <Button
        variant="outline"
        type="button"
        onClick={handleGoogleLogin}
        disabled={isDisabled}
        className="w-full"
      >
        <Chrome className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
