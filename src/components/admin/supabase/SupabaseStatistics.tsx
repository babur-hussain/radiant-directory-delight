import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, BarChart, LineChart } from '@/components/ui/charts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChartData } from 'chart.js';

const SupabaseStatistics = () => {
  const [activeTab, setActiveTab] = useState('packages');
  const [isLoading, setIsLoading] = useState(true);
  const [packageStats, setPackageStats] = useState<any>({
    packageDistribution: { labels: [], data: [] },
    subscribersTrend: { labels: [], datasets: [] },
    categoryDistribution: { labels: [], data: [] }
  });
  const [userStats, setUserStats] = useState<any>({
    roleDistribution: { labels: [], data: [] },
    userGrowth: { labels: [], data: [] },
    subscriptionStatus: { labels: [], data: [] }
  });
  const [businessStats, setBusinessStats] = useState<any>({
    categoryDistribution: { labels: [], data: [] },
    featuredCount: { featured: 0, regular: 0 },
    ratingDistribution: { labels: [], data: [] }
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    loadAllStats();
  }, []);
  
  const loadAllStats = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadPackageStats(),
        loadUserStats(),
        loadBusinessStats()
      ]);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast({
        title: 'Statistics Error',
        description: 'Failed to load some statistics data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadPackageStats = async () => {
    try {
      // Get all packages for distribution
      const { data: packages, error: packagesError } = await supabase
        .from('subscription_packages')
        .select('*');
      
      if (packagesError) throw packagesError;
      
      // Manual aggregation for package distribution
      const typeCounts: Record<string, number> = {};
      packages?.forEach(pkg => {
        const type = pkg.type || 'Unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      const packageDistribution = {
        labels: Object.keys(typeCounts),
        data: Object.values(typeCounts)
      };
      
      // Manual aggregation for category distribution by counting packages with similar first word in title
      const categoryCounts: Record<string, number> = {};
      packages?.forEach(pkg => {
        // Use first word of title as a pseudo-category
        const category = pkg.title?.split(' ')[0] || 'Other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      const categoryDistribution = {
        labels: Object.keys(categoryCounts),
        data: Object.values(categoryCounts)
      };
      
      // Get all subscriptions for trend data, grouped by creation month
      const { data: subscriptions, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('created_at, package_name');
      
      if (subscriptionsError) throw subscriptionsError;
      
      // Create monthly trend data
      const monthlyData: Record<string, Record<string, number>> = {};
      const packageNames = new Set<string>();
      
      subscriptions?.forEach(sub => {
        const date = new Date(sub.created_at);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        const packageName = sub.package_name || 'Unknown';
        
        packageNames.add(packageName);
        
        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = {};
        }
        
        monthlyData[monthYear][packageName] = (monthlyData[monthYear][packageName] || 0) + 1;
      });
      
      // Sort months chronologically
      const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
        const [aMonth, aYear] = a.split('/').map(Number);
        const [bMonth, bYear] = b.split('/').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      });
      
      // Create datasets for each package
      const packageNameArray = Array.from(packageNames);
      const datasets = packageNameArray.map((name, index) => {
        const data = sortedMonths.map(month => monthlyData[month][name] || 0);
        return {
          label: name,
          data,
          borderColor: getColorForIndex(index),
          backgroundColor: getColorForIndex(index, 0.2)
        };
      });
      
      const subscribersTrend = {
        labels: sortedMonths,
        datasets
      };
      
      setPackageStats({
        packageDistribution,
        subscribersTrend,
        categoryDistribution
      });
    } catch (error) {
      console.error('Error loading package stats:', error);
      throw error;
    }
  };
  
  const loadUserStats = async () => {
    try {
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Manual aggregation for role distribution
      const roleCounts: Record<string, number> = {};
      users?.forEach(user => {
        const role = user.role || 'User';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });
      
      const roleDistribution = {
        labels: Object.keys(roleCounts),
        data: Object.values(roleCounts)
      };
      
      // Manual aggregation for subscription status
      const statusCounts: Record<string, number> = {
        'Subscribed': 0,
        'Not Subscribed': 0
      };
      
      users?.forEach(user => {
        if (user.subscription_status === 'active') {
          statusCounts['Subscribed']++;
        } else {
          statusCounts['Not Subscribed']++;
        }
      });
      
      const subscriptionStatus = {
        labels: Object.keys(statusCounts),
        data: Object.values(statusCounts)
      };
      
      // User growth by creation month
      const monthlyGrowth: Record<string, number> = {};
      users?.forEach(user => {
        if (!user.created_at) return;
        
        const date = new Date(user.created_at);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        
        monthlyGrowth[monthYear] = (monthlyGrowth[monthYear] || 0) + 1;
      });
      
      // Sort months chronologically
      const sortedMonths = Object.keys(monthlyGrowth).sort((a, b) => {
        const [aMonth, aYear] = a.split('/').map(Number);
        const [bMonth, bYear] = b.split('/').map(Number);
        return aYear === bYear ? aMonth - bMonth : aYear - bYear;
      });
      
      // Calculate cumulative user count
      let cumulative = 0;
      const cumulativeData = sortedMonths.map(month => {
        cumulative += monthlyGrowth[month];
        return cumulative;
      });
      
      const userGrowth = {
        labels: sortedMonths,
        data: cumulativeData
      };
      
      setUserStats({
        roleDistribution,
        userGrowth,
        subscriptionStatus
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      throw error;
    }
  };
  
  const loadBusinessStats = async () => {
    try {
      // Get all businesses
      const { data: businesses, error: businessesError } = await supabase
        .from('businesses')
        .select('*');
      
      if (businessesError) throw businessesError;
      
      // Manual aggregation for category distribution
      const categoryCounts: Record<string, number> = {};
      businesses?.forEach(business => {
        const category = business.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      const categoryDistribution = {
        labels: Object.keys(categoryCounts),
        data: Object.values(categoryCounts)
      };
      
      // Count featured vs regular businesses
      const featuredCount = {
        featured: businesses?.filter(b => b.featured).length || 0,
        regular: businesses?.filter(b => !b.featured).length || 0
      };
      
      // Rating distribution
      const ratingRanges = ['0-1', '1-2', '2-3', '3-4', '4-5'];
      const ratingCounts = [0, 0, 0, 0, 0];
      
      businesses?.forEach(business => {
        const rating = parseFloat(business.rating as any) || 0;
        // Determine which bucket this rating falls into
        const bucketIndex = Math.min(Math.floor(rating), 4);
        ratingCounts[bucketIndex]++;
      });
      
      const ratingDistribution = {
        labels: ratingRanges,
        data: ratingCounts
      };
      
      setBusinessStats({
        categoryDistribution,
        featuredCount,
        ratingDistribution
      });
    } catch (error) {
      console.error('Error loading business stats:', error);
      throw error;
    }
  };
  
  // Helper function to generate colors
  const getColorForIndex = (index: number, alpha = 1) => {
    const colors = [
      `rgba(255, 99, 132, ${alpha})`,
      `rgba(54, 162, 235, ${alpha})`,
      `rgba(255, 206, 86, ${alpha})`,
      `rgba(75, 192, 192, ${alpha})`,
      `rgba(153, 102, 255, ${alpha})`,
      `rgba(255, 159, 64, ${alpha})`,
      `rgba(199, 199, 199, ${alpha})`,
      `rgba(83, 102, 255, ${alpha})`,
      `rgba(40, 159, 160, ${alpha})`,
      `rgba(210, 105, 30, ${alpha})`
    ];
    return colors[index % colors.length];
  };
  
  // Chart data transformations
  const getPackageDistributionData = (): ChartData<'pie'> => ({
    labels: packageStats.packageDistribution.labels,
    datasets: [{
      data: packageStats.packageDistribution.data,
      backgroundColor: packageStats.packageDistribution.labels.map((_: any, i: number) => getColorForIndex(i, 0.7))
    }]
  });
  
  const getSubscribersTrendData = (): ChartData<'line'> => ({
    labels: packageStats.subscribersTrend.labels,
    datasets: packageStats.subscribersTrend.datasets
  });
  
  const getCategoryDistributionData = (): ChartData<'bar'> => ({
    labels: packageStats.categoryDistribution.labels,
    datasets: [{
      label: 'Packages',
      data: packageStats.categoryDistribution.data,
      backgroundColor: packageStats.categoryDistribution.labels.map((_: any, i: number) => getColorForIndex(i, 0.7))
    }]
  });
  
  const getRoleDistributionData = (): ChartData<'pie'> => ({
    labels: userStats.roleDistribution.labels,
    datasets: [{
      data: userStats.roleDistribution.data,
      backgroundColor: userStats.roleDistribution.labels.map((_: any, i: number) => getColorForIndex(i, 0.7))
    }]
  });
  
  const getUserGrowthData = (): ChartData<'line'> => ({
    labels: userStats.userGrowth.labels,
    datasets: [{
      label: 'Cumulative Users',
      data: userStats.userGrowth.data,
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)'
    }]
  });
  
  const getSubscriptionStatusData = (): ChartData<'pie'> => ({
    labels: userStats.subscriptionStatus.labels,
    datasets: [{
      data: userStats.subscriptionStatus.data,
      backgroundColor: userStats.subscriptionStatus.labels.map((_: any, i: number) => getColorForIndex(i, 0.7))
    }]
  });
  
  const getBusinessCategoryDistributionData = (): ChartData<'bar'> => ({
    labels: businessStats.categoryDistribution.labels,
    datasets: [{
      label: 'Businesses',
      data: businessStats.categoryDistribution.data,
      backgroundColor: businessStats.categoryDistribution.labels.map((_: any, i: number) => getColorForIndex(i, 0.7))
    }]
  });
  
  const getFeaturedBusinessData = () => ({
    labels: ['Featured', 'Regular'],
    datasets: [{
      label: 'Businesses',
      data: [businessStats.featuredCount.featured, businessStats.featuredCount.regular],
      backgroundColor: ['rgba(255, 206, 86, 0.7)', 'rgba(199, 199, 199, 0.7)']
    }]
  });
  
  const getRatingDistributionData = (): ChartData<'bar'> => ({
    labels: businessStats.ratingDistribution.labels,
    datasets: [{
      label: 'Businesses',
      data: businessStats.ratingDistribution.data,
      backgroundColor: businessStats.ratingDistribution.labels.map((_: any, i: number) => getColorForIndex(i, 0.7))
    }]
  });
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Platform Statistics</CardTitle>
          <CardDescription>
            Analytical overview of users, packages, and businesses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="packages">Packages</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="businesses">Businesses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="packages" className="space-y-4">
              <h2 className="text-xl font-semibold">Subscription Packages</h2>
              {isLoading ? (
                <div className="flex justify-center">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Package Distribution</CardTitle>
                        <CardDescription>Distribution of subscription package types</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <PieChart data={getPackageDistributionData()} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Distribution of packages by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <BarChart data={getCategoryDistributionData()} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Subscribers Trend</CardTitle>
                      <CardDescription>Monthly trend of new subscribers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <LineChart data={getSubscribersTrendData()} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="users" className="space-y-4">
              <h2 className="text-xl font-semibold">Users</h2>
              {isLoading ? (
                <div className="flex justify-center">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Role Distribution</CardTitle>
                        <CardDescription>Distribution of users by role</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <PieChart data={getRoleDistributionData()} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Subscription Status</CardTitle>
                        <CardDescription>Distribution of users by subscription status</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <PieChart data={getSubscriptionStatusData()} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>User Growth</CardTitle>
                      <CardDescription>Monthly growth of users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <LineChart data={getUserGrowthData()} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="businesses" className="space-y-4">
              <h2 className="text-xl font-semibold">Businesses</h2>
              {isLoading ? (
                <div className="flex justify-center">Loading...</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Distribution of businesses by category</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <BarChart data={getBusinessCategoryDistributionData()} />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Featured vs Regular</CardTitle>
                        <CardDescription>Distribution of featured vs regular businesses</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <PieChart data={getFeaturedBusinessData()} />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Rating Distribution</CardTitle>
                      <CardDescription>Distribution of businesses by rating</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <BarChart data={getRatingDistributionData()} />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseStatistics;
