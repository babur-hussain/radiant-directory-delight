
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SubscriptionPackagesLoading: React.FC = () => {
  // Create an array of 3 items to display loading skeletons
  const skeletonItems = [1, 2, 3];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {skeletonItems.map((item) => (
        <Card key={item} className="overflow-hidden border shadow">
          <CardContent className="p-6 pt-8">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-10 w-1/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
              
              <div className="space-y-3">
                {[1, 2, 3, 4].map((feature) => (
                  <div key={feature} className="flex items-start">
                    <Skeleton className="h-5 w-5 mr-2 rounded-full" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="p-6 pt-2">
            <Skeleton className="h-12 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionPackagesLoading;
