
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RecentUsersCard from './RecentUsersCard';
import RecentSubscriptionsCard from './RecentSubscriptionsCard';

const DashboardTabContent: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <RecentUsersCard />
      <RecentSubscriptionsCard />
    </div>
  );
};

export default DashboardTabContent;
