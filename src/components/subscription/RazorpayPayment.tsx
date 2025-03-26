
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { loadRazorpayScript, isRazorpayAvailable } from '@/utils/razorpay';
import { Loader2, ExternalLink } from 'lucide-react';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';

interface RazorpayPaymentProps {
  selectedPackage: ISubscriptionPackage;
  onSuccess: (paymentResponse: any) => void;
  onFailure: (error: any) => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({ 
  selectedPackage, 
  onSuccess, 
  onFailure 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    const initializePayment = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First, load the Razorpay script
        await loadRazorpayScript();
        
        if (!isRazorpayAvailable()) {
          throw new Error('Payment gateway could not be loaded');
        }
        
        // Fetch payment information from our backend
        const { data, error } = await supabase.functions.invoke('razorpay-integration', {
          body: {
            userId: user?.id,
            packageData: selectedPackage,
            customerData: {
              name: user?.name || user?.email?.split('@')[0] || 'Customer',
              email: user?.email || '',
            },
            useOneTimePreferred: true,
            enableAutoPay: true
          },
        });
        
        if (error) {
          console.error('Error fetching payment data:', error);
          throw new Error('Failed to initialize payment. Please try again.');
        }
        
        console.log('Payment data received:', data);
        setPaymentData(data);
        
      } catch (err) {
        console.error('Error initializing payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializePayment();
  }, [selectedPackage, user]);
  
  const handlePayment = () => {
    if (!paymentData || !isRazorpayAvailable()) {
      setError('Payment gateway not available. Please try again.');
      return;
    }
    
    try {
      // Create options for Razorpay
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'DirectSpot',
        description: paymentData.description || `Payment for ${selectedPackage.title}`,
        image: window.location.origin + '/logo.png',
        notes: paymentData.notes || {},
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#4969F6'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment window closed');
            onFailure({ message: 'Payment cancelled by user' });
          }
        },
        handler: function(response: any) {
          console.log('Payment successful:', response);
          
          // Add the package details to the response
          const completeResponse = {
            ...response,
            packageDetails: selectedPackage,
            paymentDetails: {
              amount: paymentData.amount / 100, // Convert from paise to rupees
              currency: paymentData.currency || 'INR',
              description: paymentData.description,
              isOneTime: paymentData.isOneTime,
              setupFee: paymentData.setupFee,
              nextBillingDate: paymentData.nextBillingDate
            }
          };
          
          onSuccess(completeResponse);
        }
      };
      
      // Initialize Razorpay
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
      
    } catch (err) {
      console.error('Error opening payment:', err);
      onFailure(err);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-center">Initializing payment gateway...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-500 mb-4">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-6 bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span>{selectedPackage.title}</span>
            <span>₹{selectedPackage.price}</span>
          </div>
          
          {selectedPackage.setupFee > 0 && (
            <div className="flex justify-between">
              <span>Setup Fee</span>
              <span>₹{selectedPackage.setupFee}</span>
            </div>
          )}
          
          <div className="pt-2 border-t border-gray-200 flex justify-between font-bold">
            <span>Total</span>
            <span>₹{(selectedPackage.price || 0) + (selectedPackage.setupFee || 0)}</span>
          </div>
        </div>
      </div>
      
      <div className="text-center">
        <Button 
          onClick={handlePayment}
          className="h-12 px-8 text-base font-medium" 
          size="lg"
        >
          Pay Now <ExternalLink className="ml-2 h-4 w-4" />
        </Button>
        
        <p className="text-sm text-gray-500 mt-3">
          Payments are securely processed by Razorpay
        </p>
      </div>
    </div>
  );
};

export default RazorpayPayment;
