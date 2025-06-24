import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminSubscriptionsPage = () => {
  const [phonePeSettings, setPhonePeSettings] = useState({
    merchantId: '',
    saltKey: '',
    saltIndex: '1',
    environment: 'PRODUCTION'
  });

  const handleSavePhonePeSettings = () => {
    toast.success('PhonePe settings saved successfully');
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Subscription Management</h1>
          <p className="text-gray-600">Manage subscription packages, payments, and user subscriptions</p>
        </div>

        <Tabs defaultValue="subscriptions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="subscriptions" className="space-y-6">
            <SubscriptionManagement />
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Packages</CardTitle>
                <CardDescription>Manage available subscription packages</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Package management functionality will be implemented here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
