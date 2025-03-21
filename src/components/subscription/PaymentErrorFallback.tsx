
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface PaymentErrorFallbackProps {
  error: string;
  onRetry?: () => void;
  retryCount?: number;
}

const PaymentErrorFallback: React.FC<PaymentErrorFallbackProps> = ({ 
  error, 
  onRetry,
  retryCount = 0
}) => {
  const navigate = useNavigate();
  
  const isNetworkError = error.includes('network') || error.includes('connection') || error.includes('offline');
  const isRazorpayError = error.includes('Razorpay') || error.includes('payment') || error.includes('gateway');
  const isAuthError = error.includes('authentication') || error.includes('login') || error.includes('logged in');
  const isBadRequestError = error.includes('400') || error.includes('Bad Request');
  
  return (
    <div className="w-full max-w-lg mx-auto p-4">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Payment Error</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error}</p>
          
          <div className="mt-4 pt-2 border-t border-red-200">
            {isNetworkError && (
              <p className="text-sm mb-2">
                It appears you're having connection issues. Please check your internet connection and try again.
              </p>
            )}
            
            {isRazorpayError && (
              <p className="text-sm mb-2">
                There was an issue with the payment gateway. This might be temporary, please try again in a few moments.
              </p>
            )}
            
            {isBadRequestError && (
              <p className="text-sm mb-2">
                The payment gateway rejected the request. This could be due to invalid data or configuration issues.
                Please try refreshing the page and trying again.
              </p>
            )}
            
            {isAuthError && (
              <p className="text-sm mb-2">
                Please make sure you're logged in before making a payment.
              </p>
            )}
            
            {retryCount >= 3 && (
              <p className="text-sm font-medium mb-2">
                We notice you've tried multiple times. You might want to:
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="flex items-center"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Try Again
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.reload()}
              className="flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" /> Reload Page
            </Button>
            
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => navigate('/subscription')}
              className="flex items-center"
            >
              <ArrowLeft className="h-3 w-3 mr-1" /> Back to Subscriptions
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PaymentErrorFallback;
