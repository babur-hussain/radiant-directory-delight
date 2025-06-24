import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
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
        if (status === 'SUCCESS') {
          // Create subscription in Supabase
          try {
            await createSubscription({
              userId: user.id || user.uid,
              packageId: paymentDetails.packageId,
              packageName: paymentDetails.packageName,
              amount: paymentDetails.amount,
              transactionId: txnId,
              paymentMethod: 'payu',
              paymentType: 'one-time', // or infer from package if available
              billingCycle: 'monthly', // or infer from package if available
            });
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
        console.error('Error processing payment:', error);
        setPaymentStatus('failed');
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        sessionStorage.setItem('payu_payment_error', error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, user]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              {isProcessing && <Loader2 className="h-6 w-6 animate-spin" />}
              {paymentStatus === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
              {paymentStatus === 'failed' && <XCircle className="h-6 w-6 text-red-600" />}
              
              {isProcessing && 'Processing Payment...'}
              {paymentStatus === 'success' && 'Payment Successful!'}
              {paymentStatus === 'failed' && 'Payment Failed'}
            </CardTitle>
            <CardDescription className="text-center">
              {isProcessing && 'Please wait while we verify your payment...'}
              {paymentStatus === 'success' && 'Your subscription has been activated successfully.'}
              {paymentStatus === 'failed' && 'There was an issue processing your payment.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {paymentStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">
                  Thank you for your payment! You can now access all features of your subscription.
                </p>
              </div>
            )}
            
            {paymentStatus === 'failed' && error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700">{error}</p>
                <p className="text-red-600 text-sm mt-2">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              {paymentStatus === 'success' && (
                <Button onClick={() => navigate('/subscription')}>
                  View Subscription
                </Button>
              )}
              {paymentStatus === 'failed' && (
                <Button onClick={() => navigate('/payment-retry')} variant="outline">
                  Try Again
                </Button>
              )}
              <Button onClick={() => navigate('/')} variant="outline">
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
