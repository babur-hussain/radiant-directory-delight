
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Clock, CreditCard, Calendar, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const SubscriptionDetailsPage = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const { user } = useAuth();
  const { fetchUserSubscription, cancelSubscription } = useSubscription();
  const { packages, isLoading: packagesLoading } = useSubscriptionPackages();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSubscription = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const result = await fetchUserSubscription(user.id);
        if (result.success && result.data) {
          setSubscription(result.data);
          
          // Get package details
          if (packages && packages.length > 0 && result.data.package_id) {
            const pkg = packages.find(p => p.id === result.data.package_id);
            if (pkg) {
              setPackageDetails(pkg);
            }
          }
        }
      } catch (error) {
        console.error("Error loading subscription:", error);
        toast({
          title: "Error",
          description: "Failed to load subscription details",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!packagesLoading) {
      loadSubscription();
    }
  }, [user, fetchUserSubscription, packages, packagesLoading, toast]);
  
  const handleCancelSubscription = async () => {
    if (!subscription || !subscription.id) {
      toast({
        title: "Error",
        description: "No active subscription found",
        variant: "destructive"
      });
      return;
    }
    
    setIsCancelling(true);
    try {
      const result = await cancelSubscription(subscription.id);
      if (result.success) {
        toast({
          title: "Subscription Cancelled",
          description: "Your subscription has been cancelled successfully"
        });
        
        // Update the local state
        setSubscription({
          ...subscription,
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        });
      } else {
        throw new Error(result.error || "Failed to cancel subscription");
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };
  
  const renderSubscriptionStatus = () => {
    if (!subscription) return null;
    
    const status = subscription.status.toLowerCase();
    
    switch (status) {
      case 'active':
        return (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Active
          </div>
        );
      case 'pending':
        return (
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Pending
          </div>
        );
      case 'cancelled':
        return (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Cancelled
          </div>
        );
      case 'expired':
        return (
          <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            Expired
          </div>
        );
      default:
        return (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        );
    }
  };
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="animate-spin h-8 w-8 text-primary" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!subscription) {
    return (
      <DashboardLayout>
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>View your current subscription information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No active subscription</h3>
              <p className="text-muted-foreground text-center mb-6">
                You don't have an active subscription at the moment.
              </p>
              <Button onClick={() => navigate('/subscription')}>
                View Subscription Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>Manage your current subscription</CardDescription>
            </div>
            {renderSubscriptionStatus()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Subscription Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-medium">{subscription.package_name || packageDetails?.title || 'Unknown package'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription ID</p>
                  <p className="font-medium font-mono text-sm">{subscription.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">₹{subscription.amount?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Type</p>
                  <p className="font-medium capitalize">{subscription.payment_type || 'One-time'}</p>
                </div>
                {subscription.status === 'cancelled' && (
                  <div>
                    <p className="text-sm text-muted-foreground">Cancelled On</p>
                    <p className="font-medium">{formatDate(subscription.cancelled_at)}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Dates</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{formatDate(subscription.start_date)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{formatDate(subscription.end_date)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Created On</p>
                    <p className="font-medium">{formatDate(subscription.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Cycle</p>
                    <p className="font-medium capitalize">{subscription.billing_cycle || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {packageDetails && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Package Features</h3>
              <ul className="space-y-2">
                {packageDetails.features && packageDetails.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {subscription.status === 'active' && (
            <>
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Cancel Subscription</h3>
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Cancelling your subscription will immediately remove access to subscription features.
                    This action cannot be undone.
                  </AlertDescription>
                </Alert>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </Button>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
          
          {subscription.status !== 'active' && (
            <Button onClick={() => navigate('/subscription')}>
              View Subscription Plans
            </Button>
          )}
        </CardFooter>
      </Card>
    </DashboardLayout>
  );
};

export default SubscriptionDetailsPage;
