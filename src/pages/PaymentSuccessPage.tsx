import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle, Star, Zap, Shield, Users, RefreshCw, Calendar } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
// import { adminAssignInstamojoSubscription } from '@/lib/subscription/admin-instamojo-subscription';
import { toast } from 'sonner';
import { createSubscription } from '@/services/subscriptionService';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const [error, setError] = useState<string | null>(null);
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  useEffect(() => {
    const processPayment = async () => {
      const txnId = searchParams.get('txnId');
      const status = searchParams.get('status');
      
      if (!txnId || !user) {
        setPaymentStatus('failed');
        setError('Invalid payment details or user not authenticated');
        setIsProcessing(false);
        return;
      }

      try {
        // Get stored payment details
        const storedDetails = sessionStorage.getItem('payu_payment_details');
        const paymentDetails = storedDetails ? JSON.parse(storedDetails) : null;
        const isSubscription = paymentDetails?.isSubscription || paymentDetails?.paymentType === 'recurring';
        const billingCycle = paymentDetails?.billingCycle;
        const packageType = paymentDetails?.packageType;
        const setupFee = paymentDetails?.setupFee || 0;
        const durationMonths = paymentDetails?.durationMonths || 12;
        const advancePaymentMonths = paymentDetails?.advancePaymentMonths || 0;
        const monthlyPrice = paymentDetails?.monthlyPrice || 0;

        const getPaymentTypeDescription = () => {
          if (isSubscription) {
            if (billingCycle === 'monthly') {
              return 'Monthly Subscription';
            } else if (billingCycle === 'yearly') {
              return 'Yearly Subscription';
            }
            return 'Recurring Subscription';
          }
          return 'One-time Payment';
        };

        const getNextBillingInfo = () => {
          if (!isSubscription) return null;
          
          const now = new Date();
          let nextBillingDate = new Date(now);
          
          if (billingCycle === 'monthly') {
            nextBillingDate.setMonth(now.getMonth() + 1);
          } else if (billingCycle === 'yearly') {
            nextBillingDate.setFullYear(now.getFullYear() + 1);
          }
          
          return {
            date: nextBillingDate.toLocaleDateString(),
            amount: billingCycle === 'monthly' ? monthlyPrice : paymentDetails?.amount
          };
        };

        const nextBillingInfo = getNextBillingInfo();

        setPackageDetails(paymentDetails);
        
        if (status === 'SUCCESS') {
          // Create subscription in Supabase
          try {
            // Check if this is a recurring payment
            const isRecurringPayment = sessionStorage.getItem('payu_recurring_payment');
            
            if (isRecurringPayment) {
              // Handle recurring payment
              const recurringData = JSON.parse(isRecurringPayment);
              const { updateSubscriptionAfterRecurringPayment } = await import('@/services/subscriptionService');
              
              const success = await updateSubscriptionAfterRecurringPayment(recurringData.subscriptionId);
              
              if (success) {
                setPaymentStatus('success');
                toast.success('Recurring payment successful! Your subscription has been extended.');
                sessionStorage.removeItem('payu_recurring_payment');
              } else {
                setPaymentStatus('failed');
                setError('Payment succeeded but failed to update subscription. Please contact support.');
                sessionStorage.setItem('payu_payment_error', 'Failed to update subscription after recurring payment.');
                return;
              }
            } else {
              // Handle new subscription creation
              const subscription = await createSubscription({
                userId: user.id || user.uid,
                packageId: paymentDetails.packageId,
                packageName: paymentDetails.packageName,
                amount: paymentDetails.amount,
                transactionId: txnId,
                paymentMethod: 'payu',
                paymentType: paymentDetails.paymentType || 'recurring',
                billingCycle: paymentDetails.billingCycle || 'monthly',
                recurringAmount: paymentDetails.isSubscription ? 
                  (paymentDetails.billingCycle === 'monthly' ? paymentDetails.monthlyPrice : paymentDetails.amount) : 
                  undefined,
                signupFee: paymentDetails.setupFee || 0,
                durationMonths: paymentDetails.durationMonths || 12,
                advancePaymentMonths: paymentDetails.advancePaymentMonths || 0
              });
              
              setSubscriptionDetails(subscription);
              setPaymentStatus('success');
              toast.success('Payment successful! Your subscription has been activated.');
              sessionStorage.removeItem('payu_payment_details');
            }
          } catch (subError) {
            setPaymentStatus('failed');
            setError('Payment succeeded but failed to activate subscription. Please contact support or retry.');
            sessionStorage.setItem('payu_payment_error', 'Failed to activate subscription after payment.');
            return;
          }
        } else {
          setPaymentStatus('failed');
          setError('Payment was not successful');
          sessionStorage.setItem('payu_payment_error', 'Payment was not successful.');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setPaymentStatus('failed');
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        sessionStorage.setItem('payu_payment_error', error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, user]);

  const getSuccessIcon = () => {
    return <CheckCircle className="h-12 w-12 text-green-500" />;
  };

  const getPackageIcon = () => {
    if (packageDetails?.packageName?.toLowerCase().includes('premium')) {
      return <Star className="h-6 w-6 text-yellow-500" />;
    } else if (packageDetails?.packageName?.toLowerCase().includes('pro')) {
      return <Zap className="h-6 w-6 text-blue-500" />;
    } else {
      return <Shield className="h-6 w-6 text-green-500" />;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isProcessing && <Loader2 className="h-12 w-12 animate-spin text-blue-500" />}
              {paymentStatus === 'success' && getSuccessIcon()}
              {paymentStatus === 'failed' && <XCircle className="h-12 w-12 text-red-500" />}
            </div>
            <CardTitle className="text-3xl font-bold">
              {isProcessing && 'Processing Payment...'}
              {paymentStatus === 'success' && 'Payment Successful!'}
              {paymentStatus === 'failed' && 'Payment Failed'}
            </CardTitle>
            <CardDescription className="text-lg">
              {isProcessing && 'Please wait while we verify your payment and activate your subscription...'}
              {paymentStatus === 'success' && 'Your subscription has been activated successfully. Welcome aboard!'}
              {paymentStatus === 'failed' && 'There was an issue processing your payment.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {paymentStatus === 'success' && (
              <>
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-green-800">
                      Welcome to {packageDetails?.packageName || 'Your Subscription'}!
                    </h3>
                  </div>
                  <p className="text-green-700 mb-4">
                    Thank you for your payment! Your subscription has been activated and you now have access to all premium features.
                  </p>
                  
                  {/* Subscription Details */}
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Subscription Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Payment Type:</span>
                        <div className="text-gray-800 font-medium">
                          {getPaymentTypeDescription()}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Package Type:</span>
                        <div className="text-gray-800 font-medium capitalize">
                          {packageType || 'Standard'}
                        </div>
                      </div>
                      {isSubscription && billingCycle && (
                        <>
                          <div>
                            <span className="font-medium text-gray-600">Billing Cycle:</span>
                            <div className="text-gray-800 font-medium capitalize">
                              {billingCycle}
                            </div>
                          </div>
                          {nextBillingInfo && (
                            <div>
                              <span className="font-medium text-gray-600">Next Billing:</span>
                              <div className="text-gray-800 font-medium">
                                {nextBillingInfo.date}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {setupFee > 0 && (
                        <div>
                          <span className="font-medium text-gray-600">Setup Fee:</span>
                          <div className="text-gray-800 font-medium">
                            ₹{setupFee.toLocaleString('en-IN')}
                          </div>
                        </div>
                      )}
                      {durationMonths > 0 && (
                        <div>
                          <span className="font-medium text-gray-600">Duration:</span>
                          <div className="text-gray-800 font-medium">
                            {durationMonths === 0 ? 'Lifetime' : `${durationMonths} months`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="flex items-center text-green-700">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="text-sm">Premium Support</span>
                    </div>
                    <div className="flex items-center text-green-700">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">Priority Access</span>
                    </div>
                    <div className="flex items-center text-green-700">
                      <Zap className="h-4 w-4 mr-2" />
                      <span className="text-sm">Instant Activation</span>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center">
                      {getPackageIcon()}
                      <div className="ml-3">
                        <CardTitle>{packageDetails?.packageName}</CardTitle>
                        <CardDescription>
                          Transaction ID: {packageDetails?.transactionId || 'N/A'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Amount Paid:</span>
                        <span className="text-lg font-bold text-green-600">
                          ₹{packageDetails?.amount?.toLocaleString('en-IN')}
                        </span>
                      </div>
                      
                      {isSubscription && nextBillingInfo && (
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Next Billing Amount:</span>
                          <span className="text-lg font-bold text-blue-600">
                            ₹{nextBillingInfo.amount?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Payment Method:</span>
                        <span className="text-gray-600">PayU Gateway</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Payment Date:</span>
                        <span className="text-gray-600">
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle>What's Next?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-2 mr-3">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Access Your Dashboard</h4>
                          <p className="text-sm text-gray-600">
                            Explore your new features and manage your subscription from your personalized dashboard.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="bg-green-100 rounded-full p-2 mr-3">
                          <Users className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Connect with {packageType === 'Business' ? 'Influencers' : 'Businesses'}</h4>
                          <p className="text-sm text-gray-600">
                            Start exploring and connecting with {packageType === 'Business' ? 'influencers' : 'businesses'} in your area.
                          </p>
                        </div>
                      </div>
                      
                      {isSubscription && (
                        <div className="flex items-start">
                          <div className="bg-purple-100 rounded-full p-2 mr-3">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Manage Your Subscription</h4>
                            <p className="text-sm text-gray-600">
                              View your subscription details, billing history, and manage your recurring payments.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
            
            {paymentStatus === 'failed' && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-3">Error Details:</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <p className="text-red-600 text-sm">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {paymentStatus === 'success' && (
                <>
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>
                  <Button 
                    onClick={() => navigate('/subscription')} 
                    variant="outline"
                    className="flex-1"
                  >
                    View Subscription
                  </Button>
                </>
              )}
              {paymentStatus === 'failed' && (
                <Button 
                  onClick={() => navigate('/payment-retry')} 
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              <Button onClick={() => navigate('/')} variant="ghost">
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;
