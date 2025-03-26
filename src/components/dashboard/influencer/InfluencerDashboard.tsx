
import React, { useEffect, useState } from "react";
import { useDashboardSections } from "@/hooks/useDashboardSections";
import { useDashboardServices } from "@/hooks/useDashboardServices";
import { useSubscription } from "@/hooks/useSubscription";
import RatingsReviews from "./widgets/RatingsReviews";
import LeadsGenerated from "./widgets/LeadsGenerated";
import SeoProgress from "./widgets/SeoProgress";
import PerformanceMetrics from "./widgets/PerformanceMetrics";
import ReelsProgress from "./widgets/ReelsProgress";
import InfluencerRank from "./widgets/InfluencerRank";
import GoogleListingStatus from "./widgets/GoogleListingStatus";
import CreativesTracker from "./widgets/CreativesTracker";
import AccessDenied from "../AccessDenied";

interface InfluencerDashboardProps {
  userId: string;
}

const InfluencerDashboard: React.FC<InfluencerDashboardProps> = ({ userId }) => {
  const [showWidgets, setShowWidgets] = useState<boolean>(false);
  const { sections, loading: sectionsLoading } = useDashboardSections();
  const { services, loading: servicesLoading } = useDashboardServices();
  const { userSubscription, loading: subscriptionLoading, error } = useSubscription();

  useEffect(() => {
    // Check if user has access to dashboard based on subscription
    const checkAccess = async () => {
      // Wait for subscription data to be loaded
      if (subscriptionLoading) return;
      
      if (userSubscription) {
        // User has an active subscription
        setShowWidgets(true);
      } else {
        setShowWidgets(false);
      }
    };
    
    checkAccess();
  }, [userSubscription, subscriptionLoading]);

  if (subscriptionLoading || sectionsLoading || servicesLoading) {
    return <div className="p-6">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading dashboard: {error}</div>;
  }

  if (!showWidgets) {
    return (
      <AccessDenied message="You need an active subscription to access the influencer dashboard" />
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Influencer Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <RatingsReviews />
        <PerformanceMetrics />
        <LeadsGenerated />
        <InfluencerRank />
        <SeoProgress />
        <ReelsProgress />
        <GoogleListingStatus />
        <CreativesTracker />
      </div>
    </div>
  );
};

export default InfluencerDashboard;
