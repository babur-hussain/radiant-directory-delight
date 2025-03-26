
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CalendarClock, Mail, Phone, MapPin, CheckCircle, XCircle, UserCircle, Building, AtSign } from 'lucide-react';
import { User } from '@/types/auth';
import { formatDate } from '@/utils/date-utils';
import { isAdmin, isBusiness, isInfluencer, isStaff } from '@/utils/roleUtils';

interface UserDetailsPopupProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailsPopup: React.FC<UserDetailsPopupProps> = ({ user, open, onOpenChange }) => {
  if (!user) return null;
  
  // Helper to get user's initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  // Helper to format dates
  const formatLastLogin = (date: string | undefined) => {
    if (!date) return 'Never';
    return formatDate(date);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">User Details</DialogTitle>
          <DialogDescription>
            Complete information about this user account.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {/* User header with avatar and basic details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL || ''} alt={user.name || 'User'} />
              <AvatarFallback className="text-xl">
                {getInitials(user.name || user.displayName || 'User')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-bold">{user.name || user.displayName}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              
              <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                <Badge variant={isAdmin(user.role) ? "default" : "outline"}>
                  {user.role || 'User'}
                </Badge>
                
                {user.verified && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Account information */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <UserCircle className="text-muted-foreground h-5 w-5" />
                <span className="text-sm">ID: {user.uid || user.id}</span>
              </div>
              
              {user.employeeCode && (
                <div className="flex items-center gap-2">
                  <Badge className="h-5 px-2 py-0">Employee Code</Badge>
                  <span className="text-sm">{user.employeeCode}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <CalendarClock className="text-muted-foreground h-5 w-5" />
                <span className="text-sm">Last Login: {formatLastLogin(user.lastLogin || user.last_login)}</span>
              </div>
              
              {user.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="text-muted-foreground h-5 w-5" />
                  <span className="text-sm">{user.city}{user.country ? `, ${user.country}` : ''}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Influencer fields */}
          {isInfluencer(user.role) && (user.niche || user.followersCount || user.bio) && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Influencer Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.niche && (
                  <div className="flex items-center gap-2">
                    <Badge className="h-5 px-2 py-0">Niche</Badge>
                    <span className="text-sm">{user.niche}</span>
                  </div>
                )}
                
                {user.followersCount && (
                  <div className="flex items-center gap-2">
                    <Badge className="h-5 px-2 py-0">Followers</Badge>
                    <span className="text-sm">{user.followersCount}</span>
                  </div>
                )}
                
                {user.instagramHandle && (
                  <div className="flex items-center gap-2">
                    <AtSign className="text-muted-foreground h-5 w-5" />
                    <span className="text-sm">Instagram: {user.instagramHandle}</span>
                  </div>
                )}
                
                {user.facebookHandle && (
                  <div className="flex items-center gap-2">
                    <AtSign className="text-muted-foreground h-5 w-5" />
                    <span className="text-sm">Facebook: {user.facebookHandle}</span>
                  </div>
                )}
              </div>
              
              {user.bio && (
                <div className="mt-4">
                  <Badge className="mb-2 h-5 px-2 py-0">Bio</Badge>
                  <p className="text-sm p-3 bg-muted rounded-md">
                    {user.bio}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Business fields */}
          {isBusiness(user.role) && (user.businessName || user.businessCategory) && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Business Details
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.businessName && (
                  <div className="flex items-center gap-2">
                    <Building className="text-muted-foreground h-5 w-5" />
                    <span className="text-sm">Name: {user.businessName}</span>
                  </div>
                )}
                
                {user.ownerName && (
                  <div className="flex items-center gap-2">
                    <UserCircle className="text-muted-foreground h-5 w-5" />
                    <span className="text-sm">Owner: {user.ownerName}</span>
                  </div>
                )}
                
                {user.businessCategory && (
                  <div className="flex items-center gap-2">
                    <Badge className="h-5 px-2 py-0">Category</Badge>
                    <span className="text-sm">{user.businessCategory}</span>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center gap-2">
                    <AtSign className="text-muted-foreground h-5 w-5" />
                    <span className="text-sm">{user.website}</span>
                  </div>
                )}
                
                {user.gstNumber && (
                  <div className="flex items-center gap-2">
                    <Badge className="h-5 px-2 py-0">GST</Badge>
                    <span className="text-sm">{user.gstNumber}</span>
                  </div>
                )}
              </div>
              
              {user.address && (
                <div className="mt-4">
                  <Badge className="mb-2 h-5 px-2 py-0">Address</Badge>
                  <div className="text-sm p-3 bg-muted rounded-md">
                    {typeof user.address === 'string' ? (
                      <p>{user.address}</p>
                    ) : (
                      <>
                        <p>{user.address.street}</p>
                        <p>{user.address.city}, {user.address.state}</p>
                        <p>{user.address.country}, {user.address.zipCode}</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Subscription details */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Subscription Information
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
              {user.subscription_package || user.subscriptionPackage ? (
                <Badge className="mr-2 inline-flex">
                  {user.subscription_package || user.subscriptionPackage}
                </Badge>
              ) : (
                <Badge variant="outline" className="mr-2 inline-flex">
                  No Active Subscription
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsPopup;
