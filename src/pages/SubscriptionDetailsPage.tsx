
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { useSubscription } from '@/hooks/useSubscription';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import PaytmPayment from '@/components/subscription/PaytmPayment';
import { adminAssignPaytmSubscription } from '@/lib/subscription/admin-paytm-subscription';

const SubscriptionDetailsPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { packages, isLoading, isError } = useSubscriptionPackages();
  const { fetchUserSubscription } = useSubscription(user?.id);
  
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view subscription details');
      navigate('/login');
      return;
    }

    // Check for active subscription
    const checkActiveSubscription = async () => {
      if (user) {
        try {
          const result = await fetchUserSubscription(user.id);
          if (result?.success && result?.data) {
            setActiveSubscription(result.data);
          }
        } catch (error) {
          console.error('Error checking subscription:', error);
        }
      }
    };

    checkActiveSubscription();
  }, [isAuthenticated, user, navigate, fetchUserSubscription]);

  useEffect(() => {
    if (packages && packageId) {
      const pkg = packages.find(p => p.id === packageId);
      if (pkg) {
        setSelectedPackage(pkg);
      } else {
        toast.error('Package not found');
        navigate('/subscription');
      }
    }
  }, [packages, packageId, navigate]);

  const handlePaymentSuccess = async (paymentResponse: any) => {
    console.log('Payment successful, processing subscription:', paymentResponse);
    
    // Validate payment response before processing
    if (!paymentResponse.paymentVerified || paymentResponse.STATUS !== 'TXN_SUCCESS') {
      toast.error('Payment verification failed. Please contact support.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create subscription using the payment details
      const subscriptionCreated = await adminAssignPaytmSubscription(
        user!.uid,
        selectedPackage,
        paymentResponse
      );

      if (subscriptionCreated) {
        toast.success('Subscription activated successfully!');
        
        // Redirect to dashboard or subscription page
        setTimeout(() => {
          navigate('/subscription');
        }, 2000);
      } else {
        toast.error('Failed to activate subscription. Please contact support.');
      }
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast.error('Failed to activate subscription. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentFailure = (error: any) => {
    console.error('Payment failed:', error);
    setShowPayment(false);
    
    let errorMessage = 'Payment failed. Please try again.';
    if (error.RESPMSG) {
      errorMessage = error.RESPMSG;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    toast.error(errorMessage);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading package details...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !selectedPackage) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Package Not Found</h2>
            <p className="text-gray-600 mb-4">The requested subscription package could not be found.</p>
            <Button onClick={() => navigate('/subscription')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Show success message if processing subscription
  if (isProcessing) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">
                Your subscription is being activated. Please wait...
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">
                  You will be redirected to your subscription dashboard shortly.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Check if user already has active subscription
  if (activeSubscription && activeSubscription.status === 'active') {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>You already have an active subscription</CardTitle>
              <CardDescription>
                You cannot purchase a new subscription while your current one is active.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800">Current Subscription</h3>
                  <p className="text-blue-700">{activeSubscription.packageName}</p>
                  <p className="text-blue-600 text-sm">
                    Active until {new Date(activeSubscription.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/subscription')} variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Subscriptions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  const isOneTime = selectedPackage.paymentType === 'one-time';
  const timeframe = isOneTime ? 'total' : `/${selectedPackage.billingCycle || 'yearly'}`;
  const displayPrice = selectedPackage.billingCycle === 'monthly' && selectedPackage.monthlyPrice 
    ? selectedPackage.monthlyPrice 
    : selectedPackage.price;
  const totalAmount = selectedPackage.price + (selectedPackage.setupFee || 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate('/subscription')}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Package Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">{selectedPackage.title}</CardTitle>
                  {selectedPackage.popular && (
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  )}
                </div>
                <CardDescription>{selectedPackage.shortDescription}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">₹{displayPrice.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 ml-1">{timeframe}</span>
                  </div>
                  {selectedPackage.setupFee > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      + ₹{selectedPackage.setupFee.toLocaleString('en-IN')} setup fee
                    </p>
                  )}
                  <p className="text-lg font-semibold text-green-600 mt-2">
                    Total: ₹{totalAmount.toLocaleString('en-IN')}
                  </p>
                </div>

                {selectedPackage.fullDescription && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{selectedPackage.fullDescription}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <ul className="space-y-2">
                    {Array.isArray(selectedPackage.features) && selectedPackage.features.length > 0 ? (
                      selectedPackage.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Package features will be updated soon</span>
                      </li>
                    )}
                  </ul>
                </div>

                {selectedPackage.termsAndConditions && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Terms & Conditions</h3>
                    <p className="text-sm text-gray-600">{selectedPackage.termsAndConditions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle>Complete Your Purchase</CardTitle>
                <CardDescription>
                  {showPayment ? 'Complete your payment to activate your subscription' : 'Ready to get started?'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!showPayment ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Payment Summary</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Package Price:</span>
                          <span>₹{selectedPackage.price.toLocaleString('en-IN')}</span>
                        </div>
                        {selectedPackage.setupFee > 0 && (
                          <div className="flex justify-between">
                            <span>Setup Fee:</span>
                            <span>₹{selectedPackage.setupFee.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold">
                          <span>Total Amount:</span>
                          <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setShowPayment(true)} 
                      className="w-full h-12 text-lg"
                      size="lg"
                    >
                      Proceed to Payment
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      By proceeding, you agree to our terms and conditions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <PaytmPayment
                      selectedPackage={selectedPackage}
                      onSuccess={handlePaymentSuccess}
                      onFailure={handlePaymentFailure}
                    />
                    
                    <Button 
                      onClick={() => setShowPayment(false)} 
                      variant="outline" 
                      className="w-full"
                    >
                      Back to Summary
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionDetailsPage;
