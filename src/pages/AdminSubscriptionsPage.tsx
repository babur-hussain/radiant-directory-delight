
import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';
import SubscriptionSettingsPanel from '@/components/admin/subscription/SubscriptionSettingsPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminSubscriptionsPage = () => {
  const [paytmSettings, setPaytmSettings] = useState({
    merchantId: '',
    merchantKey: '',
    environment: 'TEST'
  });

  const handleConfigurePaytm = () => {
    toast.info('Opening Paytm configuration...');
    // You can add a modal or redirect to configuration page here
  };

  const handleSavePaytmSettings = () => {
    toast.success('Paytm settings saved successfully');
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
            <SubscriptionSettingsPanel onConfigurePaytm={handleConfigurePaytm} />
            
            <Card>
              <CardHeader>
                <CardTitle>Paytm Configuration</CardTitle>
                <CardDescription>Configure Paytm payment gateway settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="merchantId">Merchant ID</Label>
                    <Input
                      id="merchantId"
                      value={paytmSettings.merchantId}
                      onChange={(e) => setPaytmSettings({...paytmSettings, merchantId: e.target.value})}
                      placeholder="Enter Paytm Merchant ID"
                    />
                  </div>
                  <div>
                    <Label htmlFor="merchantKey">Merchant Key</Label>
                    <Input
                      id="merchantKey"
                      type="password"
                      value={paytmSettings.merchantKey}
                      onChange={(e) => setPaytmSettings({...paytmSettings, merchantKey: e.target.value})}
                      placeholder="Enter Paytm Merchant Key"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <select
                    id="environment"
                    value={paytmSettings.environment}
                    onChange={(e) => setPaytmSettings({...paytmSettings, environment: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="TEST">Test</option>
                    <option value="PROD">Production</option>
                  </select>
                </div>
                <Button onClick={handleSavePaytmSettings}>
                  Save Paytm Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
