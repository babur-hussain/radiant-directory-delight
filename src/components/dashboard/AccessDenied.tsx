
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface AccessDeniedProps {
  message: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ message }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Access Denied</CardTitle>
          </div>
          <CardDescription>You don't have permission to view this page</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{message}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate("/")}>
            Go to Homepage
          </Button>
          <Button onClick={() => navigate("/login")}>
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AccessDenied;
