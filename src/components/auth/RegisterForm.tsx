
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SocialLoginButtons from "./SocialLoginButtons";
import { saveUserToAllUsersList } from "@/features/auth/authStorage";

interface RegisterFormProps {
  registerType: UserRole;
  onBack: () => void;
  onClose: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ registerType, onBack, onClose }) => {
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { signup, loginWithGoogle, loading } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerType) {
      toast({
        title: "Registration error",
        description: "Please select a registration type.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const user = await signup(registerEmail, registerPassword, registerName, registerType);
      
      // Ensure new user is added to the admin dashboard list
      if (user) {
        saveUserToAllUsersList({
          id: user.id,
          email: registerEmail,
          name: registerName,
          role: registerType,
          isAdmin: false
        });
      }
      
      onClose();
    } catch (error) {
      // Error handling is in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      // When using Google login, we still need to set the role
      const result = await loginWithGoogle();
      
      // The Google login doesn't directly accept a role, so we need to handle it
      // Get the current user
      const user = useAuth().user;
      if (user && !user.role) {
        // Set the role in localStorage
        localStorage.setItem(`user_role_${user.id}`, registerType as string);
        
        // Save to all users list for admin dashboard
        saveUserToAllUsersList({
          id: user.id,
          email: user.email,
          name: user.name || "Google User",
          role: registerType,
          isAdmin: false
        });
      }
      
      onClose();
    } catch (error) {
      // Error handling is in the context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-name"
            type="text"
            placeholder="John Doe"
            className="pl-10"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            className="pl-10"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={isSubmitting || loading}
        >
          {(isSubmitting || loading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </Button>
      </div>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <SocialLoginButtons
        onGoogleLogin={handleGoogleLogin}
        isDisabled={isSubmitting || loading}
      />
    </form>
  );
};

export default RegisterForm;
