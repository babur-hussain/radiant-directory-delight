
import React, { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, CheckCircle, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (isSubmitting || !canResend) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Sending password reset email to:', data.email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        console.error('Password reset error:', error);
        throw error;
      }
      
      console.log('Password reset email sent successfully');
      setEmailSent(true);
      setSentEmail(data.email);
      startCountdown();
      
      toast({
        title: "Reset email sent! 📧",
        description: "Check your inbox for the password reset link",
      });
    } catch (error: any) {
      console.error("Password reset error:", error);
      
      let errorMessage = "Failed to send password reset email";
      
      if (error.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('user not found')) {
          errorMessage = "No account found with this email address";
        } else if (errorMsg.includes('too many requests')) {
          errorMessage = "Too many requests. Please try again later";
        } else if (errorMsg.includes('network')) {
          errorMessage = "Network error. Please check your connection";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = () => {
    if (canResend && sentEmail) {
      form.setValue('email', sentEmail);
      onSubmit({ email: sentEmail });
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Check Your Email</h3>
          <p className="text-gray-600 mt-2">
            We've sent a password reset link to <strong className="text-gray-900">{sentEmail}</strong>
          </p>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200">
          <Mail className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-900">Next Steps</AlertTitle>
          <AlertDescription className="text-blue-800 space-y-2">
            <p>1. Check your email inbox (and spam folder)</p>
            <p>2. Click on the password reset link</p>
            <p>3. Create your new password</p>
            <p className="text-sm text-blue-600 mt-2">
              The link will expire in 1 hour for security reasons.
            </p>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleResendEmail}
            disabled={!canResend || isSubmitting}
            variant="outline"
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : !canResend ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Resend in {countdown}s
              </>
            ) : (
              <>
                <RotateCcw className="mr-2 h-4 w-4" />
                Resend Email
              </>
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => {
              setEmailSent(false);
              setSentEmail("");
              setCanResend(true);
              setCountdown(0);
              form.reset();
            }}
            className="w-full"
          >
            Use Different Email
          </Button>
          
          <Button 
            variant="outline" 
            onClick={onBackToLogin}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center mb-6">
        <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Reset Your Password</h3>
        <p className="text-gray-600 mt-2">
          Enter your email address and we'll send you a secure link to reset your password
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                <FormControl>
                  <div className="relative group">
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      autoComplete="email"
                      {...field}
                      className="pl-12 h-12 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 group-hover:border-gray-300"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 mt-6">
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isSubmitting || !form.formState.isValid || !canResend}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={onBackToLogin}
              className="w-full h-12 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
