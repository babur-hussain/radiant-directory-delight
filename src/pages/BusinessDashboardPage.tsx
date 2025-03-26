import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CircleDollarSign, Store } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { useSubscription } from '@/hooks/useSubscription';
import { normalizeRole } from '@/types/auth';

const BusinessDashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription(user?.uid);

  // Check if the user has business role or is admin
  const hasAccess = normalizeRole(user?.role) === 'business' || normalizeRole(user?.role) === 'admin';

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Unauthorized Access</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = [
    { name: 'Active Listings', value: 400 },
    { name: 'Inactive Listings', value: 300 },
    { name: 'Pending Approval', value: 300 },
    { name: 'Drafts', value: 200 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Business Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CircleDollarSign className="h-4 w-4" />
              <span>Subscription Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscriptionLoading ? (
              <Skeleton height={20} width={150} />
            ) : subscription ? (
              <>
                <p className="text-sm">
                  Status: {subscription.status}
                </p>
                <p className="text-sm">
                  Package: {subscription.packageName}
                </p>
                <p className="text-sm">
                  Expires: {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-sm">No active subscription</p>
            )}
            <Button variant="outline" asChild className="mt-4">
              <Link to="/subscription">Manage Subscription</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Store className="h-4 w-4" />
              <span>Listing Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-2">
            <Button asChild variant="secondary">
              <Link to="/admin/business-listings">Manage Listings</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/admin/business-categories">Manage Categories</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/admin/settings">Update Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessDashboardPage;
