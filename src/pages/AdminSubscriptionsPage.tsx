
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

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>PhonePe Configuration</CardTitle>
                <CardDescription>Configure PhonePe payment gateway settings for production</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="merchantId">Merchant ID</Label>
                    <Input
                      id="merchantId"
                      value={phonePeSettings.merchantId}
                      onChange={(e) => setPhonePeSettings({...phonePeSettings, merchantId: e.target.value})}
                      placeholder="Enter PhonePe Merchant ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="saltKey">Salt Key</Label>
                    <Input
                      id="saltKey"
                      type="password"
                      value={phonePeSettings.saltKey}
                      onChange={(e) => setPhonePeSettings({...phonePeSettings, saltKey: e.target.value})}
                      placeholder="Enter PhonePe Salt Key"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="saltIndex">Salt Index</Label>
                    <Input
                      id="saltIndex"
                      value={phonePeSettings.saltIndex}
                      onChange={(e) => setPhonePeSettings({...phonePeSettings, saltIndex: e.target.value})}
                      placeholder="Enter PhonePe Salt Index"
                    />
                  </div>
                  <div>
                    <Label htmlFor="environment">Environment</Label>
                    <select
                      id="environment"
                      value={phonePeSettings.environment}
                      onChange={(e) => setPhonePeSettings({...phonePeSettings, environment: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="UAT">UAT (Testing)</option>
                      <option value="PRODUCTION">Production</option>
                    </select>
                  </div>
                </div>
                <Button onClick={handleSavePhonePeSettings}>
                  Save PhonePe Settings
                </Button>
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <p className="text-blue-700 text-sm">
                    <strong>Note:</strong> These settings need to be configured in the Supabase Edge Function secrets for production use.
                    Required secrets: PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
