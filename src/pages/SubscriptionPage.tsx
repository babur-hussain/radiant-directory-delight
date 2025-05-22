
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import SubscriptionPackages from "@/components/subscription/SubscriptionPackages";
import Layout from "@/components/layout/Layout";

const SubscriptionPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { fetchUserSubscription } = useSubscription(user?.id);
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSubscription = async () => {
      if (isAuthenticated && user) {
        try {
          setIsLoading(true);
          const result = await fetchUserSubscription(user.id);
          if (result?.success && result?.data) {
            setSubscription(result.data);
          }
        } catch (error) {
          console.error("Error fetching subscription:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    getSubscription();
  }, [isAuthenticated, user, fetchUserSubscription]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Subscription Plans</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your needs and start growing your business
            today.
          </p>
        </div>

        {subscription && subscription.status === "active" ? (
          <Card className="max-w-2xl mx-auto mb-12">
            <CardHeader>
              <CardTitle>You have an active subscription</CardTitle>
              <CardDescription>
                You already have an active subscription plan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                You are currently subscribed to the{" "}
                <strong>{subscription.packageName}</strong> plan which is active
                until{" "}
                {new Date(subscription.endDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                .
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button onClick={() => window.location.href = "/subscription/details"}>
                View Subscription Details
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <SubscriptionPackages userRole={user?.role || "User"} />
        )}
      </div>
    </Layout>
  );
};

export default SubscriptionPage;
