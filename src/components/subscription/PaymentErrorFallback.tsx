import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw, Wifi, CreditCard, Shield, Phone, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PaymentErrorFallbackProps {
  error: string;
  onRetry: () => void;
  retryCount: number;
}

const PaymentErrorFallback: React.FC<PaymentErrorFallbackProps> = ({ 
  error, 
  onRetry,
  retryCount 
}) => {
  const isServerError = error.toLowerCase().includes('server error') || 
                        error.toLowerCase().includes('edge function') || 
                        error.toLowerCase().includes('404') ||
                        error.toLowerCase().includes('500') ||
                        error.toLowerCase().includes('timeout');
  
  const isNetworkError = error.toLowerCase().includes('network') || 
                         error.toLowerCase().includes('connection') || 
                         error.toLowerCase().includes('timeout') ||
                         error.toLowerCase().includes('offline');
  
  const isPayUError = error.toLowerCase().includes('payu') || 
                      error.toLowerCase().includes('payment gateway') || 
                      error.toLowerCase().includes('checkout') ||
                      error.toLowerCase().includes('gateway');
  
  const isCardError = error.toLowerCase().includes('card') || 
                      error.toLowerCase().includes('insufficient') || 
                      error.toLowerCase().includes('declined') ||
                      error.toLowerCase().includes('expired') ||
                      error.toLowerCase().includes('invalid card');
  
  const isUserCancelled = error.toLowerCase().includes('cancelled') || 
                          error.toLowerCase().includes('user cancelled') ||
                          error.toLowerCase().includes('aborted');
  
  const getErrorType = () => {
    if (isUserCancelled) return 'user_cancelled';
    if (isCardError) return 'card_error';
    if (isNetworkError) return 'network_error';
    if (isServerError) return 'server_error';
    if (isPayUError) return 'gateway_error';
    return 'unknown_error';
  };

  const getErrorMessage = () => {
    const errorType = getErrorType();
    
    switch (errorType) {
      case 'user_cancelled':
        return "Payment was cancelled by you.";
      case 'card_error':
        return "There was an issue with your card details or funds.";
      case 'network_error':
        return "Network connection issue detected.";
      case 'server_error':
        return "Our servers are experiencing issues.";
      case 'gateway_error':
        return "Payment gateway is temporarily unavailable.";
      default:
        return error || "An unknown error occurred during payment.";
    }
  };
  
  const getErrorAdvice = () => {
    const errorType = getErrorType();
    
    switch (errorType) {
      case 'user_cancelled':
        return "You can try the payment again when you're ready.";
      case 'card_error':
        return "Please check your card details, expiry date, and ensure sufficient funds are available.";
      case 'network_error':
        return "Please check your internet connection and try again.";
      case 'server_error':
        return "Please wait a few minutes and try again, or contact support if the issue persists.";
      case 'gateway_error':
        return "The payment service is temporarily down. Please try again later.";
      default:
        return "Please try again or contact our support team for assistance.";
    }
  };

  const getErrorIcon = () => {
    const errorType = getErrorType();
    
    switch (errorType) {
      case 'user_cancelled':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'card_error':
        return <CreditCard className="h-5 w-5 text-red-600" />;
      case 'network_error':
        return <Wifi className="h-5 w-5 text-yellow-600" />;
      case 'server_error':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'gateway_error':
        return <AlertCircle className="h-5 w-5 text-purple-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getErrorColor = () => {
    const errorType = getErrorType();
    
    switch (errorType) {
      case 'user_cancelled':
        return 'border-orange-100 bg-orange-50';
      case 'card_error':
        return 'border-red-100 bg-red-50';
      case 'network_error':
        return 'border-yellow-100 bg-yellow-50';
      case 'server_error':
        return 'border-blue-100 bg-blue-50';
      case 'gateway_error':
        return 'border-purple-100 bg-purple-50';
      default:
        return 'border-red-100 bg-red-50';
    }
  };

  const getRetryButtonText = () => {
    if (retryCount >= 3) return "Contact Support";
    if (retryCount >= 2) return "Try One More Time";
    return "Retry Payment";
  };

  const getRetryButtonVariant = () => {
    if (retryCount >= 3) return "destructive" as const;
    if (retryCount >= 2) return "outline" as const;
    return "default" as const;
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Payment Issue - Need Support');
    const body = encodeURIComponent(`Hi Support Team,\n\nI'm experiencing a payment issue:\n\nError: ${error}\nRetry Count: ${retryCount}\n\nPlease help me resolve this issue.\n\nBest regards`);
    window.open(`mailto:support@growbharatvyapaar.com?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCallSupport = () => {
    window.open('tel:+919876543210', '_blank');
  };

  return (
    <Card className={`${getErrorColor()}`}>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg flex items-center">
          {getErrorIcon()}
          <span className="ml-2">Payment Error</span>
        </CardTitle>
        <CardDescription>
          We encountered a problem processing your payment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Details</AlertTitle>
          <AlertDescription>
            {getErrorMessage()}
          </AlertDescription>
        </Alert>
        
        <div className="text-sm text-muted-foreground">
          <p className="font-medium mb-2">What can you do?</p>
          <p>{getErrorAdvice()}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button 
            onClick={handleContactSupport} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Support
          </Button>
          <Button 
            onClick={handleCallSupport} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Support
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          onClick={retryCount >= 3 ? handleContactSupport : onRetry} 
          className="w-full" 
          variant={getRetryButtonVariant()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {getRetryButtonText()}
        </Button>
        
        {retryCount > 1 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {retryCount >= 3 
                ? "Maximum retry attempts reached. Please contact support for assistance."
                : `Attempt ${retryCount} of 3`
              }
            </p>
          </div>
        )}

        {retryCount < 3 && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              If the problem persists, please contact our support team.
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PaymentErrorFallback;
