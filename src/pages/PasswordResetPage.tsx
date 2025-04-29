
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { extractTokenFromURL, validatePasswordResetToken } from '@/features/auth/passwordResetUtils';
import { supabase } from '@/integrations/supabase/client';

// Password form schema
const passwordResetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

const PasswordResetPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Extract and validate token on page load
  useEffect(() => {
    const extractedData = extractTokenFromURL(location.search);
    const resetToken = extractedData.token;
    const tokenType = extractedData.type;
    
    const validateToken = async () => {
      if (!resetToken || tokenType !== 'recovery') {
        setIsValidToken(false);
        return;
      }
      
      setToken(resetToken);
      const isValid = await validatePasswordResetToken(resetToken);
      setIsValidToken(isValid);
      
      if (!isValid) {
        toast({
          title: "Invalid or Expired Token",
          description: "Your password reset link is invalid or has expired. Please request a new one.",
          variant: "destructive",
        });
      }
    };
    
    validateToken();
  }, [location.search, toast]);
  
  const onSubmit = async (data: PasswordResetFormData) => {
    if (!token || !isValidToken) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Update the password using Supabase's auth API
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (error) {
        throw error;
      }
      
      setIsSuccess(true);
      
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully.",
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/auth', { replace: true });
      }, 3000);
      
    } catch (error) {
      console.error("Error resetting password:", error);
      let errorMessage = "There was a problem resetting your password.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show appropriate UI based on token validation
  if (isValidToken === null) {
    // Loading state while validating token
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Validating your request...</span>
      </div>
    );
  }
  
  if (isValidToken === false) {
    // Invalid token UI
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please request a new password reset link.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Return to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (isSuccess) {
    // Success UI
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center">Password Reset Successful</CardTitle>
            <CardDescription className="text-center">
              Your password has been updated successfully.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              You will be redirected to the login page shortly.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Login Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Password reset form UI
  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter a new password to complete the reset process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your new password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetPage;
