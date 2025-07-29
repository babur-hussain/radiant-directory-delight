import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle, Star, Zap, Shield, Users, RefreshCw } from 'lucide-react';
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
        if (!storedDetails) {
          throw new Error('Payment details not found');
        }
        const paymentDetails = JSON.parse(storedDetails);
        setPackageDetails(paymentDetails);
        
        if (status === 'SUCCESS') {
          // Create subscription in Supabase
          try {
            const subscription = await createSubscription({
              userId: user.id || user.uid,
              packageId: paymentDetails.packageId,
              packageName: paymentDetails.packageName,
              amount: paymentDetails.amount,
              transactionId: txnId,
              paymentMethod: 'payu',
              paymentType: 'one-time', // or infer from package if available
              billingCycle: 'monthly', // or infer from package if available
            });
            setSubscriptionDetails(subscription);
            setPaymentStatus('success');
            toast.success('Payment successful! Your subscription has been activated.');
            sessionStorage.removeItem('payu_payment_details');
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
                      <span className="text-sm">Enhanced Features</span>
                    </div>
                  </div>
                </div>

                {/* Package Details */}
                {packageDetails && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      {getPackageIcon()}
                      <h3 className="text-xl font-semibold text-blue-800 ml-3">
                        Package Details
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
                      <div>
                        <p className="font-medium">Package Name:</p>
                        <p className="text-lg">{packageDetails.packageName}</p>
                      </div>
                      <div>
                        <p className="font-medium">Amount Paid:</p>
                        <p className="text-lg">₹{packageDetails.amount}</p>
                      </div>
                      <div>
                        <p className="font-medium">Transaction ID:</p>
                        <p className="text-sm font-mono">{packageDetails.txnid}</p>
                      </div>
                      <div>
                        <p className="font-medium">Status:</p>
                        <p className="text-green-600 font-medium">Active</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-purple-800 mb-4">
                    What's Next?
                  </h3>
                  <div className="space-y-3 text-purple-700">
                    <div className="flex items-start">
                      <div className="bg-purple-200 rounded-full p-1 mr-3 mt-0.5">
                        <span className="text-purple-800 text-xs font-bold">1</span>
                      </div>
                      <p>Explore your dashboard to access all premium features</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-purple-200 rounded-full p-1 mr-3 mt-0.5">
                        <span className="text-purple-800 text-xs font-bold">2</span>
                      </div>
                      <p>Complete your profile to get maximum benefits</p>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-purple-200 rounded-full p-1 mr-3 mt-0.5">
                        <span className="text-purple-800 text-xs font-bold">3</span>
                      </div>
                      <p>Start connecting with businesses and growing your network</p>
                    </div>
                  </div>
                </div>
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
