
import React, { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { useSubscription } from "@/hooks";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks";
import { getGlobalSubscriptionSettings } from "@/lib/subscription/subscription-settings";
import RazorpayPayment from "./RazorpayPayment";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";

interface SubscriptionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedPackage: SubscriptionPackage | null;
}

const SubscriptionDialog = ({ isOpen, setIsOpen, selectedPackage }: SubscriptionDialogProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [packageValidationError, setPackageValidationError] = useState<string | null>(null);
  const { initiateSubscription, isProcessing } = useSubscription();
  const { user } = useAuth();
  const [showPermissionError, setShowPermissionError] = useState(false);
  const [settings, setSettings] = useState<{ allowNonAdminSubscriptions: boolean }>({ 
    allowNonAdminSubscriptions: true 
  });
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { initiatePayment, isLoading: isRazorpayLoading, error: razorpayError } = useRazorpayPayment();

  useEffect(() => {
    if (isOpen && selectedPackage) {
      if (!selectedPackage.id || !selectedPackage.title || selectedPackage.price === undefined) {
        setPackageValidationError("Invalid package data. Some required fields are missing.");
      } else {
        setPackageValidationError(null);
      }
      setShowPaymentUI(false);
      setPaymentProcessing(false);
      setTermsAccepted(false);
    }
  }, [isOpen, selectedPackage]);

  useEffect(() => {
    if (isOpen) {
      const checkPermissions = async () => {
        try {
          const subscriptionSettings = await getGlobalSubscriptionSettings();
          console.log("Current subscription settings:", subscriptionSettings);
          setSettings(subscriptionSettings);
          
          const isAdmin = user?.isAdmin === true || user?.role === "Admin";
          setShowPermissionError(!subscriptionSettings.allowNonAdminSubscriptions && !isAdmin);
        } catch (error) {
          console.error("Error checking permissions:", error);
          setShowPermissionError(false);
        }
      };
      
      checkPermissions();
    }
  }, [isOpen, user]);

  if (!selectedPackage) return null;

  const isOneTimePackage = selectedPackage.paymentType === "one-time";

  const handleSubscribe = async () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedPackage || !selectedPackage.id) {
      toast({
        title: "Invalid Package",
        description: "The selected package is not available. Please try another one.",
        variant: "destructive",
      });
      return;
    }
    
    const isAdmin = user?.isAdmin === true || user?.role === "Admin";
    if (!settings.allowNonAdminSubscriptions && !isAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only administrators can create subscriptions at this time.",
        variant: "destructive",
      });
      return;
    }
    
    // Open Razorpay directly here instead of showing the payment UI
    initiatePayment({
      selectedPackage,
      onSuccess: handlePaymentSuccess,
      onFailure: handlePaymentFailure
    });
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    setPaymentProcessing(true);
    console.log("Payment successful:", paymentResponse);
    
    const result = await initiateSubscription(selectedPackage.id, {
      paymentId: paymentResponse.razorpay_payment_id,
      orderId: paymentResponse.razorpay_order_id,
      signature: paymentResponse.razorpay_signature,
      paymentStatus: "completed",
      paymentType: paymentResponse.paymentType || selectedPackage.paymentType || "recurring"
    });
    
    setPaymentProcessing(false);
    
    if (result) {
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    
    toast({
      title: "Payment Failed",
      description: "We couldn't process your payment. Please try again later.",
      variant: "destructive",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-xl">{selectedPackage.title}</DialogTitle>
            {isOneTimePackage && (
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                One-time
              </span>
            )}
          </div>
          <DialogDescription>{selectedPackage.shortDescription}</DialogDescription>
        </DialogHeader>
        
        {packageValidationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Package Error</AlertTitle>
            <AlertDescription>{packageValidationError}</AlertDescription>
          </Alert>
        )}
        
        {showPermissionError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Permission Denied</AlertTitle>
            <AlertDescription>
              Only administrators can create subscriptions at this time.
            </AlertDescription>
          </Alert>
        )}
        
        {razorpayError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>{razorpayError}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4 my-4">
          <div className="border-b pb-3">
            <h3 className="font-medium mb-2">Package Features</h3>
            <ul className="space-y-2">
              {selectedPackage.features && selectedPackage.features.length > 0 ? (
                selectedPackage.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">No features listed</li>
              )}
            </ul>
          </div>
          
          <div className="border-b pb-3">
            <h3 className="font-medium mb-2">Pricing Details</h3>
            <div className="space-y-2 text-sm">
              {isOneTimePackage ? (
                <div className="flex justify-between font-medium">
                  <span>One-time payment</span>
                  <span>₹{selectedPackage.price}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>One-time setup fee</span>
                    <span>₹{selectedPackage.setupFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Annual subscription</span>
                    <span>₹{selectedPackage.price}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total initial payment</span>
                    <span>₹{selectedPackage.setupFee}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Annual recurring payment</span>
                    <span>₹{selectedPackage.price}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="border-b pb-3">
            <h3 className="font-medium mb-2">Terms and Conditions</h3>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-32 overflow-y-auto mb-3">
              <p className="mb-2">By subscribing to our service, you agree to the following terms:</p>
              <ol className="list-decimal list-inside space-y-1">
                {isOneTimePackage ? (
                  <>
                    <li>This is a one-time payment for a {selectedPackage.durationMonths || 12}-month service.</li>
                    <li>The package will not automatically renew.</li>
                    <li>All payments are processed securely via Razorpay.</li>
                    <li>We reserve the right to modify packages with advance notice.</li>
                    <li>Your package is for a single business account and cannot be shared.</li>
                  </>
                ) : (
                  <>
                    <li>Your subscription will automatically renew annually.</li>
                    <li>You may cancel your subscription at any time from your account dashboard.</li>
                    <li>The setup fee is non-refundable.</li>
                    <li>All payments are processed securely via Razorpay.</li>
                    <li>We reserve the right to modify subscription plans with advance notice.</li>
                    <li>Your subscription is for a single business account and cannot be shared.</li>
                  </>
                )}
              </ol>
            </div>
            
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms-agreement" 
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                className="mt-1"
              />
              <div>
                <label
                  htmlFor="terms-agreement"
                  className="text-sm font-medium cursor-pointer"
                >
                  I accept the Terms and Conditions
                </label>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
          
          {!termsAccepted && (
            <div className="flex items-center text-amber-600 bg-amber-50 p-2 rounded-md text-sm">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>You must accept the terms and conditions to continue</span>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            className="w-full sm:w-auto"
            disabled={isProcessing || isRazorpayLoading || paymentProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubscribe}
            disabled={isProcessing || !termsAccepted || showPermissionError || !!packageValidationError || isRazorpayLoading || paymentProcessing}
            className="w-full sm:w-auto"
          >
            {isRazorpayLoading || paymentProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {paymentProcessing ? "Processing..." : "Loading..."}
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Proceed to Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
