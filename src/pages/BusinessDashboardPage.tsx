
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BusinessDashboard from '@/components/dashboard/business/BusinessDashboard';
import AccessDenied from '@/components/dashboard/AccessDenied';
import { getUserSubscription, listenToUserSubscription } from '@/lib/subscription';

const BusinessDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchSubscription = async () => {
      if (!user?.id) return;
      
      try {
        // Get initial subscription data
        const initialSubscription = await getUserSubscription(user.id);
        setSubscription(initialSubscription);
        
        // Set up real-time listener for subscription changes
        unsubscribe = listenToUserSubscription(user.id, (data) => {
          console.log('Subscription updated:', data);
          setSubscription(data);
        });
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchSubscription();
    } else if (!authLoading) {
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id, authLoading]);

  // Redirect if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-medium">Loading dashboard</h3>
          <p className="text-muted-foreground">Please wait while we fetch your data</p>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user is a business or has admin privileges
  const isBusinessOrAdmin = 
    user?.role === 'Business' || 
    user?.role === 'Admin' || 
    user?.isAdmin === true;

  // Show access denied if not a business user or admin
  if (!isBusinessOrAdmin) {
    return (
      <DashboardLayout>
        <AccessDenied message="You don't have access to the Business Dashboard. This dashboard is only available for Business accounts or Administrators" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BusinessDashboard 
        userId={user.id} 
        subscriptionStatus={subscription?.status} 
      />
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
