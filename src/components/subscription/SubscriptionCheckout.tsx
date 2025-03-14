
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionCheckoutProps {
  selectedPackage: SubscriptionPackage;
  onBack: () => void;
}

export const SubscriptionCheckout: React.FC<SubscriptionCheckoutProps> = ({ selectedPackage, onBack }) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { initiateSubscription, isProcessing } = useSubscription();
  
  const handleSubscribe = () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    initiateSubscription(selectedPackage.id);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Plans
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Checkout</CardTitle>
          <CardDescription>Review your subscription plan before proceeding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-md p-4">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">{selectedPackage.title}</h3>
              <span className="font-bold">₹{selectedPackage.price}/year</span>
            </div>
            <p className="text-sm text-muted-foreground">{selectedPackage.shortDescription}</p>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>One-time setup fee</span>
                <span>₹{selectedPackage.setupFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Annual subscription</span>
                <span>₹{selectedPackage.price}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Initial payment</span>
                <span>₹{selectedPackage.setupFee}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Annual recurring payment</span>
                <span>₹{selectedPackage.price}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
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
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Terms and Conditions</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                      <DialogDescription>
                        <h4 className="text-base font-semibold mt-4 mb-2">1. Subscription Terms</h4>
                        <p className="mb-2">
                          1.1. Your subscription will automatically renew at the end of each billing cycle unless cancelled.
                        </p>
                        <p className="mb-2">
                          1.2. A one-time setup fee of ₹{selectedPackage.setupFee} is charged at the beginning of the subscription.
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
                          3.1. All payments are processed securely through Razorpay.
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
                    <DialogFooter>
                      <Button onClick={() => {}}>I Understand</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {" "}and acknowledge our payment terms.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSubscribe}
            disabled={isProcessing || !termsAccepted}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Subscribe Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
