
import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import RegisterTypeSelector from './RegisterTypeSelector';
import { UserRole } from '@/types/auth';
import { checkAndProcessReferralFromURL } from '@/services/referralService';

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['User', 'Business', 'Influencer']),
  phone: z.string().optional(),
  businessName: z.string().optional(),
  instagramHandle: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const RegisterForm: React.FC = () => {
  const { signup, loading, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [referralId, setReferralId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Get referral ID from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refId = urlParams.get('ref');
    if (refId) {
      setReferralId(refId);
      console.log('Referral ID found in URL:', refId);
    }
  }, []);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'User' as UserRole,
      phone: '',
      businessName: '',
      instagramHandle: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setError(null);
      
      const additionalData: Record<string, any> = {
        name: data.name,
        role: data.role,
        phone: data.phone || null,
      };
      
      // Add role-specific fields
      if (data.role === 'Business' && data.businessName) {
        additionalData.business_name = data.businessName;
      }
      
      if (data.role === 'Influencer' && data.instagramHandle) {
        additionalData.instagram_handle = data.instagramHandle;
      }
      
      console.log('Registering user with data:', { email: data.email, additionalData });
      
      // Register the user
      const { user, error } = await signup(data.email, data.password, additionalData);
      
      if (error) {
        console.error('Registration error:', error);
        setError(error.message || 'Failed to register');
        return;
      }
      
      if (user && referralId) {
        // Process the referral if a referral ID was provided
        console.log('Processing referral for new user:', user.id);
        await checkAndProcessReferralFromURL(user.id);
      }
      
      // Redirect to home page or onboarding
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  // Watch for role changes to conditionally render fields
  const watchRole = form.watch('role');

  return (
    <div className="w-full space-y-4 max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Role selector */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <RegisterTypeSelector value={field.value} onChange={field.onChange} />
              </FormItem>
            )}
          />

          {/* Name field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password field */}
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

          {/* Phone field */}
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+1 555 123 4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Business name field - conditionally rendered */}
          {watchRole === 'Business' && (
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Business LLC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Instagram handle field - conditionally rendered */}
          {watchRole === 'Influencer' && (
            <FormField
              control={form.control}
              name="instagramHandle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram Handle</FormLabel>
                  <FormControl>
                    <Input placeholder="@yourhandle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Referral message if applicable */}
          {referralId && (
            <div className="bg-primary/10 text-primary px-3 py-2 rounded-md text-sm">
              You're being referred by a friend
            </div>
          )}

          {/* Error message */}
          {(error || authError) && (
            <div className="bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm">
              {error || authError}
            </div>
          )}

          {/* Submit button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;
