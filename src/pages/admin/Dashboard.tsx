
import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import StatCard from '@/components/admin/StatCard';
import { Users, Package, ShoppingCart, CreditCard, Database } from 'lucide-react';
import RecentUsersTable from '@/components/admin/RecentUsersTable';
import SubscriptionStatsChart from '@/components/admin/SubscriptionStatsChart';
import AvailablePackagesTable from '@/components/admin/AvailablePackagesTable';
import useAdminDashboardStats from '@/hooks/useAdminDashboardStats';
import { Skeleton } from '@/components/ui/skeleton';
import DatabaseMigrationPanel from '@/components/admin/DatabaseMigrationPanel';

const AdminDashboard = () => {
  const { stats, isLoading } = useAdminDashboardStats();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Users" 
            value={isLoading ? <Skeleton className="h-8 w-24" /> : stats.totalUsers}
            icon={<Users className="h-5 w-5" />}
            trend={stats.userTrend}
          />
          <StatCard 
            title="Subscriptions" 
            value={isLoading ? <Skeleton className="h-8 w-24" /> : stats.activeSubscriptions}
            icon={<Package className="h-5 w-5" />}
            trend={stats.subscriptionTrend}
          />
          <StatCard 
            title="Business Accounts" 
            value={isLoading ? <Skeleton className="h-8 w-24" /> : stats.businessAccounts}
            icon={<ShoppingCart className="h-5 w-5" />}
            trend={stats.businessAccountTrend}
          />
          <StatCard 
            title="Revenue" 
            value={isLoading ? <Skeleton className="h-8 w-24" /> : `₹${stats.totalRevenue}`}
            icon={<CreditCard className="h-5 w-5" />}
            trend={stats.revenueTrend}
          />
        </div>
        
        {/* Database Migration Panel */}
        <DatabaseMigrationPanel />
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SubscriptionStatsChart />
          </div>
          <div>
            <AvailablePackagesTable />
          </div>
        </div>
        
        {/* Recent Users */}
        <RecentUsersTable />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
