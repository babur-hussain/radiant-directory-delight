
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { UserRole, normalizeRole } from '@/types/auth';

interface RegisterFormProps {
  onSubmit?: (data: any) => Promise<void>;
  handleSubmit?: (data: any) => Promise<void>;
  onSignup?: (email: string, password: string, name: string, role: UserRole, additionalData?: any) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, handleSubmit, onSignup, isSubmitting, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // Use the normalizeRole function to ensure we use lowercase roles
    const normalizedRole = normalizeRole(selectedRole);
    
    const formData = {
      email,
      password,
      name,
      role: normalizedRole // Use normalized lowercase role
    };

    if (onSubmit) {
      onSubmit(formData);
    } else if (handleSubmit) {
      handleSubmit(formData);
    } else if (onSignup) {
      onSignup(email, password, name, normalizedRole);
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
            placeholder="Enter your email"
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
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label>Role</Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setSelectedRole(value as UserRole)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="influencer">Influencer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <Button disabled={isSubmitting} type="submit" className="w-full">
          {isSubmitting ? 'Submitting...' : 'Register'}
        </Button>
      </form>
    </CardContent>
  );
};

export default RegisterForm;
