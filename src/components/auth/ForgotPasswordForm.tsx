
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
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
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
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setEmailSent(true);
      setSentEmail(data.email);
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for the password reset link",
      });
    } catch (error) {
      console.error("Password reset error:", error);
      toast({
        title: "Failed to send password reset email",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold">Check Your Email</h3>
          <p className="text-muted-foreground mt-2">
            We've sent a password reset link to <strong>{sentEmail}</strong>
          </p>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
          <Mail className="h-4 w-4" />
          <AlertTitle>Next Steps</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>1. Check your email inbox (and spam folder)</p>
            <p>2. Click on the password reset link</p>
            <p>3. Create your new password</p>
            <p className="text-sm text-muted-foreground mt-2">
              The link will expire in 1 hour for security reasons.
            </p>
          </AlertDescription>
        </Alert>

        <div className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            onClick={onBackToLogin}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => {
              setEmailSent(false);
              setSentEmail("");
              form.reset();
            }}
            className="w-full"
          >
            Send to Different Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold">Reset Your Password</h3>
        <p className="text-muted-foreground mt-2">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      {...field}
                      className="pl-10"
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 mt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !form.formState.isValid}
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
              className="w-full"
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
