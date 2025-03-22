import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ShieldCheck, Loader2, CreditCard, Clock, Calendar } from "lucide-react";
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
import RazorpayPayment from "./RazorpayPayment";

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

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "₹0";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading package details...</span>
      </div>
    );
  }

  if (error || !selectedPackage) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Package Not Found</CardTitle>
            <CardDescription>
              The subscription package you're looking for could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please return to the subscription page and select a valid package.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/subscription")}>
              Back to Subscription Plans
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
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
              {selectedPackage.paymentType === "one-time" 
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
              <RazorpayPayment 
                selectedPackage={selectedPackage}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
              />
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOneTimePackage = selectedPackage.paymentType === "one-time";
  const isMonthly = selectedPackage.billingCycle === "monthly";

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
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
            <Badge 
              className={`${isOneTimePackage ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'} 
              text-xs font-medium px-2 py-1 rounded`}
            >
              {isOneTimePackage ? 'One-time payment' : selectedPackage.billingCycle === 'monthly' ? 'Monthly billing' : 'Annual billing'}
            </Badge>
          </div>
          <CardDescription>{selectedPackage.shortDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {selectedPackage.fullDescription && (
              <div>
                <h3 className="text-lg font-medium mb-2">About this Plan</h3>
                <p className="text-gray-700">{selectedPackage.fullDescription}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-2">Features</h3>
              <ul className="space-y-2">
                {selectedPackage.features?.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 text-primary mr-2 mt-1" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Pricing</h3>
              <div className="bg-gray-50 p-4 rounded-lg border space-y-3">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-primary">
                    {isOneTimePackage 
                      ? formatCurrency(selectedPackage.price)
                      : isMonthly && selectedPackage.monthlyPrice 
                        ? formatCurrency(selectedPackage.monthlyPrice) 
                        : formatCurrency(selectedPackage.price)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {isOneTimePackage ? 'one-time' : (isMonthly ? '/month' : '/year')}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm border-t pt-3 mt-2">
                  {!isOneTimePackage && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Duration</span>
                      </div>
                      <span>{selectedPackage.durationMonths || 12} months</span>
                    </div>
                  )}
                  
                  {selectedPackage.setupFee > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Setup fee</span>
                      </div>
                      <span>{formatCurrency(selectedPackage.setupFee)}</span>
                    </div>
                  )}
                  
                  {!isOneTimePackage && selectedPackage.advancePaymentMonths > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Advance payment</span>
                      </div>
                      <span>{selectedPackage.advancePaymentMonths} months</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-2 mt-2 font-medium">
                    <div className="flex justify-between items-center">
                      <span>Initial payment</span>
                      <span>{formatCurrency(
                        (isOneTimePackage ? selectedPackage.price : 0) +
                        (selectedPackage.setupFee || 0) + 
                        (!isOneTimePackage && isMonthly && selectedPackage.monthlyPrice 
                          ? selectedPackage.monthlyPrice * (selectedPackage.advancePaymentMonths || 1)
                          : !isOneTimePackage && !isMonthly
                            ? selectedPackage.price
                            : 0)
                      )}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {isOneTimePackage && (
              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <div className="flex items-start gap-2">
                  <InfoCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">One-time Purchase</h4>
                    <p className="text-sm text-amber-700">
                      This is a one-time purchase valid for {selectedPackage.durationMonths || 12} months. 
                      You will not be automatically charged again after purchase.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {!isOneTimePackage && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <div className="flex items-start gap-2">
                  <InfoCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800">Recurring Subscription</h4>
                    <p className="text-sm text-blue-700">
                      This is a {selectedPackage.billingCycle} subscription that will automatically renew. 
                      You can cancel anytime from your account dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-start space-x-2 pt-4 border-t">
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
        <CardFooter className="flex-col items-stretch space-y-2">
          <Button 
            className="w-full" 
            onClick={handleSubscribe}
            disabled={isProcessing || !termsAccepted}
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            {isOneTimePackage ? "Proceed to Payment" : "Subscribe Now"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            All payments are processed securely via Razorpay
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionDetails;
