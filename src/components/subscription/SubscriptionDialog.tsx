import React, { useState } from "react";
import { CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
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
import { useSubscription } from "@/hooks/useSubscription";

interface SubscriptionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedPackage: SubscriptionPackage | null;
}

const SubscriptionDialog = ({ isOpen, setIsOpen, selectedPackage }: SubscriptionDialogProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { initiateSubscription, isProcessing } = useSubscription();

  if (!selectedPackage) return null;

  const handleSubscribe = async () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if the selected package is valid
    if (!selectedPackage || !selectedPackage.id) {
      toast({
        title: "Invalid Package",
        description: "The selected package is not available. Please try another one.",
        variant: "destructive",
      });
      return;
    }
    
    // Pass the complete package ID to ensure it can be found
    console.log("Initiating subscription for package:", selectedPackage.id);
    const result = await initiateSubscription(selectedPackage.id);
    
    // If subscription was successful, close the dialog
    if (result) {
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{selectedPackage.title}</DialogTitle>
          <DialogDescription>{selectedPackage.shortDescription}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div className="border-b pb-3">
            <h3 className="font-medium mb-2">Package Features</h3>
            <ul className="space-y-2">
              {selectedPackage.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-b pb-3">
            <h3 className="font-medium mb-2">Pricing Details</h3>
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
                <span>Total initial payment</span>
                <span>₹{selectedPackage.setupFee}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Annual recurring payment</span>
                <span>₹{selectedPackage.price}</span>
              </div>
            </div>
          </div>
          
          <div className="border-b pb-3">
            <h3 className="font-medium mb-2">Terms and Conditions</h3>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md max-h-32 overflow-y-auto mb-3">
              <p className="mb-2">By subscribing to our service, you agree to the following terms:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Your subscription will automatically renew annually.</li>
                <li>You may cancel your subscription at any time from your account dashboard.</li>
                <li>The setup fee is non-refundable.</li>
                <li>All payments are processed securely via Razorpay.</li>
                <li>We reserve the right to modify subscription plans with advance notice.</li>
                <li>Your subscription is for a single business account and cannot be shared.</li>
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
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubscribe}
            disabled={isProcessing || !termsAccepted}
            className="w-full sm:w-auto"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Subscribe Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
