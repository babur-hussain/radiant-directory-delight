import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ListChecks, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboardTabs from '@/components/admin/dashboard/AdminDashboardTabs';

const AdminDashboardSectionsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 w-full max-w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard Sections</h1>
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
        
        <AdminDashboardTabs />
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardSectionsPage;
