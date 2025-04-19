
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import RazorpayPayment from './RazorpayPayment';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { updateUserSubscriptionDetails } from '@/lib/mongodb/userUtils';
import { getUserByReferralId, recordReferral } from '@/services/referralService';
import { getReferralIdFromURL } from '@/utils/referral/referralUtils';

interface SubscriptionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedPackage: ISubscriptionPackage | null;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedPackage,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [showPaymentUI, setShowPaymentUI] = useState<boolean>(false);
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const { user, refreshUserData } = useAuth();

  // Check for referral code in URL
  useEffect(() => {
    const urlReferralId = getReferralIdFromURL();
    if (urlReferralId) {
      setReferrerId(urlReferralId);
    }
  }, []);

  const handlePaymentSuccess = async (response: any) => {
    console.log("Payment successful. Response:", response);
    setPaymentSuccess(true);
    setIsProcessing(false);
    
    // Ensure user profile is updated with subscription details
    if (user?.id && selectedPackage) {
      try {
        // Update the user profile with subscription details
        const subscriptionId = response.razorpay_payment_id || `sub_${Date.now()}`;
        await updateUserSubscriptionDetails(
          user.id,
          subscriptionId,
          selectedPackage.id,
          'active'
        );
        
        // Process referral if applicable
        if (referrerId) {
          try {
            const referrerUser = await getUserByReferralId(referrerId);
            if (referrerUser?.id) {
              await recordReferral(referrerUser.id, selectedPackage.price);
              console.log(`Referral earnings recorded for user ${referrerUser.id}`);
            }
          } catch (refError) {
            console.error("Error processing referral:", refError);
            // We don't want to fail the subscription if referral processing fails
          }
        }
        
        // Force refresh of user data to update UI
        await refreshUserData();
        
        toast({
          title: "Subscription Activated",
          description: `Your ${selectedPackage.title} subscription has been successfully activated!`,
        });
      } catch (error) {
        console.error("Error updating user profile:", error);
      }
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    setIsProcessing(false);
    setShowPaymentUI(false);
    toast({
      title: "Payment Failed",
      description: error.message || "There was an issue processing your payment. Please try again.",
      variant: "destructive",
    });
  };

  const handleCloseDialog = () => {
    if (!isProcessing) {
      setIsOpen(false);
      // Reset state for next time the dialog opens
      setTimeout(() => {
        setPaymentSuccess(false);
        setShowPaymentUI(false);
        setTermsAccepted(false);
      }, 300);
    }
  };

  const handleProceedToPayment = () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {paymentSuccess
              ? "Payment Successful!"
              : `Subscribe to ${selectedPackage?.title}`}
          </DialogTitle>
        </DialogHeader>

        {!paymentSuccess && !showPaymentUI && selectedPackage && (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-500 mb-4">
              <p>You are subscribing to the {selectedPackage.title} package</p>
              <p className="text-lg font-bold mt-1">₹{selectedPackage.price}</p>
              {selectedPackage.setupFee > 0 && (
                <p className="text-xs mt-1">
                  (Includes one-time setup fee: ₹{selectedPackage.setupFee})
                </p>
              )}
              
              {referrerId && (
                <div className="mt-2 text-xs bg-green-50 text-green-700 p-2 rounded-md">
                  Referred by a friend! Their referral code has been applied.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="text-sm">
                <h4 className="font-medium mb-2">Package Features:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedPackage.features.slice(0, 5).map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-start space-x-2 pt-4 border-t">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none"
                  >
                    I accept the Terms and Conditions
                  </label>
                  <p className="text-xs text-muted-foreground">
                    By checking this box, you agree to our Terms of Service and that you have read our Privacy Policy.
                  </p>
                </div>
              </div>
            </div>

            {user ? (
              <div className="pt-4">
                <Button 
                  onClick={handleProceedToPayment} 
                  className="w-full"
                  disabled={isProcessing}
                >
                  Proceed to Payment
                </Button>
                <p className="text-xs mt-2 text-center text-muted-foreground">
                  All payments are processed securely via Razorpay
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-red-500 mb-4">
                  You must be logged in to subscribe to a package.
                </p>
                <Button onClick={handleCloseDialog}>Close</Button>
              </div>
            )}
          </div>
        )}

        {!paymentSuccess && showPaymentUI && selectedPackage && user && (
          <div>
            <RazorpayPayment
              selectedPackage={selectedPackage}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              referralId={referrerId}
            />
            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowPaymentUI(false)} 
                disabled={isProcessing}
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {paymentSuccess && (
          <div className="space-y-6 py-4">
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
              <p className="font-medium">Payment Successful!</p>
              <p className="text-sm mt-2">
                Your subscription has been activated successfully.
              </p>
              
              {referrerId && (
                <p className="text-xs mt-2">
                  Thanks for using a referral link! Your friend will receive referral benefits.
                </p>
              )}
            </div>

            <div className="flex justify-center">
              <Button onClick={handleCloseDialog}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
