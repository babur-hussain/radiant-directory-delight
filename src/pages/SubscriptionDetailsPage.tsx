
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPackageById } from "@/data/subscriptionData";
import { ArrowLeft, Calendar, CheckCircle, Clock, CreditCard, XCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const SubscriptionDetailsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { getUserSubscription, cancelSubscription } = useSubscription();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [packageDetails, setPackageDetails] = useState<any>(null);
  
  useEffect(() => {
    const fetchSubscription = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const subscriptionData = await getUserSubscription();
          setSubscription(subscriptionData);
          
          if (subscriptionData?.packageId) {
            const pkgDetails = getPackageById(subscriptionData.packageId);
            setPackageDetails(pkgDetails);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        }
      }
      setIsLoading(false);
    };
    
    fetchSubscription();
  }, [isAuthenticated, user, getUserSubscription]);

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

  // Format dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
                  <CardTitle className="text-xl">{packageDetails?.title}</CardTitle>
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
                      <p className="text-sm text-muted-foreground">Subscription Amount</p>
                      <p className="font-medium">₹{subscription.amount}/year</p>
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
                      <p className="text-sm text-muted-foreground">Renewal Date</p>
                      <p className="font-medium">{formatDate(subscription.endDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Billing Cycle</p>
                      <p className="font-medium">Annual</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link to="/subscription">Change Plan</Link>
              </Button>
              
              {subscription.status === 'active' && (
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
                {packageDetails?.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDetailsPage;
