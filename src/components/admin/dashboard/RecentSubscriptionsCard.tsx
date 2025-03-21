
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ISubscription } from '@/models/Subscription';

interface RecentSubscriptionsCardProps {
  subscriptions?: ISubscription[];
  isLoading?: boolean;
}

const RecentSubscriptionsCard: React.FC<RecentSubscriptionsCardProps> = ({
  subscriptions = [],
  isLoading = false
}) => {
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

  // Format date to readable string
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Recent Subscriptions</CardTitle>
        <CardDescription>
          {isLoading
            ? 'Loading recent subscriptions...'
            : `${subscriptions.length} recently added subscriptions`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : subscriptions.length > 0 ? (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{subscription.packageName}</p>
                  <div className="flex space-x-2 text-xs text-muted-foreground">
                    <span>₹{subscription.amount}</span>
                    <span>•</span>
                    <span>{formatDate(subscription.startDate)}</span>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(subscription.status)}>
                  {subscription.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No subscriptions found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSubscriptionsCard;
