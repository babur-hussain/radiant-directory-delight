import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { ShoppingCart, ArrowLeft, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks";
import InstamojoPayment from "./InstamojoPayment";

interface SubscriptionCheckoutProps {
  selectedPackage: SubscriptionPackage;
  onBack: () => void;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({ selectedPackage, onBack }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { purchaseSubscription, isProcessing } = useSubscription();
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { toast } = useToast();
  
  // Calculate total price including setup fee
  const totalPrice = selectedPackage.price + (selectedPackage.setupFee || 0);
  
  const handleSubscribe = () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    setShowPaymentUI(true);
  };
  
  const handlePaymentSuccess = async (paymentResponse: any) => {
    setPaymentProcessing(true);
    console.log("Payment successful:", paymentResponse);
    
    try {
      await purchaseSubscription(selectedPackage);
      
      toast({
        title: "Subscription Activated",
        description: "Your subscription has been successfully activated. Thank you!",
      });
    } catch (error) {
      console.error("Subscription activation failed:", error);
      toast({
        title: "Subscription Failed",
        description: "We couldn't activate your subscription. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    setShowPaymentUI(false);
    
    toast({
      title: "Payment Failed",
      description: "We couldn't process your payment. Please try again later.",
      variant: "destructive",
    });
  };
  
  if (showPaymentUI) {
    return (
      <div className="max-w-2xl mx-auto subscription-checkout-container">
        <Button 
          variant="ghost" 
          onClick={() => setShowPaymentUI(false)} 
          className="mb-4"
          disabled={paymentProcessing}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Checkout
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Complete Payment</CardTitle>
            <CardDescription>Process your payment to activate your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-center">Processing your payment...</p>
              </div>
            ) : (
              <InstamojoPayment 
                selectedPackage={selectedPackage}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const isOneTimePackage = selectedPackage.paymentType === 'one-time';
  
  return (
    <div className="max-w-2xl mx-auto subscription-checkout-container">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Plans
      </Button>
      
      <Card className="relative">
        <CardHeader>
          <CardTitle className="text-xl">Checkout</CardTitle>
          <CardDescription>Review your subscription plan before proceeding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-24 sm:pb-6">
          <div className="border rounded-md p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">{selectedPackage.title}</h3>
              <span className="font-bold">₹{totalPrice}</span>
            </div>
            <p className="text-sm text-muted-foreground">{selectedPackage.shortDescription}</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Payment Details</h3>
            <div className="space-y-2 text-sm">
              {selectedPackage.setupFee > 0 && (
                <div className="flex justify-between">
                  <span>One-time setup fee</span>
                  <span>₹{selectedPackage.setupFee}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{isOneTimePackage ? 'Base price' : 'Annual subscription'}</span>
                <span>₹{selectedPackage.price}</span>
              </div>
              {isOneTimePackage ? (
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Total payment</span>
                  <span>₹{totalPrice}</span>
                </div>
              ) : (
                <>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Initial payment</span>
                    <span>₹{selectedPackage.setupFee || 0}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Annual recurring payment</span>
                    <span>₹{selectedPackage.price}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div id="terms-checkbox-section" className="flex items-start space-x-2 pt-4 border-t">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the Terms and Conditions
              </label>
              <p className="text-sm text-muted-foreground">
                By checking this box, you agree to our{" "}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="text-primary underline">Terms and Conditions</button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden p-0">
                    <DialogHeader className="p-4 sm:p-6 border-b">
                      <DialogTitle>Terms and Conditions</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
                      <DialogDescription>
                        <h4 className="text-base font-semibold mt-4 mb-2">1. Subscription Terms</h4>
                        <p className="mb-2">
                          1.1. Your subscription will automatically renew at the end of each billing cycle unless cancelled.
                        </p>
                        <p className="mb-2">
                          1.2. A one-time setup fee of ₹{selectedPackage.setupFee || 0} is charged at the beginning of the subscription.
                        </p>
                        <p className="mb-2">
                          1.3. The annual subscription fee of ₹{selectedPackage.price} will be charged after the setup fee payment.
                        </p>
                        
                        <h4 className="text-base font-semibold mt-4 mb-2">2. Cancellation and Refunds</h4>
                        <p className="mb-2">
                          2.1. You may cancel your subscription at any time through your account dashboard.
                        </p>
                        <p className="mb-2">
                          2.2. The setup fee is non-refundable.
                        </p>
                        <p className="mb-2">
                          2.3. Cancellations will take effect at the end of the current billing cycle.
                        </p>
                        
                        <h4 className="text-base font-semibold mt-4 mb-2">3. Payments</h4>
                        <p className="mb-2">
                          3.1. All payments are processed securely through Instamojo.
                        </p>
                        <p className="mb-2">
                          3.2. You authorize us to charge your payment method for all subscription fees.
                        </p>
                        
                        <h4 className="text-base font-semibold mt-4 mb-2">4. Changes to Subscription</h4>
                        <p className="mb-2">
                          4.1. We reserve the right to modify subscription plans and pricing with advance notice.
                        </p>
                        <p className="mb-2">
                          4.2. Any changes to your subscription will take effect on the next billing cycle.
                        </p>
                        
                        <h4 className="text-base font-semibold mt-4 mb-2">5. Account Restrictions</h4>
                        <p className="mb-2">
                          5.1. Your subscription is for a single user account and cannot be shared.
                        </p>
                        <p className="mb-2">
                          5.2. We reserve the right to terminate accounts found to be in violation of these terms.
                        </p>
                      </DialogDescription>
                    </div>
                    <DialogFooter className="p-4 border-t bg-white">
                      <Button>I Understand</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {" "}and acknowledge our payment terms.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-4 pt-4 border-t absolute bottom-0 left-0 right-0 bg-white">
          <Button 
            className="w-full h-12 text-base font-medium bg-blue-500 hover:bg-blue-600" 
            onClick={handleSubscribe}
            disabled={isProcessing || !termsAccepted}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Proceed to Payment
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionCheckout;
