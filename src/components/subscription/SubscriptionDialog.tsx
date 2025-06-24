import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { updateUserSubscriptionDetails } from '@/lib/mongodb/userUtils';
import { getUserByReferralId, recordReferral } from '@/services/referralService';
import { getReferralIdFromURL } from '@/utils/referral/referralUtils';
import { Check, Sparkles } from 'lucide-react';
import PayUPayment from './PayUPayment';

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
        const subscriptionId = response.merchantTransactionId || `sub_${Date.now()}`;
        await updateUserSubscriptionDetails(
          user.id,
          subscriptionId,
          selectedPackage.id,
          'active'
        );
        
        // Process referral if applicable
        if (referrerId) {
          try {
            const referrerResponse = await getUserByReferralId(referrerId);
            if (referrerResponse?.success && referrerResponse.user && referrerResponse.user.id) {
              await recordReferral(referrerId, selectedPackage.price);
              console.log(`Referral earnings recorded for user ${referrerResponse.user.id}`);
            }
          } catch (refError) {
            console.error("Error processing referral:", refError);
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

  const totalAmount = selectedPackage ? selectedPackage.price + (selectedPackage.setupFee || 0) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-2xl rounded-lg z-[9999]">
        <div className="absolute inset-0 bg-white rounded-lg"></div>
        <div className="relative z-10">
          <DialogHeader className="space-y-3 pb-4 border-b border-gray-100">
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              {paymentSuccess
                ? "🎉 Payment Successful!"
                : `Subscribe to ${selectedPackage?.title}`}
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-gray-600">
              {paymentSuccess
                ? "Your subscription has been activated successfully."
                : "Complete your payment to activate your subscription package."}
            </DialogDescription>
          </DialogHeader>

          {!paymentSuccess && !showPaymentUI && selectedPackage && (
            <div className="space-y-6 py-6">
              {/* Package Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
                <div className="text-center">
                  <h3 className="font-semibold text-lg text-purple-800 mb-2">{selectedPackage.title}</h3>
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-3xl font-bold text-purple-700">₹{totalAmount.toLocaleString('en-IN')}</span>
                    <span className="text-sm text-purple-600">
                      {selectedPackage.paymentType === 'one-time' ? 'total' : `/${selectedPackage.billingCycle || 'yearly'}`}
                    </span>
                  </div>
                  {selectedPackage.setupFee > 0 && (
                    <p className="text-xs text-purple-600">
                      (Includes setup fee: ₹{selectedPackage.setupFee.toLocaleString('en-IN')})
                    </p>
                  )}
                  
                  {referrerId && (
                    <div className="mt-3 text-xs bg-green-100 text-green-700 p-2 rounded-md border border-green-200">
                      <Sparkles className="inline h-3 w-3 mr-1" />
                      Referred by a friend! Their referral code has been applied.
                    </div>
                  )}
                </div>
              </div>

              {/* Package Features */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Package Features:</h4>
                <div className="grid gap-2">
                  {selectedPackage.features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2 pt-4 border-t border-gray-200">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none cursor-pointer text-gray-900"
                  >
                    I accept the Terms and Conditions
                  </label>
                  <p className="text-xs text-gray-500">
                    By checking this box, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {user ? (
                <div className="pt-4 space-y-3">
                  <Button 
                    onClick={handleProceedToPayment} 
                    className="w-full h-12 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    disabled={isProcessing || !termsAccepted}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </Button>
                  <p className="text-xs text-center text-gray-500">
                    All payments are processed securely via Instamojo
                  </p>
                </div>
              ) : (
                <div className="text-center pt-4">
                  <p className="text-red-500 mb-4 text-sm">
                    You must be logged in to subscribe to a package.
                  </p>
                  <Button onClick={handleCloseDialog} variant="outline">Close</Button>
                </div>
              )}
            </div>
          )}

          {!paymentSuccess && showPaymentUI && selectedPackage && user && (
            <div className="py-6">
              <PayUPayment
                selectedPackage={selectedPackage}
                user={user}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
              />
              <div className="mt-4 text-center">
                <Button onClick={() => setShowPaymentUI(false)} variant="outline">Back to Summary</Button>
              </div>
            </div>
          )}

          {paymentSuccess && (
            <div className="space-y-6 py-6">
              <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="font-medium text-lg mb-2">Payment Successful!</p>
                <p className="text-sm">
                  Your subscription has been activated successfully.
                </p>
                
                {referrerId && (
                  <p className="text-xs mt-3 p-2 bg-green-100 rounded border border-green-200">
                    <Sparkles className="inline h-3 w-3 mr-1" />
                    Thanks for using a referral link! Your friend will receive referral benefits.
                  </p>
                )}
              </div>

              <div className="flex justify-center">
                <Button 
                  onClick={handleCloseDialog}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
