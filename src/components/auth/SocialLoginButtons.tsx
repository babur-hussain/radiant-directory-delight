
import React from "react";
import { Button } from "@/components/ui/button";
import { Chrome, Loader2 } from "lucide-react";

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleLogin,
  isDisabled = false,
  isLoading = false,
}) => {
  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={onGoogleLogin}
        disabled={isDisabled || isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Chrome className="mr-2 h-5 w-5" />
        )}
        Continue with Google
      </Button>
    </div>
  );
};

export default SocialLoginButtons;
