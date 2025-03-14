
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BusinessDashboard from "@/components/dashboard/business/BusinessDashboard";
import AccessDenied from "@/components/dashboard/AccessDenied";

const BusinessDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AccessDenied message="Please log in to access your dashboard" />;
  }

  if (user?.role !== "Business") {
    return <AccessDenied message="This dashboard is only available for businesses" />;
  }

  return (
    <DashboardLayout>
      <BusinessDashboard userId={user.id} />
    </DashboardLayout>
  );
};

export default BusinessDashboardPage;
