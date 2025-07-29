import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, AlertTriangle, CreditCard, Shield } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const PaymentFailurePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [failureReason, setFailureReason] = useState<string>('');
  const [packageDetails, setPackageDetails] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const txnId = searchParams.get('txnId');
    const status = searchParams.get('status');
    const errorCode = searchParams.get('error_code');
    const errorMessage = searchParams.get('error_Message');

    // Get stored payment details
    const storedDetails = sessionStorage.getItem('payu_payment_details');
    if (storedDetails) {
      try {
        const details = JSON.parse(storedDetails);
        setPackageDetails(details);
      } catch (error) {
        console.error('Error parsing stored payment details:', error);
      }
    }

    // Determine failure reason based on PayU response
    let reason = 'Payment was not successful';
    
    if (errorCode) {
      switch (errorCode) {
        case 'E001':
          reason = 'Invalid payment details provided';
          break;
        case 'E002':
          reason = 'Payment gateway temporarily unavailable';
          break;
        case 'E003':
          reason = 'Transaction declined by bank';
          break;
        case 'E004':
          reason = 'Insufficient funds in account';
          break;
        case 'E005':
          reason = 'Card expired or invalid';
          break;
        case 'E006':
          reason = 'Payment cancelled by user';
          break;
        case 'E007':
          reason = 'Network timeout occurred';
          break;
        case 'E008':
          reason = 'Invalid card details';
          break;
        default:
          reason = errorMessage || 'Payment processing failed';
      }
    } else if (status === 'FAILURE') {
      reason = 'Payment was declined or failed';
    } else if (status === 'CANCELLED') {
      reason = 'Payment was cancelled by user';
    } else if (errorMessage) {
      reason = errorMessage;
    }

    setFailureReason(reason);
    
    // Store error details for retry page
    sessionStorage.setItem('payu_payment_error', reason);
    
    toast.error('Payment failed. Please try again or contact support.');
  }, [searchParams]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    if (packageDetails?.packageId) {
      navigate(`/subscription/${packageDetails.packageId}`);
    } else {
      navigate('/subscription');
    }
  };

  const handleContactSupport = () => {
    // You can implement support contact logic here
    window.open('mailto:support@growbharatvyapaar.com?subject=Payment%20Issue', '_blank');
  };

  const getErrorIcon = () => {
    if (failureReason.toLowerCase().includes('cancelled')) {
      return <XCircle className="h-8 w-8 text-orange-500" />;
    } else if (failureReason.toLowerCase().includes('network') || failureReason.toLowerCase().includes('timeout')) {
      return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
    } else {
      return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const getErrorColor = () => {
    if (failureReason.toLowerCase().includes('cancelled')) {
      return 'text-orange-600';
    } else if (failureReason.toLowerCase().includes('network') || failureReason.toLowerCase().includes('timeout')) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getErrorIcon()}
            </div>
            <CardTitle className={`text-2xl font-bold ${getErrorColor()}`}>
              Payment Failed
            </CardTitle>
            <CardDescription className="text-lg">
              We couldn't process your payment
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Error Details:</h3>
              <p className="text-red-700">{failureReason}</p>
            </div>

            {/* Package Details */}
            {packageDetails && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Package Details:</h3>
                <div className="space-y-1 text-blue-700">
                  <p><strong>Package:</strong> {packageDetails.packageName}</p>
                  <p><strong>Amount:</strong> ₹{packageDetails.amount}</p>
                  <p><strong>Transaction ID:</strong> {packageDetails.txnid}</p>
                </div>
              </div>
            )}

            {/* Common Solutions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">What you can try:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <Shield className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                  Check if your card has sufficient funds
                </li>
                <li className="flex items-start">
                  <CreditCard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                  Verify your card details are correct
                </li>
                <li className="flex items-start">
                  <RefreshCw className="h-4 w-4 mr-2 mt-0.5 text-purple-500" />
                  Try using a different payment method
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-orange-500" />
                  Ensure your internet connection is stable
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleRetry} 
                className="flex-1"
                disabled={retryCount >= 3}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {retryCount >= 3 ? 'Maximum Retries Reached' : 'Try Again'}
              </Button>
              
              <Button 
                onClick={handleContactSupport} 
                variant="outline" 
                className="flex-1"
              >
                Contact Support
              </Button>
            </div>

            {retryCount >= 3 && (
              <div className="text-center text-sm text-gray-500">
                <p>You've reached the maximum number of retry attempts.</p>
                <p>Please contact our support team for assistance.</p>
              </div>
            )}

            <div className="text-center">
              <Button onClick={() => navigate('/')} variant="ghost">
                Go to Homepage
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentFailurePage; 