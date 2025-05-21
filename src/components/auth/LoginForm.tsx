
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Define form schema
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
  employeeCode: z.string().optional(),
});

// Infer form data type from schema
type FormData = z.infer<typeof formSchema>;

// Define component props
export interface LoginFormProps {
  onLogin?: (email: string, password: string, employeeCode?: string) => Promise<void>;
  onClose?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmployeeCode, setShowEmployeeCode] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      employeeCode: '',
    },
  });
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      if (onLogin) {
        await onLogin(data.email, data.password, data.employeeCode);
      } else {
        await login(data.email, data.password, data.employeeCode);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      toast({
        title: 'Login failed',
        description: error?.message || 'Invalid email or password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
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
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showEmployeeCode && (
          <FormField
            control={form.control}
            name="employeeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee Code (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="link"
            className="p-0 text-xs text-primary"
            onClick={() => setShowEmployeeCode(!showEmployeeCode)}
          >
            {showEmployeeCode ? 'Hide employee code' : 'Have an employee code?'}
          </Button>
          
          <Button
            type="button"
            variant="link"
            className="p-0 text-xs text-primary"
            onClick={() => {
              // Forgot password functionality
              toast({
                title: 'Password reset',
                description: 'Please check your email for password reset instructions.',
              });
            }}
          >
            Forgot password?
          </Button>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
