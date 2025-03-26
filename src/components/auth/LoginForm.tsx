
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface LoginFormProps {
  onSubmit?: (data: any) => Promise<void>;
  handleSubmit?: (data: any) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  onResetPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSubmit, 
  handleSubmit, 
  isSubmitting, 
  error, 
  onResetPassword 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = {
      email,
      password,
      employeeCode
    };
    
    if (onSubmit) {
      onSubmit(formData);
    } else if (handleSubmit) {
      handleSubmit(formData);
    }
  };

  return (
    <CardContent className="grid gap-4">
      <form onSubmit={handleFormSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="employeeCode">Employee Code (if applicable)</Label>
          <Input
            id="employeeCode"
            type="text"
            placeholder="Employee Code (Optional)"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
          />
        </div>
        
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex justify-between mt-2">
          <button
            type="button"
            className="text-sm text-blue-600 hover:underline"
            onClick={onResetPassword}
          >
            Forgot password?
          </button>
        </div>
        
        <Button className="w-full mt-4" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </CardContent>
  );
};

export default LoginForm;
