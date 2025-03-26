
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BusinessDashboard from "@/components/dashboard/business/BusinessDashboard";
import AccessDenied from "@/components/dashboard/AccessDenied";
import { normalizeRole } from '@/types/auth';

const BusinessDashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <AccessDenied message="Please log in to access your dashboard" />;
  }

  const userRole = normalizeRole(user?.role);
  if (userRole === 'business' || userRole === 'admin') {
    return (
      <DashboardLayout>
        <BusinessDashboard userId={user.id} />
      </DashboardLayout>
    );
  }

  return <AccessDenied message="This dashboard is only available for businesses" />;
};

export default BusinessDashboardPage;
