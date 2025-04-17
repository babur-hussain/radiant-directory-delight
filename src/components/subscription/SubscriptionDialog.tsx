
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { ScrollArea } from '@/components/ui/scroll-area';
import RazorpayPayment from '@/components/subscription/RazorpayPayment';

interface SubscriptionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedPackage: ISubscriptionPackage | null;
}

const SubscriptionDialog = ({ isOpen, setIsOpen, selectedPackage }: SubscriptionDialogProps) => {
  const [showPayment, setShowPayment] = useState(false);
  
  // Reset payment state when dialog is closed
  useEffect(() => {
    if (!isOpen) {
      setShowPayment(false);
    }
  }, [isOpen]);
  
  // Handle payment success
  const handlePaymentSuccess = (response: any) => {
    console.log("Payment successful:", response);
    setIsOpen(false);
  };
  
  // Handle payment failure
  const handlePaymentFailure = (error: any) => {
    console.error("Payment failed:", error);
    setShowPayment(false);
  };
  
  // If no package is selected, don't render anything
  if (!selectedPackage) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="flex flex-col max-w-3xl max-h-[85vh] p-0 gap-0">
        <DialogHeader className="sticky top-0 z-10 p-6 bg-white rounded-t-lg border-b">
          <DialogTitle className="text-2xl font-bold">
            {showPayment ? "Complete Payment" : "Package Details"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-grow overflow-y-auto px-6 py-4">
          {showPayment ? (
            <RazorpayPayment 
              selectedPackage={selectedPackage}
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
            />
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{selectedPackage.title}</h3>
                  <p className="text-gray-600">{selectedPackage.shortDescription}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-bold">₹{selectedPackage.price}</span>
                  <span className="text-gray-500 ml-1">
                    {selectedPackage.paymentType === 'recurring' 
                      ? `/${selectedPackage.billingCycle === 'monthly' ? 'month' : 'year'}`
                      : ""
                    }
                  </span>
                  {selectedPackage.popular && (
                    <Badge variant="default" className="ml-2 bg-gradient-to-r from-purple-500 to-indigo-500">
                      Popular
                    </Badge>
                  )}
                </div>
              </div>
              
              {selectedPackage.setupFee > 0 && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800">
                  <p className="font-medium">Setup Fee: ₹{selectedPackage.setupFee}</p>
                  <p className="text-sm">This is a one-time fee charged at the beginning of your subscription.</p>
                </div>
              )}
              
              {selectedPackage.fullDescription && (
                <div className="py-2">
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-gray-700">{selectedPackage.fullDescription}</p>
                </div>
              )}
              
              <div className="pt-2">
                <h4 className="font-semibold mb-3">Package Features</h4>
                <ul className="space-y-3">
                  {selectedPackage.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {selectedPackage.termsAndConditions && (
                <div className="pt-2">
                  <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border">
                    {selectedPackage.termsAndConditions}
                    
                    {/* Standard terms */}
                    <p className="mt-2 text-xs">By proceeding with payment, you agree to our terms of service and acknowledge that all payments are non-refundable.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        
        <div className="sticky bottom-0 flex justify-end gap-2 p-4 border-t bg-white mt-auto rounded-b-lg">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          
          {!showPayment && (
            <Button 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              onClick={() => setShowPayment(true)}
            >
              Proceed to Payment
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
