
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, Gift } from 'lucide-react';
import { validateReferralId } from '@/utils/referral/referralUtils';

interface ReferralFieldProps {
  value: string;
  onChange: (value: string) => void;
  initialReferralCode?: string;
}

const ReferralField: React.FC<ReferralFieldProps> = ({ value, onChange, initialReferralCode }) => {
  const [isValidReferral, setIsValidReferral] = useState<boolean | null>(null);
  const [referralChecking, setReferralChecking] = useState(false);

  useEffect(() => {
    if (initialReferralCode) {
      onChange(initialReferralCode);
      validateReferralCode(initialReferralCode);
    }
  }, [initialReferralCode]);

  const validateReferralCode = async (code: string) => {
    if (!code) {
      setIsValidReferral(null);
      return;
    }
    
    setReferralChecking(true);
    try {
      const isValid = await validateReferralId(code);
      setIsValidReferral(isValid);
    } catch (error) {
      console.error('Error validating referral code:', error);
      setIsValidReferral(false);
    } finally {
      setReferralChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value;
    onChange(code);
    validateReferralCode(code);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="referralCode" className="flex items-center gap-2">
        <Gift className="h-4 w-4 text-orange-500" />
        Referral Code 
        <span className="text-xs text-gray-500">(Optional - Get special benefits!)</span>
      </Label>
      
      <div className="relative">
        <Input
          id="referralCode"
          placeholder="Enter referral code to get benefits"
          value={value}
          onChange={handleChange}
          className={
            isValidReferral === true
              ? "border-green-500 focus:ring-green-500 pr-10"
              : isValidReferral === false
              ? "border-red-500 focus:ring-red-500 pr-10"
              : "pr-10"
          }
        />
        
        {referralChecking && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        
        {!referralChecking && isValidReferral === true && (
          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
        
        {!referralChecking && isValidReferral === false && (
          <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>

      {value && isValidReferral !== null && !referralChecking && (
        <Alert className={`${isValidReferral ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <AlertDescription className={`text-xs ${isValidReferral ? "text-green-700" : "text-red-700"}`}>
            {isValidReferral 
              ? "✨ Valid referral code! You'll get special benefits after registration." 
              : "❌ Invalid referral code. Please check and try again."}
          </AlertDescription>
        </Alert>
      )}
      
      {!value && (
        <div className="text-xs text-gray-500 bg-orange-50 p-2 rounded border border-orange-200">
          💡 Have a referral code? Enter it to get exclusive benefits and help your referrer earn rewards!
        </div>
      )}
    </div>
  );
};

export default ReferralField;
