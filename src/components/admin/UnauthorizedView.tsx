
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const UnauthorizedView: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel - Business Listings</CardTitle>
          <CardDescription>
            Please sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>You need to be logged in as an admin to access this page.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedView;
