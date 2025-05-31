
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { getActiveUserSubscription } from "@/services/subscriptionService";
import SubscriptionPackages from "@/components/subscription/SubscriptionPackages";
import Layout from "@/components/layout/Layout";
import { Loader2, Crown, CheckCircle2 } from "lucide-react";

const SubscriptionPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (isAuthenticated && user?.id) {
        try {
          setIsLoading(true);
          const activeSubscription = await getActiveUserSubscription(user.id);
          setSubscription(activeSubscription);
        } catch (error) {
          console.error("Error fetching subscription:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSubscription();
  }, [isAuthenticated, user]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-6">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock your potential as an influencer with our comprehensive subscription plans. 
            Get connected with local businesses and expand your reach.
          </p>
        </div>

        {/* Active Subscription Banner */}
        {isLoading ? (
          <Card className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-3" />
              <span>Checking your subscription status...</span>
            </CardContent>
          </Card>
        ) : subscription && subscription.status === "active" ? (
          <Card className="max-w-2xl mx-auto mb-12 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <div className="flex items-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 mr-3" />
                <CardTitle className="text-green-800">Active Subscription</CardTitle>
              </div>
              <CardDescription className="text-green-700">
                You have an active subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Plan:</span>
                  <Badge className="bg-green-600 text-white">
                    {subscription.packageName}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Amount:</span>
                  <span>₹{subscription.amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Valid Until:</span>
                  <span>
                    {new Date(subscription.endDate).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={() => window.location.href = "/dashboard"}>
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        ) : null}

        {/* Subscription Plans */}
        {(!subscription || subscription.status !== "active") && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Influencer Subscription Plans
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Choose the plan that best fits your needs and start connecting with businesses in your area.
              </p>
            </div>
            
            <SubscriptionPackages userRole="Influencer" filterByType={true} />
          </div>
        )}

        {/* Benefits Section */}
        <div className="mt-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">1</span>
                </div>
                <h4 className="font-semibold mb-2">Local Business Connections</h4>
                <p className="text-gray-600 text-sm">
                  Connect with businesses in your area based on your subscription radius.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">2</span>
                </div>
                <h4 className="font-semibold mb-2">Flexible Plans</h4>
                <p className="text-gray-600 text-sm">
                  Monthly billing with different coverage areas to match your goals.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h4 className="font-semibold mb-2">Growth Support</h4>
                <p className="text-gray-600 text-sm">
                  Get support and analytics to help grow your influence and earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
