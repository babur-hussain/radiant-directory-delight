
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Server } from 'lucide-react';
import MigrationUtility from './MigrationUtility';

const DatabaseMigrationPanel = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">Firestore to Supabase Migration</CardTitle>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <span className="text-muted-foreground">↔</span>
            <Server className="h-5 w-5 text-primary" />
          </div>
        </div>
        <CardDescription>
          Migrate your Firestore data to Supabase for improved performance and scalability.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="migrate" className="space-y-4">
          <TabsList>
            <TabsTrigger value="migrate">Migration Tool</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
          </TabsList>
          
          <TabsContent value="migrate" className="space-y-4">
            <MigrationUtility />
          </TabsContent>
          
          <TabsContent value="info" className="space-y-4">
            <div className="prose max-w-none">
              <h3>Firestore to Supabase Migration</h3>
              <p>
                This tool helps you migrate your data from Firebase Firestore to Supabase. The migration process preserves all your existing data structure and relationships.
              </p>
              
              <h4>Why Migrate?</h4>
              <ul>
                <li><strong>Improved Performance:</strong> Supabase offers better performance for complex queries and large datasets.</li>
                <li><strong>Cost Optimization:</strong> Supabase pricing model can be more cost-effective for growing applications.</li>
                <li><strong>Advanced Features:</strong> Supabase provides advanced features like real-time subscriptions, Row Level Security, and more flexible querying.</li>
              </ul>
              
              <h4>Migration Process</h4>
              <ol>
                <li>All users will be migrated with their roles and permissions.</li>
                <li>All subscription packages will be migrated with their complete details.</li>
                <li>All active and historical subscriptions will be preserved.</li>
                <li>All business listings will be migrated with their details.</li>
              </ol>
              
              <h4>Post-Migration</h4>
              <p>
                After migration, the application will continue using Supabase for authentication and all data operations.
              </p>
              
              <div className="bg-muted p-4 rounded-md text-sm mt-4">
                <strong>Note:</strong> It's recommended to perform this migration during low-traffic periods. The process is non-destructive to your Firestore data, but it's always good practice to backup your data before migration.
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DatabaseMigrationPanel;
