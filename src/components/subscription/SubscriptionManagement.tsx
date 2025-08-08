import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar, 
  CreditCard, 
  Pause, 
  Play, 
  X, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  getSubscriptions, 
  cancelSubscription, 
  pauseSubscription, 
  resumeSubscription,
  processRecurringPayment
} from '@/services/subscriptionService';
import { Subscription } from '@/models/Subscription';
import { toast } from 'sonner';

interface SubscriptionManagementProps {
  userId?: string;
}

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ userId }) => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (targetUserId) {
      loadSubscriptions();
    }
  }, [targetUserId]);

  const loadSubscriptions = async () => {
    try {
      setIsLoading(true);
      const userSubscriptions = await getSubscriptions(targetUserId);
      setSubscriptions(userSubscriptions);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }

    try {
      setIsProcessing(true);
      const success = await cancelSubscription(subscriptionId, 'User cancelled');
      
      if (success) {
        toast.success('Subscription cancelled successfully');
        await loadSubscriptions(); // Reload subscriptions
      } else {
        toast.error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePauseSubscription = async (subscriptionId: string) => {
    try {
      setIsProcessing(true);
      const success = await pauseSubscription(subscriptionId);
      
      if (success) {
        toast.success('Subscription paused successfully');
        await loadSubscriptions();
      } else {
        toast.error('Failed to pause subscription');
      }
    } catch (error) {
      console.error('Error pausing subscription:', error);
      toast.error('Failed to pause subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResumeSubscription = async (subscriptionId: string) => {
    try {
      setIsProcessing(true);
      const success = await resumeSubscription(subscriptionId);
      
      if (success) {
        toast.success('Subscription resumed successfully');
        await loadSubscriptions();
      } else {
        toast.error('Failed to resume subscription');
      }
    } catch (error) {
      console.error('Error resuming subscription:', error);
      toast.error('Failed to resume subscription');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualPayment = async (subscription: Subscription) => {
    if (!user) {
      toast.error('Please log in to process payment');
      return;
    }

    try {
      setIsProcessing(true);
      const success = await processRecurringPayment(subscription, user);
      
      if (success) {
        toast.success('Payment initiated successfully');
      } else {
        toast.error('Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error processing manual payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (subscription: Subscription) => {
    if (subscription.status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (subscription.isPaused) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    if (subscription.status === 'active') {
      return <Badge variant="default">Active</Badge>;
    }
    return <Badge variant="outline">{subscription.status}</Badge>;
  };

  const getPaymentTypeBadge = (subscription: Subscription) => {
    if (subscription.paymentType === 'one-time') {
      return <Badge variant="outline">One-time</Badge>;
    }
    return <Badge variant="secondary">Recurring</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isPaymentDue = (subscription: Subscription) => {
    if (subscription.paymentType !== 'recurring' || !subscription.nextBillingDate) {
      return false;
    }
    
    const now = new Date();
    const nextBilling = new Date(subscription.nextBillingDate);
    return now >= nextBilling;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading subscriptions...</span>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Subscriptions</CardTitle>
          <CardDescription>
            You don't have any active subscriptions at the moment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = '/subscription'}>
            Browse Packages
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscription Management</h2>
        <Button variant="outline" onClick={loadSubscriptions} disabled={isProcessing}>
          <Settings className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {subscriptions.map((subscription) => (
        <Card key={subscription.id} className="relative">
          {isPaymentDue(subscription) && (
            <div className="absolute top-4 right-4">
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Payment Due
              </Badge>
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {subscription.packageName}
                  {getStatusBadge(subscription)}
                  {getPaymentTypeBadge(subscription)}
                </CardTitle>
                <CardDescription>
                  {subscription.paymentType === 'recurring' 
                    ? `${subscription.billingCycle} subscription`
                    : 'One-time payment'
                  }
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Start Date:</span>
                  <span className="text-sm text-gray-600">
                    {formatDate(subscription.startDate)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">End Date:</span>
                  <span className="text-sm text-gray-600">
                    {formatDate(subscription.endDate)}
                  </span>
                </div>
                
                {subscription.nextBillingDate && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Next Billing:</span>
                    <span className="text-sm text-gray-600">
                      {formatDate(subscription.nextBillingDate)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm font-semibold">
                    ₹{subscription.amount?.toLocaleString('en-IN')}
                  </span>
                </div>
                
                {subscription.recurringAmount && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Recurring:</span>
                    <span className="text-sm font-semibold">
                      ₹{subscription.recurringAmount.toLocaleString('en-IN')}
                      /{subscription.billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Payment Method:</span>
                  <span className="text-sm text-gray-600 capitalize">
                    {subscription.paymentMethod || 'PayU'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {subscription.status === 'active' && !subscription.isPaused && (
                <>
                  {subscription.paymentType === 'recurring' && isPaymentDue(subscription) && (
                    <Button 
                      onClick={() => handleManualPayment(subscription)}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  )}
                  
                  {subscription.isPausable && (
                    <Button 
                      variant="outline" 
                      onClick={() => handlePauseSubscription(subscription.id)}
                      disabled={isProcessing}
                    >
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  {subscription.isUserCancellable && (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleCancelSubscription(subscription.id)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </>
              )}
              
              {subscription.isPaused && (
                <Button 
                  variant="outline" 
                  onClick={() => handleResumeSubscription(subscription.id)}
                  disabled={isProcessing}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionManagement; 