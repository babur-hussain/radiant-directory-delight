
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RecentSubscriptionsCard: React.FC = () => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Subscriptions</CardTitle>
        <CardDescription>Latest subscription activities</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Subscription data will appear here</p>
      </CardContent>
    </Card>
  );
};

export default RecentSubscriptionsCard;
