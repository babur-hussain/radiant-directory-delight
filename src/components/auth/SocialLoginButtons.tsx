
import React from "react";
import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  isDisabled?: boolean;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGoogleLogin,
  isDisabled = false,
}) => {
  return (
    <div className="grid gap-2">
      <Button
        variant="outline"
        type="button"
        onClick={onGoogleLogin}
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
