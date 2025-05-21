import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

// Form schema with validation
const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  employeeCode: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  onClose?: () => void;
  onLogin?: (email: string, password: string, employeeCode?: string) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onClose, onLogin }) => {
  const { login, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      employeeCode: '',
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setError(null);
      
      if (onLogin) {
        // Use provided login handler if available
        await onLogin(data.email, data.password, data.employeeCode);
      } else {
        // Otherwise use the default login handler
        await login(data.email, data.password, data.employeeCode);
      }
      
      // Close modal if needed
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login');
    }
  };
  
  return (
    <div className="w-full space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 text-sm rounded-md bg-destructive/15 text-destructive">
              {error}
            </div>
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Link
              to="/auth/reset-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;
