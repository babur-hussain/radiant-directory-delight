
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InfluencerDashboard from "@/components/dashboard/influencer/InfluencerDashboard";
import AccessDenied from "@/components/dashboard/AccessDenied";

const InfluencerDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AccessDenied message="Please log in to access your dashboard" />;
  }

  // Update this condition to allow both Influencer users and Admin users
  if (user?.role !== "Influencer" && user?.role !== "Admin" && !user?.isAdmin) {
    return <AccessDenied message="This dashboard is only available for influencers" />;
  }

  return (
    <DashboardLayout>
      <InfluencerDashboard userId={user.id} />
    </DashboardLayout>
  );
};

export default InfluencerDashboardPage;
