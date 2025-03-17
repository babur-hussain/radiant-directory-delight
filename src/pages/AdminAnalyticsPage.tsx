
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Building, Calendar } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { connectToMongoDB } from '@/config/mongodb';
import { useToast } from '@/hooks/use-toast';

const AdminAnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7');
  const [stats, setStats] = useState({
    totalUsers: { value: 2542, growth: 12.5 },
    businesses: { value: 1375, growth: 7.2 },
    subscriptions: { value: 428, growth: 18.3 },
    revenue: { value: 32845, growth: 14.5 }
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalyticsData(timeRange);
  }, [timeRange]);

  const fetchAnalyticsData = async (days: string) => {
    setIsLoading(true);
    
    try {
      // Try to connect to MongoDB
      const connected = await connectToMongoDB();
      
      if (!connected) {
        console.warn("MongoDB connection failed, using mock analytics data");
        // Calculate mock data based on time range
        const multiplier = parseFloat(days) / 7;
        
        // Simulate variation based on time range
        const mockStats = {
          totalUsers: { 
            value: Math.round(2500 + (Math.random() * 100 * multiplier)),
            growth: 10 + (Math.random() * 5 * multiplier) 
          },
          businesses: { 
            value: Math.round(1300 + (Math.random() * 150 * multiplier)), 
            growth: 5 + (Math.random() * 4 * multiplier)
          },
          subscriptions: { 
            value: Math.round(400 + (Math.random() * 50 * multiplier)),
            growth: 15 + (Math.random() * 5 * multiplier)
          },
          revenue: { 
            value: Math.round(30000 + (Math.random() * 5000 * multiplier)),
            growth: 12 + (Math.random() * 6 * multiplier)
          }
        };
        
        setStats(mockStats);
        return;
      }
      
      // In a real application, you would fetch actual analytics from MongoDB here
      console.log(`Fetching analytics data for last ${days} days`);
      
      // Simulating MongoDB data retrieval
      // Replace this with actual MongoDB queries in production
      
      // For demo purposes, generate realistic looking data
      const daysNum = parseInt(days);
      
      // More realistic data generation based on selected time range
      const baseMultiplier = daysNum / 7;
      const randomFactor = 0.1 + (Math.random() * 0.2); // 10-30% random variation
      
      const newStats = {
        totalUsers: { 
          value: Math.round(2500 + (42 * daysNum * randomFactor)), 
          growth: +(10 + (daysNum * 0.5 * randomFactor)).toFixed(1)
        },
        businesses: { 
          value: Math.round(1300 + (25 * daysNum * randomFactor)), 
          growth: +(7 + (daysNum * 0.3 * randomFactor)).toFixed(1)
        },
        subscriptions: { 
          value: Math.round(400 + (8 * daysNum * randomFactor)),
          growth: +(18 + (daysNum * 0.6 * randomFactor)).toFixed(1)
        },
        revenue: { 
          value: Math.round(30000 + (500 * daysNum * randomFactor)),
          growth: +(14 + (daysNum * 0.4 * randomFactor)).toFixed(1)
        }
      };
      
      setStats(newStats);
      
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Analytics Error",
        description: "Failed to fetch analytics data. Showing sample data instead.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.totalUsers.value.toLocaleString()}</h3>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">+{stats.totalUsers.growth}%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last {timeRange === '365' ? 'year' : `${timeRange} days`}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Businesses</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.businesses.value.toLocaleString()}</h3>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">+{stats.businesses.growth}%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last {timeRange === '365' ? 'year' : `${timeRange} days`}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.subscriptions.value.toLocaleString()}</h3>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">+{stats.subscriptions.growth}%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last {timeRange === '365' ? 'year' : `${timeRange} days`}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Revenue</p>
                  <h3 className="text-2xl font-bold mt-1">${stats.revenue.value.toLocaleString()}</h3>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">+{stats.revenue.growth}%</span>
                <span className="text-sm text-gray-500 ml-2">
                  from last {timeRange === '365' ? 'year' : `${timeRange} days`}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
            <CardDescription>
              User and business growth over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Analytics charts will be displayed here</p>
              <p className="text-sm mt-2">
                Data shown for last {timeRange === '365' ? 'year' : `${timeRange} days`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
