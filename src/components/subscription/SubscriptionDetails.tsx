
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getPackageById } from "@/data/subscriptionData";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "@/hooks/use-toast";

const SubscriptionDetails = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { initiateSubscription, isProcessing } = useSubscription();
  
  // Get package details
  const selectedPackage = packageId ? getPackageById(packageId) : null;
  
  if (!selectedPackage) {
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

  const handleSubscribe = () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }
    
    initiateSubscription(selectedPackage.id);
  };

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
          <CardTitle className="text-xl">{selectedPackage.title}</CardTitle>
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
                <div className="flex justify-between">
                  <span>One-time setup fee</span>
                  <span>₹{selectedPackage.setupFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual subscription</span>
                  <span>₹{selectedPackage.price}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-medium">
                  <span>Initial payment</span>
                  <span>₹{selectedPackage.setupFee}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Annual recurring payment</span>
                  <span>₹{selectedPackage.price}</span>
                </div>
              </div>
            </div>
            
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
            Proceed to Payment
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
