
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/auth';

interface UserDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserDetailsPopup: React.FC<UserDetailsPopupProps> = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString.toString();
    }
  };

  const renderFieldValue = (value: any) => {
    if (value === null || value === undefined) return 'Not provided';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value === '') return 'Not provided';
    return value;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Complete information for {user.name || user.displayName || user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {user.photoURL && (
              <div className="flex-shrink-0">
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            )}
            
            <div className="space-y-2 flex-grow">
              <h3 className="font-bold text-lg">{user.name || user.displayName || 'No Name'}</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant={user.isAdmin ? "default" : "outline"}>
                  {user.isAdmin ? 'Admin' : 'Non-Admin'}
                </Badge>
                <Badge variant="outline" className="bg-gray-100">
                  {user.role || 'No Role'}
                </Badge>
                {user.verified && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem label="User ID" value={user.uid} />
            <DetailItem label="Email" value={user.email} />
            <DetailItem label="Employee Code" value={user.employeeCode} highlight={true} />
            <DetailItem label="Role" value={user.role} />
            <DetailItem label="Is Admin" value={user.isAdmin ? "Yes" : "No"} />
            <DetailItem label="Created At" value={formatDate(user.createdAt)} />
            <DetailItem label="Last Login" value={formatDate(user.lastLogin)} />
            <DetailItem label="Phone" value={user.phone} />
            <DetailItem label="City" value={user.city} />
            <DetailItem label="Country" value={user.country} />
          </div>

          {(user.role === 'Influencer' || user.niche || user.followersCount || user.bio) && (
            <>
              <Separator className="my-4" />
              <h4 className="font-semibold text-md mb-2">Influencer Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Niche" value={user.niche} />
                <DetailItem label="Followers Count" value={user.followersCount} />
                <DetailItem label="Instagram" value={user.instagramHandle} />
                <DetailItem label="Facebook" value={user.facebookHandle} />
              </div>
              {user.bio && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-1">Bio</p>
                  <p className="text-sm bg-gray-50 p-2 rounded-md">{user.bio}</p>
                </div>
              )}
            </>
          )}

          {(user.role === 'Business' || user.businessName || user.businessCategory) && (
            <>
              <Separator className="my-4" />
              <h4 className="font-semibold text-md mb-2">Business Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Business Name" value={user.businessName} />
                <DetailItem label="Owner Name" value={user.ownerName} />
                <DetailItem label="Business Category" value={user.businessCategory} />
                <DetailItem label="Website" value={user.website} />
                <DetailItem label="GST Number" value={user.gstNumber} />
              </div>
              {user.address && (
                <>
                  <p className="text-sm font-medium text-gray-700 mt-2 mb-1">Address</p>
                  <div className="text-sm bg-gray-50 p-2 rounded-md">
                    {user.address.street && <p>{user.address.street}</p>}
                    <p>
                      {[
                        user.address.city, 
                        user.address.state,
                        user.address.zipCode
                      ].filter(Boolean).join(', ')}
                    </p>
                    {user.address.country && <p>{user.address.country}</p>}
                  </div>
                </>
              )}
            </>
          )}

          {user.subscription && (
            <>
              <Separator className="my-4" />
              <h4 className="font-semibold text-md mb-2">Subscription Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem label="Subscription" value={user.subscription} />
              </div>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const DetailItem = ({ label, value, highlight = false }: { label: string; value: any; highlight?: boolean }) => (
  <div className="space-y-1">
    <p className="text-sm font-medium text-gray-700">{label}</p>
    <p className={`text-sm ${highlight ? 'bg-amber-50 font-medium p-1 rounded-md' : ''}`}>
      {renderFieldValue(value)}
    </p>
  </div>
);

export default UserDetailsPopup;
