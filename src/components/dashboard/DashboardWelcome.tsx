
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, normalizeRole, UserRole } from '@/types/auth';

interface DashboardWelcomeProps {
  role?: UserRole | string;
}

const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({ role }) => {
  const { user } = useAuth();

  const getWelcomeMessage = (user: User) => {
    const userRole = role ? normalizeRole(role) : normalizeRole(user?.role);
    
    if (userRole === 'admin') {
      return "Welcome to the Admin Dashboard";
    } else if (userRole === 'business') {
      return `Welcome, ${user?.businessName || 'Business Owner'}`;
    } else if (userRole === 'influencer') {
      return `Welcome, ${user?.name || 'Influencer'}`;
    } else {
      return `Welcome, ${user?.name || 'User'}`;
    }
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {getWelcomeMessage(user as User)}
      </h2>
      <p className="text-gray-600">
        Here's a summary of what's happening in your account.
      </p>
    </div>
  );
};

export default DashboardWelcome;
