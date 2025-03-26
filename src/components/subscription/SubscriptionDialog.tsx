
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowRight, Check } from 'lucide-react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import SubscriptionCheckout from './SubscriptionCheckout';

interface SubscriptionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedPackage: ISubscriptionPackage | null;
}

const SubscriptionDialog: React.FC<SubscriptionDialogProps> = ({ 
  isOpen, 
  setIsOpen, 
  selectedPackage 
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const handleProceedToCheckout = () => {
    if (!user) {
      setIsOpen(false);
      toast({
        title: "Login Required",
        description: "Please login to subscribe to this package",
        variant: "destructive",
      });
      navigate('/auth', { state: { returnTo: '/subscription' } });
      return;
    }
    
    setShowCheckout(true);
  };
  
  if (!selectedPackage) return null;
  
  // Make sure the package has required properties for the checkout component
  const packageWithDefaults = {
    ...selectedPackage,
    shortDescription: selectedPackage.shortDescription || '',
    features: selectedPackage.features || []
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        {!showCheckout ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedPackage.title}</DialogTitle>
              <DialogDescription>
                Review the package details before subscribing
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="w-full md:w-2/3 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Package Description</h3>
                    <p className="text-gray-600 whitespace-pre-line">{selectedPackage.fullDescription || selectedPackage.shortDescription}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Features</h3>
                    <ul className="space-y-2">
                      {Array.isArray(selectedPackage.features) && selectedPackage.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedPackage.termsAndConditions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Terms & Conditions</h3>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{selectedPackage.termsAndConditions}</p>
                    </div>
                  )}
                </div>
                
                <div className="w-full md:w-1/3 bg-gray-50 p-5 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4">Pricing Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Package Price</span>
                      <span className="font-medium">₹{selectedPackage.price}</span>
                    </div>
                    
                    {selectedPackage.setupFee > 0 && (
                      <div className="flex justify-between">
                        <span>Setup Fee</span>
                        <span className="font-medium">₹{selectedPackage.setupFee}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
                      <span>Total Amount</span>
                      <span>₹{(selectedPackage.price || 0) + (selectedPackage.setupFee || 0)}</span>
                    </div>
                    
                    <div className="pt-2 text-sm text-gray-500">
                      {selectedPackage.paymentType === 'one-time' ? (
                        <p>One-time payment</p>
                      ) : (
                        <p>Billed {selectedPackage.billingCycle || 'yearly'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleProceedToCheckout}>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <SubscriptionCheckout 
            selectedPackage={packageWithDefaults} 
            onBack={() => setShowCheckout(false)} 
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
