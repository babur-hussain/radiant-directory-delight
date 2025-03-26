import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InfluencerDashboard from "@/components/dashboard/influencer/InfluencerDashboard";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { normalizeRole } from '@/types/auth';

const InfluencerDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AccessDenied message="Please log in to access your dashboard" />;
  }

  if (normalizeRole(user?.role) === 'influencer' || normalizeRole(user?.role) === 'admin') {
    return (
      <DashboardLayout>
        <InfluencerDashboard userId={user.id} />
      </DashboardLayout>
    );
  }

  return <AccessDenied message="This dashboard is only available for influencers" />;
};

export default InfluencerDashboardPage;
