
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface StatsOverviewCardProps {
  stats: Array<{
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
  }>;
}

const SimpleStatsCard: React.FC<StatsOverviewCardProps> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No statistics available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-primary/10">{stat.icon}</div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">{stat.title}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleStatsCard;
