
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ResetPasswordFormProps {
  onSubmit?: (email: string) => Promise<void>;
  handleSubmit?: (email: string) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  emailSent: boolean;
  email: string;
  onBackToLogin: () => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  handleSubmit,
  isSubmitting,
  error,
  emailSent,
  email,
  onBackToLogin
}) => {
  const [inputEmail, setInputEmail] = useState(email || '');

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(inputEmail);
    } else if (handleSubmit) {
      handleSubmit(inputEmail);
    }
  };

  return (
    <CardContent className="space-y-4">
      {emailSent ? (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-md text-green-800">
            <h3 className="text-lg font-medium">Reset email sent!</h3>
            <p className="mt-2">
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions to reset your password.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBackToLogin}
          >
            Back to login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleResetSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onBackToLogin}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </div>
        </form>
      )}
    </CardContent>
  );
};

export default ResetPasswordForm;
