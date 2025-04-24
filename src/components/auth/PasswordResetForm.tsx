
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
import { Loader2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

const passwordResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

interface PasswordResetFormProps {
  onCancel: () => void;
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  const form = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    setIsSubmitting(true);
    
    try {
      await resetPassword(data.email);
      
      setResetSent(true);
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

  return (
    <div className="space-y-6 py-4">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold">Reset Your Password</h3>
        <p className="text-muted-foreground mt-2">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      
      {resetSent ? (
        <Alert className="mb-4 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
          <AlertTitle>Email Sent!</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              We've sent a password reset link to your email address. Please check your inbox
              (and spam folder if you don't see it) and follow the instructions.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onCancel}
              className="mt-2"
            >
              Back to Login
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
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
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default PasswordResetForm;
