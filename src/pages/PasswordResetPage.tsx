
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, CheckCircle } from "lucide-react";

const passwordResetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordResetData = z.infer<typeof passwordResetSchema>;

const PasswordResetPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if the URL has the necessary token parameters
  const hasValidParams = searchParams.has('type') && searchParams.has('access_token');

  const form = useForm<PasswordResetData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!hasValidParams) {
      setError("Invalid or missing reset parameters. Please request a new password reset link.");
    }
  }, [hasValidParams]);

  const handlePasswordChange = async (data: PasswordResetData) => {
    if (!hasValidParams) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        throw updateError;
      }

      setResetComplete(true);
      toast({
        title: "Password reset successful",
        description: "Your password has been updated.",
      });
    } catch (err) {
      console.error("Password update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update password");
      toast({
        title: "Password reset failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const redirectToLogin = () => {
    navigate("/auth?tab=login");
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Reset Your Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resetComplete ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">Password Successfully Reset</h3>
              <p className="text-muted-foreground">
                Your password has been updated. You can now log in with your new password.
              </p>
              <Button onClick={redirectToLogin} className="mt-4">
                Go to Login
              </Button>
            </div>
          ) : hasValidParams ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePasswordChange)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="Enter new password"
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
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            {...field}
                          />
                          <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        </div>
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
                      Updating Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center py-8">
              <Button onClick={redirectToLogin} variant="secondary">
                Back to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordResetPage;
