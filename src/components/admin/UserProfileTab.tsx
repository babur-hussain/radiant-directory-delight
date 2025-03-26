
import React from 'react';
import { User } from '@/types/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface UserProfileTabProps {
  user: User;
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({ user }) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'PP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.photoURL} alt={user.name} />
            <AvatarFallback className="text-2xl">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <h3 className="mt-4 text-lg font-medium">{user.name || 'Unnamed User'}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Badge className="mt-2" variant={user.isAdmin ? "default" : "outline"}>
            {user.role || 'User'}
          </Badge>
        </div>

        <div className="flex-1 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
                  <dd className="mt-1 text-sm break-all">{user.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
                  <dd className="mt-1 text-sm">{formatDate(user.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Login</dt>
                  <dd className="mt-1 text-sm">{formatDate(user.lastLogin)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd className="mt-1 text-sm">{user.phone || 'N/A'}</dd>
                </div>
                {user.role === 'business' && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Business Name</dt>
                      <dd className="mt-1 text-sm">{user.businessName || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Business Category</dt>
                      <dd className="mt-1 text-sm">{user.businessCategory || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Website</dt>
                      <dd className="mt-1 text-sm">{user.website || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">GST Number</dt>
                      <dd className="mt-1 text-sm">{user.gstNumber || 'N/A'}</dd>
                    </div>
                  </>
                )}
                {user.role === 'influencer' && (
                  <>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Niche</dt>
                      <dd className="mt-1 text-sm">{user.niche || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Followers Count</dt>
                      <dd className="mt-1 text-sm">{user.followersCount || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Instagram</dt>
                      <dd className="mt-1 text-sm">{user.instagramHandle || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Facebook</dt>
                      <dd className="mt-1 text-sm">{user.facebookHandle || 'N/A'}</dd>
                    </div>
                  </>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">City</dt>
                  <dd className="mt-1 text-sm">{user.city || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Country</dt>
                  <dd className="mt-1 text-sm">{user.country || 'N/A'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {user.bio && (
            <Card>
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Bio</h4>
                <p className="text-sm">{user.bio}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileTab;
