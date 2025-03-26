
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPackageById } from "@/data/subscriptionData";
import { ArrowLeft, Calendar, CheckCircle, Clock, CreditCard, XCircle, Loader2, AlertTriangle } from "lucide-react";
import InfoCircle from "@/components/ui/InfoCircle";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdvancedSubscriptionDetails from "@/components/admin/subscription/AdvancedSubscriptionDetails";

const SubscriptionDetailsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { fetchUserSubscription, cancelSubscription } = useSubscription(user?.id);
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [packageDetails, setPackageDetails] = useState<any>(null);
  
  useEffect(() => {
    const fetchSubscription = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const result = await fetchUserSubscription(user.id);
          if (result.success && result.data) {
            setSubscription(result.data);
            
            if (result.data?.package_id) {
              const pkgDetails = getPackageById(result.data.package_id);
              setPackageDetails(pkgDetails);
            }
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        }
      }
      setIsLoading(false);
    };
    
    fetchSubscription();
  }, [isAuthenticated, user, fetchUserSubscription]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading subscription details...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <CardDescription>
              Please sign in to view your subscription details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>You need to be logged in to access subscription details.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Subscription Details</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>
              You don't have an active subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Subscribe to one of our plans to access premium features.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/subscription">View Subscription Plans</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOneTime = subscription.paymentType === "one-time";

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Subscription Details</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl">{packageDetails?.title}</CardTitle>
                    {isOneTime && (
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                        One-time purchase
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{packageDetails?.shortDescription}</CardDescription>
                </div>
                <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                  {subscription.status === 'active' ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Package Details</h3>
                  <p>{packageDetails?.fullDescription}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isOneTime ? "Amount Paid" : "Subscription Amount"}
                      </p>
                      <p className="font-medium">
                        ₹{subscription.amount}
                        {!isOneTime && "/year"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="font-medium">{formatDate(subscription.startDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isOneTime ? "Valid Until" : "Renewal Date"}
                      </p>
                      <p className="font-medium">{formatDate(subscription.endDate)}</p>
                    </div>
                  </div>
                  
                  {!isOneTime && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Billing Cycle</p>
                        <p className="font-medium">Annual</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {isOneTime && (
                  <div className="bg-amber-50 p-3 rounded-md border border-amber-200 mt-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-amber-800">One-time Purchase</h4>
                        <p className="text-sm text-amber-700">
                          This is a one-time purchase, not a recurring subscription. 
                          You will not be charged again and your access will end on {formatDate(subscription.endDate)}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <AdvancedSubscriptionDetails subscription={subscription} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link to="/subscription">Change Plan</Link>
              </Button>
              
              {subscription.status === 'active' && !isOneTime && subscription.isUserCancellable !== false && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive">Cancel Subscription</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Your Subscription</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel your subscription? You will lose access to premium features once your current period ends.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Keep Subscription</Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          cancelSubscription();
                        }}
                      >
                        Cancel Subscription
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              
              {isOneTime && subscription.status === 'active' && (
                <div className="flex items-center">
                  <InfoCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">One-time purchases cannot be cancelled</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Included Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {packageDetails?.features && packageDetails.features.length > 0 ? (
                  packageDetails.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))
                ) : (
                  <li>No features listed for this package</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetailsPage;
