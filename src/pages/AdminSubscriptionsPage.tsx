
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Package, RefreshCw, PlusCircle } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

const AdminSubscriptionsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Subscription
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscription Packages</CardTitle>
            <CardDescription>
              View and manage subscription packages and pricing plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-end mb-4">
              <Button variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Basic</TableCell>
                  <TableCell>$9.99/month</TableCell>
                  <TableCell>Monthly</TableCell>
                  <TableCell>3 core features</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Premium</TableCell>
                  <TableCell>$29.99/month</TableCell>
                  <TableCell>Monthly</TableCell>
                  <TableCell>All features</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptionsPage;
