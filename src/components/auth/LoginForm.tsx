
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import ForgotPasswordForm from './ForgotPasswordForm';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  employeeCode: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      employeeCode: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Attempting login with:', { email: data.email, hasPassword: !!data.password });
      
      const result = await login(data.email, data.password, data.employeeCode);
      
      if (result) {
        console.log('Login successful:', result.id);
        toast({
          title: 'Welcome back! 🎉',
          description: 'You have successfully signed in.',
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorTitle = 'Sign in failed';
      let errorDescription = 'Please check your credentials and try again';
      
      // Handle specific error types
      if (error.message) {
        const errorMsg = error.message.toLowerCase();
        
        if (errorMsg.includes('invalid login credentials') || errorMsg.includes('invalid email or password')) {
          errorDescription = 'Invalid email or password. Please check your credentials.';
        } else if (errorMsg.includes('email not confirmed')) {
          errorTitle = 'Email verification required';
          errorDescription = 'Please check your email and click the confirmation link before signing in.';
        } else if (errorMsg.includes('invalid employee code')) {
          errorDescription = 'Invalid employee code for this account.';
        } else if (errorMsg.includes('too many requests')) {
          errorDescription = 'Too many login attempts. Please try again later.';
        } else if (errorMsg.includes('network')) {
          errorDescription = 'Network error. Please check your connection and try again.';
        } else {
          errorDescription = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordBack = () => {
    setShowForgotPassword(false);
  };

  if (showForgotPassword) {
    return (
      <div className="w-full space-y-4">
        <ForgotPasswordForm onBackToLogin={handleForgotPasswordBack} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 sm:max-w-full sm:px-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Email Address</FormLabel>
                <FormControl>
                  <input
                    placeholder="Enter your email"
                    type="email"
                    autoComplete="email"
                    {...field}
                    className="h-11 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-full text-base sm:text-sm sm:h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">Password</FormLabel>
                <FormControl>
                  <div className="flex items-center w-full gap-2">
                    <input
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...field}
                      className="h-11 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-full text-base sm:text-sm sm:h-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="icon-btn text-gray-400 hover:text-gray-600 transition-colors focus:outline-none ml-2"
                      tabIndex={-1}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employeeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium text-sm sm:text-base">
                  Employee Code <span className="text-xs text-gray-500">(Optional)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter employee code if applicable"
                    autoComplete="organization"
                    {...field}
                    className="h-11 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 w-full text-base sm:text-sm sm:h-10"
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="button"
              variant="link"
              onClick={() => setShowForgotPassword(true)}
              className="p-0 h-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Forgot your password?
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:scale-[1.01] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none sm:h-10"
            disabled={isSubmitting || !form.formState.isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing you in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="text-center pt-3">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Button
                type="button"
                variant="link"
                onClick={onSwitchToRegister}
                className="p-0 h-auto font-medium text-blue-600 hover:text-blue-700"
              >
                Create one now
              </Button>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
