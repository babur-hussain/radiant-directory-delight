
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    // Get payment response parameters from URL
    const status = searchParams.get('STATUS');
    const orderId = searchParams.get('ORDERID');
    const txnId = searchParams.get('TXNID');
    const amount = searchParams.get('TXNAMOUNT');
    const respCode = searchParams.get('RESPCODE');
    const respMsg = searchParams.get('RESPMSG');

    console.log('Payment callback received:', {
      status,
      orderId,
      txnId,
      amount,
      respCode,
      respMsg
    });

    const processPaymentResponse = async () => {
      try {
        if (status === 'TXN_SUCCESS' && respCode === '01') {
          // Payment successful
          setPaymentStatus('success');
          setPaymentDetails({
            orderId,
            txnId,
            amount,
            status,
            message: respMsg || 'Payment completed successfully'
          });

          toast.success('Payment completed successfully!');

          // Redirect to subscription page after 3 seconds
          setTimeout(() => {
            navigate('/subscription');
          }, 3000);

        } else {
          // Payment failed
          setPaymentStatus('failed');
          setPaymentDetails({
            orderId,
            txnId,
            status,
            message: respMsg || 'Payment failed'
          });

          toast.error(`Payment failed: ${respMsg || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('Error processing payment response:', error);
        setPaymentStatus('failed');
        setPaymentDetails({
          message: 'Error processing payment response'
        });
        toast.error('Error processing payment response');
      }
    };

    // Process the payment response
    if (status) {
      processPaymentResponse();
    } else {
      // No payment data found, redirect to subscription page
      setTimeout(() => {
        navigate('/subscription');
      }, 2000);
    }
  }, [searchParams, navigate]);

  if (paymentStatus === 'loading') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-gray-600">
                Please wait while we verify your payment...
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Your payment has been processed successfully.
              </p>
              
              {paymentDetails && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {paymentDetails.txnId && (
                      <div className="flex justify-between">
                        <span>Transaction ID:</span>
                        <span className="font-mono">{paymentDetails.txnId}</span>
                      </div>
                    )}
                    {paymentDetails.orderId && (
                      <div className="flex justify-between">
                        <span>Order ID:</span>
                        <span className="font-mono">{paymentDetails.orderId}</span>
                      </div>
                    )}
                    {paymentDetails.amount && (
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span>₹{paymentDetails.amount}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500">
                You will be redirected to your subscription dashboard in a few seconds...
              </p>

              <Button onClick={() => navigate('/subscription')} className="mt-4">
                Go to Subscription Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Payment failed
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {paymentDetails?.message || 'Your payment could not be processed.'}
            </p>
            
            {paymentDetails && paymentDetails.orderId && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono">{paymentDetails.orderId}</span>
                  </div>
                  {paymentDetails.txnId && (
                    <div className="flex justify-between">
                      <span>Transaction ID:</span>
                      <span className="font-mono">{paymentDetails.txnId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => navigate('/subscription')} 
                variant="outline"
              >
                Try Again
              </Button>
              <Button onClick={() => navigate('/contact')}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentSuccessPage;
