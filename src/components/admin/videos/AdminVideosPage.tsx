
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminVideosList } from './AdminVideosList';
import { AdminVideoSubmissions } from './AdminVideoSubmissions';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import AdminVideoForm from './AdminVideoForm';

const AdminVideosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Video Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage videos and review submissions for the video reels section
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Video
        </Button>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="videos">Published Videos</TabsTrigger>
          <TabsTrigger value="submissions">User Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos">
          <AdminVideosList />
        </TabsContent>
        
        <TabsContent value="submissions">
          <AdminVideoSubmissions />
        </TabsContent>
      </Tabs>
      
      <AdminVideoForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
      />
    </AdminLayout>
  );
};

export default AdminVideosPage;
