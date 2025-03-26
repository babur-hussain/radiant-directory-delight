
import React, { useState } from 'react';
import { User } from '@/types/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserProfileTab from './UserProfileTab';
import UserPermissionsTab from './UserPermissionsTab';
import UserSubscriptionsTab from './UserSubscriptionsTab';

interface UserDetailsPopupProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
}

const UserDetailsPopup: React.FC<UserDetailsPopupProps> = ({ 
  user, 
  open, 
  onOpenChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState('profile');

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen && onClose) {
        onClose();
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">User Details</DialogTitle>
          <DialogDescription>
            View and manage user information for {user.name || user.email}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <UserProfileTab user={user} />
          </TabsContent>
          
          <TabsContent value="permissions">
            <UserPermissionsTab 
              user={user} 
              onRoleSaved={(success, message) => {
                if (success) {
                  // Optionally handle success
                }
              }} 
            />
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <UserSubscriptionsTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsPopup;
