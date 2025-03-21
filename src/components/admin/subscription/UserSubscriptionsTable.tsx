import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Subscription } from '@/models/Subscription';

interface UserSubscriptionsTableProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
  onViewDetails?: (subscription: Subscription) => void;
  onCancel?: (subscription: Subscription) => void;
}

const UserSubscriptionsTable: React.FC<UserSubscriptionsTableProps> = ({ 
  subscriptions,
  isLoading = false,
  onViewDetails,
  onCancel
}) => {
  // Format date to readable string
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get badge color based on subscription status
  const getStatusBadgeVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'expired':
        return 'secondary';
      case 'pending':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const isSubscriptionActive = (subscription: Subscription) => {
    return subscription.status?.toLowerCase() === 'active';
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading subscriptions...</div>;
  }

  if (!subscriptions || subscriptions.length === 0) {
    return <div className="text-center py-4">No subscriptions found</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Package</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id}>
              <TableCell className="font-medium">{subscription.packageName}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(subscription.status)}>
                  {subscription.status}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(subscription.startDate)}</TableCell>
              <TableCell>{formatDate(subscription.endDate)}</TableCell>
              <TableCell>₹{subscription.amount}</TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewDetails?.(subscription)}
                  >
                    Details
                  </Button>
                  {isSubscriptionActive(subscription) && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => onCancel?.(subscription)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserSubscriptionsTable;
