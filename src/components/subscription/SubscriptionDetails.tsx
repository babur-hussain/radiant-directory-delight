import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ShieldCheck, Loader2 } from "lucide-react";
import InfoCircle from "@/components/ui/InfoCircle";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPackageById } from "@/data/subscriptionData";
import { fetchSubscriptionPackages } from "@/lib/firebase-utils";
import { SubscriptionPackage } from "@/data/subscriptionData";
import { useSubscription } from "@/hooks";
import { useToast } from "@/hooks/use-toast";

const SubscriptionDetails = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { purchaseSubscription, isProcessing } = useSubscription();
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentUI, setShowPaymentUI] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadPackage = async () => {
      if (!packageId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const allPackages = await fetchSubscriptionPackages();
        const foundPackage = allPackages.find(pkg => pkg.id === packageId);
        
        if (foundPackage) {
          setSelectedPackage(foundPackage);
        } else {
          const defaultPackage = getPackageById(packageId);
          
          if (defaultPackage) {
            setSelectedPackage(defaultPackage);
          } else {
            setError("Package not found");
          }
        }
      } catch (err) {
        console.error("Error fetching package:", err);
        
        const defaultPackage = getPackageById(packageId);
        
        if (defaultPackage) {
          setSelectedPackage(defaultPackage);
          toast({
            title: "Using Default Package",
            description: "Could not load the package from server. Using default data.",
          });
        } else {
          setError("Package not found");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPackage();
  }, [packageId]);

  const handleSubscribe = () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedPackage) {
      setShowPaymentUI(true);
    }
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    setPaymentProcessing(true);
    console.log("Payment successful:", paymentResponse);
    
    if (selectedPackage) {
      await purchaseSubscription(selectedPackage as any);
    }
    
    setPaymentProcessing(false);
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading package details...</span>
      </div>
    );
  }

  // Redirect to subscription page if there's an error or no package found
  if (error || !selectedPackage) {
    navigate("/subscription");
    return null; // Return null while redirecting
  }

  if (showPaymentUI) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => setShowPaymentUI(false)} className="mr-2" disabled={paymentProcessing}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Package Details
          </Button>
          <h1 className="text-2xl font-bold">Complete Payment</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Process Payment</CardTitle>
            <CardDescription>
              {selectedPackage?.paymentType === "one-time" 
                ? "Complete your one-time payment to activate your package" 
                : "Complete your payment to activate your subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentProcessing ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-center">Processing your payment...</p>
              </div>
            ) : (
              <p>Payment placeholder</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOneTimePackage = selectedPackage.paymentType === "one-time";
  const totalPrice = selectedPackage.price + (selectedPackage.setupFee || 0);

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl subscription-details-container">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate("/subscription")} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
        <h1 className="text-2xl font-bold">Subscription Details</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">{selectedPackage.title}</CardTitle>
            {isOneTimePackage && (
              <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                One-time payment
              </span>
            )}
          </div>
          <CardDescription>{selectedPackage.shortDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">About this Plan</h3>
              <p className="text-gray-700">{selectedPackage.fullDescription}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Features</h3>
              <ul className="space-y-2">
                {selectedPackage.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Pricing</h3>
              <div className="space-y-2 text-sm">
                {isOneTimePackage ? (
                  <>
                    {selectedPackage.setupFee > 0 && (
                      <div className="flex justify-between">
                        <span>Setup fee</span>
                        <span>₹{selectedPackage.setupFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Base price</span>
                      <span>₹{selectedPackage.price}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total one-time payment</span>
                      <span>₹{totalPrice}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>One-time setup fee</span>
                      <span>₹{selectedPackage.setupFee || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Annual subscription</span>
                      <span>₹{selectedPackage.price}</span>
                    </div>
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
            
            {isOneTimePackage && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <div className="flex items-start gap-2">
                  <InfoCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">One-time Purchase</h4>
                    <p className="text-sm text-amber-700">
                      This is a one-time purchase valid for {selectedPackage.durationMonths} months. 
                      You will not be automatically charged again after purchase.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div id="terms-section" className="flex items-start space-x-2 pt-4 border-t">
              <div className="flex h-5 items-center">
                <Checkbox 
                  id="terms" 
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                />
              </div>
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I accept the Terms and Conditions
                </label>
                <p className="text-sm text-muted-foreground">
                  By checking this box, you agree to our Terms of Service and that you have read our Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-4 pt-4 border-t">
          <Button 
            className="w-full h-12 text-base font-medium" 
            onClick={handleSubscribe}
            disabled={isProcessing || !termsAccepted}
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            {isOneTimePackage ? "Proceed to Payment" : "Proceed to Payment"}
          </Button>
          <p className="text-xs mt-2 text-center text-muted-foreground">
            All payments are processed securely via Instamojo
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionDetails;
