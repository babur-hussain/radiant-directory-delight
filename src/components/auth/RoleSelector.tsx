
import React from 'react';
import { UserRole } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Building, Users, Star, UserCheck } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleSelect }) => {
  const roles = [
    {
      value: 'Business' as UserRole,
      label: 'Business Owner',
      description: 'Register your business and find influencers',
      icon: Building,
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      selectedColor: 'bg-blue-100 border-blue-500'
    },
    {
      value: 'Influencer' as UserRole,
      label: 'Influencer',
      description: 'Showcase your influence and earn money',
      icon: Star,
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      selectedColor: 'bg-purple-100 border-purple-500'
    },
    {
      value: 'Staff' as UserRole,
      label: 'Staff Member',
      description: 'Join as a team member',
      icon: UserCheck,
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      selectedColor: 'bg-green-100 border-green-500'
    },
    {
      value: 'User' as UserRole,
      label: 'General User',
      description: 'Explore businesses and influencers',
      icon: Users,
      color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
      selectedColor: 'bg-gray-100 border-gray-500'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">I am registering as a:</h3>
        <p className="text-sm text-gray-600">Choose your role to continue</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.value;
          
          return (
            <Card 
              key={role.value}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected ? role.selectedColor : role.color
              }`}
              onClick={() => onRoleSelect(role.value)}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${
                  isSelected ? 'text-blue-600' : 'text-gray-600'
                }`} />
                <h4 className="font-medium text-sm mb-1">{role.label}</h4>
                <p className="text-xs text-gray-500">{role.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
