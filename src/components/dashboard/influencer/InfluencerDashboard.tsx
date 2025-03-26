
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Download, BarChart, PieChart, RefreshCw, ExternalLink } from "lucide-react";
import DashboardWelcome from "../DashboardWelcome";
import InfluencerRank from "./widgets/InfluencerRank";
import PerformanceMetrics from "./widgets/PerformanceMetrics";
import RatingsReviews from "./widgets/RatingsReviews";
import CreativesTracker from "./widgets/CreativesTracker";
import GoogleListingStatus from "./widgets/GoogleListingStatus";
import ReelsProgress from "./widgets/ReelsProgress";
import LeadsGenerated from "./widgets/LeadsGenerated";
import SeoProgress from "./widgets/SeoProgress";
import { useDashboardServices } from "@/hooks/useDashboardServices";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isAdmin, isInfluencer } from "@/utils/roleUtils";

interface InfluencerDashboardProps {
  userId: string;
  subscriptionStatus?: string | null;
}

const InfluencerDashboard: React.FC<InfluencerDashboardProps> = ({ userId, subscriptionStatus }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { services, isLoading: servicesLoading, error } = useDashboardServices(userId, "influencer");
  const { user } = useAuth();
  
  useEffect(() => {
    // Short timeout to ensure services are loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleExportData = (format: string) => {
    toast({
      title: "Export initiated",
      description: `Your data is being exported as ${format.toUpperCase()}`,
      variant: "success",
    });
  };
  
  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been updated",
        variant: "success",
      });
    }, 1000);
  };

  const handleGetSubscription = () => {
    navigate("/subscription");
  };
  
  if (isLoading || servicesLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h3 className="text-xl font-medium">Loading your dashboard</h3>
        <p className="text-muted-foreground">Please wait while we fetch your latest data</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-destructive/10 p-4 rounded-full mb-4">
          <RefreshCw className="h-10 w-10 text-destructive" />
        </div>
        <h3 className="text-xl font-medium">Error loading dashboard</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRefreshData}>Try Again</Button>
      </div>
    );
  }

  // Check if user is admin or if they are an influencer with the right role
  const userHasAccess = isAdmin(user?.role) || isInfluencer(user?.role);
  
  // Check if subscription is active or if user has access
  const hasActiveSubscription = userHasAccess || subscriptionStatus === "active";

  // If no active subscription and not admin
  if (!hasActiveSubscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto text-center">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <ExternalLink className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">You don't have any active subscriptions</h2>
        <p className="text-muted-foreground mb-8">
          Subscribe to our Influencer Growth services to access your personalized dashboard and reach more followers.
        </p>
        <div className="animate-pulse">
          <Button 
            size="lg" 
            className="rounded-full px-8 py-6 text-lg font-medium"
            onClick={handleGetSubscription}
          >
            Get Now
            <ExternalLink className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <DashboardWelcome role="influencer" />
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Tabs defaultValue="all" className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Services</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportData("pdf")}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExportData("excel")}>
            <BarChart className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.includes("rank") && <InfluencerRank />}
        {services.includes("performance") && <PerformanceMetrics />}
        {services.includes("ratings") && <RatingsReviews />}
        {services.includes("creatives") && <CreativesTracker />}
        {services.includes("google_listing") && <GoogleListingStatus />}
        {services.includes("reels") && <ReelsProgress />}
        {services.includes("leads") && <LeadsGenerated />}
        {services.includes("seo") && <SeoProgress />}
        
        {services.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>No Services Active</CardTitle>
              <CardDescription>You don't have any active services in your current plan</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/subscription")}>
                Upgrade Your Plan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InfluencerDashboard;
