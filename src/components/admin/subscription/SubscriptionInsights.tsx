
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Dummy data for charts
const revenueData = [
  { month: 'Jan', value: 12500 },
  { month: 'Feb', value: 15000 },
  { month: 'Mar', value: 18000 },
  { month: 'Apr', value: 16000 },
  { month: 'May', value: 21000 },
  { month: 'Jun', value: 19000 },
];

const packageData = [
  { name: 'Basic', count: 35 },
  { name: 'Pro', count: 25 },
  { name: 'Enterprise', count: 15 },
  { name: 'Custom', count: 5 },
];

interface SubscriptionInsightsProps {
  className?: string;
}

const SubscriptionInsights: React.FC<SubscriptionInsightsProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Subscription Insights</CardTitle>
        <CardDescription>
          Analyze subscription trends and distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Demo Data</AlertTitle>
          <AlertDescription>
            This section shows sample data for demonstration purposes.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="revenue">
          <TabsList className="mb-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={revenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${value}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#0ea5e9" 
                    activeDot={{ r: 8 }} 
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">₹102,500</div>
                  <p className="text-muted-foreground text-sm">Total Revenue</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">80</div>
                  <p className="text-muted-foreground text-sm">Active Subscriptions</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">₹17,083</div>
                  <p className="text-muted-foreground text-sm">Monthly Average</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">₹1,281</div>
                  <p className="text-muted-foreground text-sm">Average Per Sub</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="packages">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={packageData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="count" 
                    name="Subscribers" 
                    fill="#0ea5e9" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">4</div>
                  <p className="text-muted-foreground text-sm">Active Packages</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">20</div>
                  <p className="text-muted-foreground text-sm">Subscriptions/Package</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">Basic</div>
                  <p className="text-muted-foreground text-sm">Most Popular</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">Custom</div>
                  <p className="text-muted-foreground text-sm">Least Popular</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SubscriptionInsights;
