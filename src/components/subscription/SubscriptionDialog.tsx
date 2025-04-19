
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import RazorpayPayment from './RazorpayPayment';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { updateUserSubscriptionDetails } from '@/lib/mongodb/userUtils';

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
  const { user, refreshUserData } = useAuth();

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
      }, 300);
    }
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

        {!paymentSuccess && selectedPackage && (
          <div className="space-y-4">
            <div className="text-center text-sm text-gray-500 mb-4">
              <p>You are subscribing to the {selectedPackage.title} package</p>
              <p className="text-lg font-bold mt-1">₹{selectedPackage.price}</p>
              {selectedPackage.setupFee > 0 && (
                <p className="text-xs mt-1">
                  (Includes one-time setup fee: ₹{selectedPackage.setupFee})
                </p>
              )}
            </div>

            {user ? (
              <RazorpayPayment
                selectedPackage={selectedPackage}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
              />
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

        {paymentSuccess && (
          <div className="space-y-6 py-4">
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-md">
              <p className="font-medium">Payment Successful!</p>
              <p className="text-sm mt-2">
                Your subscription has been activated successfully.
              </p>
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
