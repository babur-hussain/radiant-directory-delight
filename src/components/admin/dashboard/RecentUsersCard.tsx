
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';

interface RecentUsersCardProps {
  users?: User[];
  isLoading?: boolean;
}

const RecentUsersCard: React.FC<RecentUsersCardProps> = ({ users = [], isLoading = false }) => {
  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get badge color based on user role
  const getRoleBadgeVariant = (role?: string) => {
    switch (role) {
      case 'Admin':
        return 'default';
      case 'Business':
        return 'outline';
      case 'Influencer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>
          {isLoading ? 'Loading recent users...' : `${users.length} recently added users`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length > 0 ? (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.uid} className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={user.photoURL || undefined} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name || user.email || 'User')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role || 'User'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No users found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentUsersCard;
