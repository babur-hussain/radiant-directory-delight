
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Chrome, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import { getReferralIdFromURL } from '@/utils/referral/referralUtils';
import { processReferralSignup } from '@/services/referralService';
import RoleSelector from './RoleSelector';
import BusinessFields from './BusinessFields';
import InfluencerFields from './InfluencerFields';
import StaffFields from './StaffFields';
import ReferralField from './ReferralField';
import FormStepIndicator from './FormStepIndicator';
import ResponsiveContainer from '../ResponsiveContainer';

interface RegistrationFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

interface FormData {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  city: string;
  country: string;
  referralCode: string;
  businessName?: string;
  ownerName?: string;
  businessCategory?: string;
  website?: string;
  gstNumber?: string;
  niche?: string;
  followersCount?: string;
  instagramHandle?: string;
  facebookHandle?: string;
  youtubeHandle?: string;
  tiktokHandle?: string;
  location?: string;
  bio?: string;
  staffRole?: string;
  employeeCode?: string;
}

const OptimizedRegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { signup, loginWithGoogle } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    role: 'User' as UserRole,
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
    country: '',
    referralCode: '',
  });

  const stepLabels = ['Role', 'Details', 'Complete'];

  useEffect(() => {
    const urlReferralCode = getReferralIdFromURL();
    if (urlReferralCode) {
      setFormData(prev => ({ ...prev, referralCode: urlReferralCode }));
    }
  }, []);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    if (!formData.role) {
      setError('Please select your role');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (formData.role === 'Business' && (!formData.businessName || !formData.businessCategory)) {
      setError('Please fill in required business information');
      return false;
    }
    if (formData.role === 'Influencer' && (!formData.niche || !formData.bio || !formData.followersCount || !formData.phone)) {
      setError('Please fill in all required influencer information');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError(null);
    
    if (!validateStep3()) return;
    
    setIsLoading(true);
    
    try {
      const additionalData = {
        phone: formData.phone,
        city: formData.city,
        country: formData.country,
        referralCode: formData.referralCode,
        ...(formData.role === 'Business' && {
          businessName: formData.businessName,
          ownerName: formData.ownerName,
          businessCategory: formData.businessCategory,
          website: formData.website,
          gstNumber: formData.gstNumber,
        }),
        ...(formData.role === 'Influencer' && {
          niche: formData.niche,
          followersCount: formData.followersCount,
          instagramHandle: formData.instagramHandle,
          facebookHandle: formData.facebookHandle,
          youtubeHandle: formData.youtubeHandle,
          tiktokHandle: formData.tiktokHandle,
          location: formData.location,
          bio: formData.bio,
        }),
        ...(formData.role === 'Staff' && {
          staffRole: formData.staffRole,
          employeeCode: formData.employeeCode,
        }),
      };

      const result = await signup(formData.email, formData.password, formData.name, formData.role, additionalData);
      
      if (result && result.id && formData.referralCode) {
        try {
          await processReferralSignup(result.id, formData.referralCode);
        } catch (refError) {
          console.error('Error processing referral:', refError);
        }
      }
      
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await loginWithGoogle();
      onSuccess?.();
    } catch (error: any) {
      setError(error.message || 'Google signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6 pb-4">
            <div className="text-center py-2">
              <h4 className="font-medium text-gray-700">Choose Your Account Type</h4>
              <p className="text-sm text-gray-500 mt-1">Select the option that best describes you</p>
            </div>
            <RoleSelector
              selectedRole={formData.role}
              onRoleSelect={(role) => updateFormData('role', role)}
            />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4 pb-4">
            <div className="text-center py-2">
              <h4 className="font-medium text-gray-700">Basic Information</h4>
              <p className="text-sm text-gray-500 mt-1">Tell us about yourself</p>
            </div>
            
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                required
                className="mt-1 h-11"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                required
                className="mt-1 h-11"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  required
                  className="mt-1 h-11"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  required
                  className="mt-1 h-11"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Your phone number"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="mt-1 h-11"
                />
              </div>
              
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Your city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  className="mt-1 h-11"
                />
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6 pb-4">
            <div className="text-center py-2">
              <h4 className="font-medium text-gray-700">Additional Details</h4>
              <p className="text-sm text-gray-500 mt-1">Complete your profile</p>
            </div>
            
            {formData.role === 'Business' && (
              <BusinessFields formData={formData} onChange={updateFormData} />
            )}
            
            {formData.role === 'Influencer' && (
              <InfluencerFields formData={formData} onChange={updateFormData} />
            )}
            
            {formData.role === 'Staff' && (
              <StaffFields formData={formData} onChange={updateFormData} />
            )}
            
            <ReferralField
              value={formData.referralCode}
              onChange={(value) => updateFormData('referralCode', value)}
              initialReferralCode={getReferralIdFromURL()}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-4">
      <FormStepIndicator
        currentStep={step}
        totalSteps={3}
        stepLabels={stepLabels}
      />
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {renderStep()}
      </div>
      
      <div className="flex flex-col space-y-4 pt-4 border-t">
        <div className="flex justify-between w-full">
          {step > 1 && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBack}
              disabled={isLoading}
              className="px-6"
            >
              Back
            </Button>
          )}
          
          <div className="flex-1 flex justify-end">
            {step < 3 ? (
              <Button 
                type="button" 
                onClick={handleNext}
                disabled={isLoading}
                className="px-8 bg-blue-600 hover:bg-blue-700"
              >
                Next
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </div>
        </div>
        
        {step === 1 && (
          <>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or</span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </>
        )}
        
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizedRegistrationForm;
