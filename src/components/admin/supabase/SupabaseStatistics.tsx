
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, LineChart } from '@/components/ui/charts';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Users, Package, Database, Star, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SupabaseStatistics = () => {
  const [timeRange, setTimeRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [usersStats, setUsersStats] = useState<any>({
    total: 0,
    roleDistribution: [],
    signupTrend: []
  });
  const [businessStats, setBusinessStats] = useState<any>({
    total: 0,
    categoryDistribution: [],
    ratingDistribution: [],
    featuredCount: 0
  });
  const [packagesStats, setPackagesStats] = useState<any>({
    total: 0,
    typeDistribution: [],
    subscriberCount: 0
  });
  
  const { toast } = useToast();
  
  // Load statistics on component mount
  useEffect(() => {
    fetchStatistics();
  }, [timeRange]);
  
  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUserStatistics(),
        fetchBusinessStatistics(),
        fetchPackageStatistics()
      ]);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast({
        title: "Statistics Error",
        description: "Failed to load statistics data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserStatistics = async () => {
    try {
      // Get total users
      const { count: totalUsers, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Get role distribution
      const { data: roleData, error: roleError } = await supabase
        .from('users')
        .select('role, count')
        .not('role', 'is', null)
        .group('role');
      
      if (roleError) throw roleError;
      
      // Format role distribution for chart
      const roleDistribution = roleData.map(item => ({
        name: item.role || 'Undefined',
        value: item.count
      }));
      
      // Generate signup trend (mock data for now)
      const signupTrend = [];
      const today = new Date();
      const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Random signup count (replace with actual data)
        const count = Math.floor(Math.random() * 5);
        
        signupTrend.push({
          date: date.toISOString().split('T')[0],
          count
        });
      }
      
      setUsersStats({
        total: totalUsers || 0,
        roleDistribution,
        signupTrend
      });
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      throw error;
    }
  };
  
  const fetchBusinessStatistics = async () => {
    try {
      // Get total businesses
      const { count: totalBusinesses, error: countError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Get category distribution
      const { data: categoryData, error: categoryError } = await supabase
        .from('businesses')
        .select('category, count')
        .not('category', 'is', null)
        .group('category');
      
      if (categoryError) throw categoryError;
      
      // Get rating distribution
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('rating');
      
      if (businessError) throw businessError;
      
      // Count businesses by rating range
      const ratingCounts = {
        '0-1': 0,
        '1-2': 0,
        '2-3': 0,
        '3-4': 0,
        '4-5': 0
      };
      
      businesses.forEach(business => {
        const rating = business.rating || 0;
        if (rating < 1) ratingCounts['0-1']++;
        else if (rating < 2) ratingCounts['1-2']++;
        else if (rating < 3) ratingCounts['2-3']++;
        else if (rating < 4) ratingCounts['3-4']++;
        else ratingCounts['4-5']++;
      });
      
      const ratingDistribution = Object.entries(ratingCounts).map(([range, count]) => ({
        name: range,
        value: count
      }));
      
      // Get featured count
      const { count: featuredCount, error: featuredError } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);
      
      if (featuredError) throw featuredError;
      
      // Format category distribution for chart
      const categoryDistribution = categoryData.map(item => ({
        name: item.category || 'Uncategorized',
        value: item.count
      }));
      
      setBusinessStats({
        total: totalBusinesses || 0,
        categoryDistribution,
        ratingDistribution,
        featuredCount: featuredCount || 0
      });
    } catch (error) {
      console.error("Error fetching business statistics:", error);
      throw error;
    }
  };
  
  const fetchPackageStatistics = async () => {
    try {
      // Get total packages
      const { count: totalPackages, error: countError } = await supabase
        .from('subscription_packages')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      // Get package type distribution
      const { data: typeData, error: typeError } = await supabase
        .from('subscription_packages')
        .select('type, count')
        .group('type');
      
      if (typeError) throw typeError;
      
      // Format type distribution for chart
      const typeDistribution = typeData.map(item => ({
        name: item.type || 'Unspecified',
        value: item.count
      }));
      
      // Get subscriber count (users with subscription)
      const { count: subscriberCount, error: subError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .not('subscription', 'is', null);
      
      if (subError) throw subError;
      
      setPackagesStats({
        total: totalPackages || 0,
        typeDistribution,
        subscriberCount: subscriberCount || 0
      });
    } catch (error) {
      console.error("Error fetching package statistics:", error);
      throw error;
    }
  };
  
  const handleRefresh = () => {
    fetchStatistics();
  };
  
  // Format data for line chart (signup trend)
  const signupTrendData = {
    labels: usersStats.signupTrend.map((item: any) => item.date),
    datasets: [
      {
        label: 'New Users',
        data: usersStats.signupTrend.map((item: any) => item.count),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
      }
    ]
  };
  
  // Format data for pie charts
  const userRolesData = {
    labels: usersStats.roleDistribution.map((item: any) => item.name),
    datasets: [
      {
        data: usersStats.roleDistribution.map((item: any) => item.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const businessCategoriesData = {
    labels: businessStats.categoryDistribution.map((item: any) => item.name),
    datasets: [
      {
        data: businessStats.categoryDistribution.map((item: any) => item.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)',
          'rgba(78, 252, 152, 0.7)',
          'rgba(252, 186, 3, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  const packageTypesData = {
    labels: packagesStats.typeDistribution.map((item: any) => item.name),
    datasets: [
      {
        data: packagesStats.typeDistribution.map((item: any) => item.value),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Format data for bar chart (ratings)
  const ratingsData = {
    labels: businessStats.ratingDistribution.map((item: any) => item.name),
    datasets: [
      {
        label: 'Businesses by Rating',
        data: businessStats.ratingDistribution.map((item: any) => item.value),
        backgroundColor: 'rgba(255, 206, 86, 0.7)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      }
    ]
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Statistics Dashboard</h2>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{usersStats.total}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Database className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{businessStats.total}</div>
              <div className="ml-2 text-xs text-muted-foreground">
                ({businessStats.featuredCount} featured)
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Packages & Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{packagesStats.total}</div>
              <div className="ml-2 text-xs text-muted-foreground">
                ({packagesStats.subscriberCount} subscribers)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="businesses" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Businesses
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Packages
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Signup Trend</CardTitle>
              <CardDescription>
                New user registrations over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <LineChart data={signupTrendData} />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>User Role Distribution</CardTitle>
              <CardDescription>
                Distribution of users by role
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PieChart data={userRolesData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="businesses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Categories</CardTitle>
              <CardDescription>
                Distribution of businesses by category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PieChart data={businessCategoriesData} />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Business Ratings</CardTitle>
              <CardDescription>
                Distribution of businesses by rating range
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <BarChart data={ratingsData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Package Types</CardTitle>
              <CardDescription>
                Distribution of packages by type
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <PieChart data={packageTypesData} />
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Package Distribution</CardTitle>
                <CardDescription>Most popular subscription packages</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for package distribution chart */}
                <div className="text-center py-10 text-muted-foreground">
                  Coming soon: Package popularity chart
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscription Metrics</CardTitle>
                <CardDescription>Subscription performance and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for subscription metrics */}
                <div className="text-center py-10 text-muted-foreground">
                  Coming soon: Subscription metrics
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupabaseStatistics;
