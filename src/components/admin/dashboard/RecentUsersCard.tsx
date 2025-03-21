
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RecentUsersCard: React.FC = () => {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Recent Users</CardTitle>
        <CardDescription>Recent user registrations</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">User data will appear here</p>
      </CardContent>
    </Card>
  );
};

export default RecentUsersCard;
