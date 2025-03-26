
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, CreditCard, DownloadCloud, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';

const SubscriptionDetailsPage: React.FC = () => {
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { user } = useAuth();
  const { fetchUserSubscription, cancelSubscription } = useSubscription(user?.uid);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadSubscription = async () => {
      if (!user?.uid) return;
      
      try {
        const subscription = await fetchUserSubscription(user.uid);
        setUserSubscription(subscription);
        
        if (subscription?.package_id) {
          // Fetch package details from API
          // For now using a placeholder
          setPackageDetails({
            id: subscription.package_id,
            title: subscription.package_name || 'Subscription Package',
            price: subscription.amount || 0
          });
        }
      } catch (err) {
        console.error('Error loading subscription:', err);
        setError('Failed to load subscription details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSubscription();
  }, [user?.uid, fetchUserSubscription]);
  
  const handleCancelSubscription = async () => {
    if (!userSubscription) return;
    
    try {
      await cancelSubscription(userSubscription.id);
      toast({
        title: 'Subscription Cancelled',
        description: 'Your subscription has been cancelled successfully.',
      });
      
      // Reload subscription details
      const updatedSubscription = await fetchUserSubscription(user!.uid);
      setUserSubscription(updatedSubscription);
      setCancelDialogOpen(false);
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      toast({
        title: 'Cancellation Failed',
        description: 'Failed to cancel your subscription. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Pending</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-5xl py-8">
        <Card>
          <CardContent className="py-10">
            <div className="flex flex-col items-center justify-center">
              <Clock className="h-10 w-10 text-muted-foreground animate-pulse mb-4" />
              <h3 className="text-lg font-medium">Loading subscription details...</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-5xl py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (!userSubscription) {
    return (
      <div className="container max-w-5xl py-8">
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <XCircle className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                You don't have any active subscriptions. Subscribe to a package to access premium features.
              </p>
              <Button onClick={() => navigate('/subscription')}>
                View Subscription Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl py-8">
      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>
                  View and manage your current subscription
                </CardDescription>
              </div>
              {getStatusBadge(userSubscription.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Package Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Package</p>
                    <p className="font-medium">{packageDetails?.title || userSubscription.package_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-medium">₹{userSubscription.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Type</p>
                    <p className="font-medium capitalize">{userSubscription.payment_type || 'One-time'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Subscription Timeline</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {userSubscription.start_date ? format(new Date(userSubscription.start_date), 'PPP') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {userSubscription.end_date ? format(new Date(userSubscription.end_date), 'PPP') : 'N/A'}
                    </p>
                  </div>
                  {userSubscription.cancelled_at && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cancelled On</p>
                      <p className="font-medium">
                        {format(new Date(userSubscription.cancelled_at), 'PPP')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6 flex flex-wrap gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex gap-2"
              onClick={() => navigate('/subscription')}
            >
              <CreditCard className="h-4 w-4" /> Change Plan
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex gap-2"
            >
              <DownloadCloud className="h-4 w-4" /> Download Invoice
            </Button>
            
            {userSubscription.status === 'active' && userSubscription.is_user_cancellable !== false && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel Subscription
              </Button>
            )}
          </CardFooter>
        </Card>
        
        {userSubscription.status === 'active' && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>Your subscription is currently active</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertTitle>Active Subscription</AlertTitle>
                <AlertDescription>
                  You have full access to all the features included in your {packageDetails?.title || 'subscription'} package.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
        
        {userSubscription.status === 'cancelled' && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>Your subscription has been cancelled</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Cancelled Subscription</AlertTitle>
                <AlertDescription>
                  Your subscription has been cancelled. 
                  {userSubscription.end_date && new Date(userSubscription.end_date) > new Date() ? 
                    ` You still have access until ${format(new Date(userSubscription.end_date), 'PPP')}.` : 
                    ' Your access has been revoked.'
                  }
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/subscription')}>
                View Subscription Plans
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                If you cancel, you'll still have access until the end of your current billing period. After that, you'll lose access to all premium features.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Keep Subscription</Button>
            <Button variant="destructive" onClick={handleCancelSubscription}>
              Yes, Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionDetailsPage;
