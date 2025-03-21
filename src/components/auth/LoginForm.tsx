
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MailCheck, Lock, Loader2, IdCard, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SocialLoginButtons from "./SocialLoginButtons";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { isDefaultAdminEmail, DEFAULT_ADMIN_EMAIL } from "@/types/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  employeeCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLogin: (email: string, password: string, employeeCode?: string) => Promise<void>;
  onClose: () => void;
}

// Known demo credentials - WARNING: Only for development!
const DEMO_CREDENTIALS = {
  email: DEFAULT_ADMIN_EMAIL,
  password: "Rocky312" // Make sure this matches what's set in Supabase
};

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const { toast } = useToast();
  const { loginWithGoogle, currentUser } = useAuth();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      employeeCode: "",
    },
  });

  // Check if user is already logged in
  useEffect(() => {
    if (currentUser) {
      console.log("User is already logged in:", currentUser.email);
      toast({
        title: "Already logged in",
        description: `You are already logged in as ${currentUser.email}`,
      });
      onClose();
    }
  }, [currentUser, onClose, toast]);

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setEmailError(null);
    
    console.log("Login form submitted for:", data.email);
    
    try {
      await onLogin(data.email, data.password, data.employeeCode || undefined);
      
      console.log("Login successful, showing toast and closing modal");
      toast({
        title: "Login successful",
        description: isDefaultAdminEmail(data.email) 
          ? "Welcome to the admin dashboard!" 
          : "Welcome back!",
      });
      
      onClose();
    } catch (error) {
      console.error("Login form error:", error);
      
      // Check for email confirmation error
      if (error instanceof Error && error.message.includes("Email not confirmed")) {
        console.log("Email verification required, showing resend option");
        setEmailError(data.email);
        toast({
          title: "Email verification required",
          description: "Please check your inbox for a verification email",
          variant: "default",
        });
      } else {
        toast({
          title: "Login failed",
          description: error instanceof Error ? error.message : "Invalid credentials",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      console.log("Initiating Google login");
      await loginWithGoogle();
      console.log("Google login successful, closing modal");
      onClose();
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: error instanceof Error ? error.message : "Failed to authenticate with Google",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resendVerificationEmail = async () => {
    if (!emailError) return;
    
    setResendingEmail(true);
    try {
      console.log("Resending verification email to:", emailError);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailError,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification link",
      });
    } catch (error) {
      console.error("Error resending verification email:", error);
      toast({
        title: "Failed to resend verification email",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setResendingEmail(false);
    }
  };

  // Is this the default admin email?
  const isAdminEmail = isDefaultAdminEmail(form.watch('email'));

  // Auto-fill admin email and password for demo purposes
  React.useEffect(() => {
    // Only set default values if the form is empty
    if (!form.getValues("email") && !form.getValues("password")) {
      // Set the default admin email
      form.setValue("email", DEMO_CREDENTIALS.email);
      // For demo, set the correct password
      form.setValue("password", DEMO_CREDENTIALS.password);
    }
  }, [form]);

  return (
    <div className="space-y-6 py-4">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold">Welcome Back</h3>
        <p className="text-muted-foreground mt-2">
          Log in to access your account
        </p>
      </div>
      
      {emailError && (
        <Alert className="mb-4">
          <AlertTitle>Email verification required</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Please check your inbox for a verification email sent to{" "}
              <strong>{emailError}</strong>.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resendVerificationEmail}
              disabled={resendingEmail}
              className="mt-2"
            >
              {resendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend verification email
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {isAdminEmail && (
        <Alert variant="default" className="mb-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <AlertTitle>Admin Account Detected</AlertTitle>
          <AlertDescription>
            You're logging in with the default admin account. For demo purposes, the password has been pre-filled.
          </AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                    />
                    <MailCheck className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-xs"
                    type="button"
                    onClick={() => {
                      toast({
                        title: "Reset password",
                        description: "Password reset feature coming soon!",
                      });
                    }}
                  >
                    Forgot password?
                  </Button>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                    />
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employeeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <IdCard className="h-4 w-4" />
                  Employee Code (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter employee code if applicable"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </Form>

      <div className="relative my-6">
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
        isDisabled={isSubmitting}
      />
    </div>
  );
};

export default LoginForm;
