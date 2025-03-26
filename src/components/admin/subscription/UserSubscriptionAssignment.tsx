
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  CheckCircle2, 
  XCircle, 
  Tag, 
  Calendar, 
  Loader2 
} from 'lucide-react';
import { useSubscriptionAssignment } from '@/hooks/useSubscriptionAssignment';
import { User, UserSubscription } from '@/types/auth';

interface UserSubscriptionAssignmentProps {
  user: User; 
  onAssigned?: (packageId: string) => void;
  disabled?: boolean;
}

const UserSubscriptionAssignment: React.FC<UserSubscriptionAssignmentProps> = ({ 
  user, 
  onAssigned,
  disabled = false
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const {
    isLoading,
    error,
    packages,
    selectedPackage,
    setSelectedPackage,
    userCurrentSubscription,
    handleAssignPackage,
    handleCancelSubscription
  } = useSubscriptionAssignment(user, (packageId) => {
    if (onAssigned) onAssigned(packageId);
    setExpanded(false);
  });
  
  // Color based on subscription status
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-amber-100 text-amber-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Shorten date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  return (
    <div className="space-y-2">
      {userCurrentSubscription ? (
        <div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={getStatusColor(userCurrentSubscription.status)}
            >
              {userCurrentSubscription.status || 'Unknown'}
            </Badge>
            <span className="text-sm font-medium">
              {userCurrentSubscription.packageName || 'Unknown package'}
            </span>
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="h-6 px-2"
              disabled={disabled}
            >
              {expanded ? 'Hide' : 'Details'}
            </Button>
          </div>
          
          {expanded && (
            <div className="mt-2 space-y-2 bg-gray-50 p-2 rounded-md text-sm">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-muted-foreground mr-1">Package:</span>
                <span>{userCurrentSubscription.packageName}</span>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-muted-foreground mr-1">Since:</span>
                <span>{formatDate(userCurrentSubscription.startDate as string)}</span>
              </div>
              
              <div className="flex mt-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="mr-2 h-7 text-xs"
                  onClick={() => setExpanded(false)}
                  disabled={disabled}
                >
                  Close
                </Button>
                
                {userCurrentSubscription.status !== 'cancelled' && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={handleCancelSubscription}
                    disabled={disabled || userCurrentSubscription.paymentType === "one-time"}
                  >
                    Cancel
                  </Button>
                )}
                
                {userCurrentSubscription.status === 'cancelled' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs"
                    onClick={() => setExpanded(false)}
                    disabled={disabled}
                  >
                    Assign New
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : expanded ? (
        <div className="space-y-2">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2 text-primary" />
            <span className="font-medium text-sm">Assign Package</span>
          </div>
          
          <Select
            value={selectedPackage}
            onValueChange={setSelectedPackage}
            disabled={disabled || packages.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a package" />
            </SelectTrigger>
            <SelectContent>
              {packages.map((pkg) => (
                <SelectItem key={pkg.id} value={pkg.id}>
                  {pkg.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleAssignPackage}
              className="flex-1 h-8"
              disabled={disabled || !selectedPackage || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Assigning...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Assign
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpanded(false)}
              className="flex-1 h-8"
              disabled={disabled || isLoading}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            No Subscription
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(true)}
            disabled={disabled}
          >
            Assign
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserSubscriptionAssignment;
