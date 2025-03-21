
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
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
  const isServerError = error.includes('Server error') || 
                        error.includes('Edge Function') || 
                        error.includes('404');
  
  const isNetworkError = error.includes('network') || 
                         error.includes('connection') || 
                         error.includes('timeout');
  
  const isRazorpayError = error.includes('Razorpay') || 
                          error.includes('payment gateway') || 
                          error.includes('checkout');
  
  const getErrorMessage = () => {
    if (isServerError) {
      return "Our server is having trouble processing your payment.";
    } else if (isNetworkError) {
      return "There seems to be a network issue. Please check your internet connection.";
    } else if (isRazorpayError) {
      return "The payment gateway is currently unavailable. Please try again later.";
    } else {
      return error || "An unknown error occurred";
    }
  };
  
  const getErrorAdvice = () => {
    if (isServerError) {
      return "Please try again in a few moments or contact customer support.";
    } else if (isNetworkError) {
      return "Make sure you're connected to the internet and refresh the page.";
    } else if (isRazorpayError) {
      return "You can try refreshing the page or trying again later.";
    } else {
      return "Please try again or use a different payment method.";
    }
  };
  
  return (
    <Card className="border-red-100">
      <CardHeader className="bg-red-50 border-b border-red-100">
        <CardTitle className="text-lg text-red-700 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
          Payment Error
        </CardTitle>
        <CardDescription className="text-red-600">
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
          <p className="font-medium">What can you do?</p>
          <p>{getErrorAdvice()}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between flex-col space-y-2">
        <Button 
          onClick={onRetry} 
          className="w-full" 
          variant={retryCount > 2 ? "outline" : "default"}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {retryCount > 2 ? "Try One More Time" : "Retry Payment"}
        </Button>
        
        {retryCount > 1 && (
          <p className="text-xs text-center text-muted-foreground">
            If the problem persists, please contact customer support.
          </p>
        )}
      </CardFooter>
    </Card>
  );
};

export default PaymentErrorFallback;
