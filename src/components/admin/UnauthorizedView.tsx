
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const UnauthorizedView: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  
  // Check for default admin email
  const isDefaultAdmin = (email: string | null) => {
    return email === "baburhussain660@gmail.com";
  };

  const handleLoginAsDefaultAdmin = async () => {
    try {
      // If already logged in with correct email but not admin,
      // redirect to admin dashboard anyway (should be fixed there)
      if (isAuthenticated && isDefaultAdmin(user?.email)) {
        navigate("/admin/dashboard");
        return;
      }
      
      // If email is default admin but not logged in, show login prompt
      navigate("/admin");
    } catch (error) {
      console.error("Error handling default admin login:", error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Panel - Access Restricted</CardTitle>
          <CardDescription>
            {isAuthenticated 
              ? "You don't have admin privileges to access this dashboard"
              : "Please sign in to access the admin dashboard"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isAuthenticated ? (
            <>
              <p className="mb-4">
                You are logged in as <strong>{user?.email}</strong> with role <strong>{user?.role || "not set"}</strong>,
                {isDefaultAdmin(user?.email) ? (
                  <span className="text-green-600 font-medium"> (Default Admin)</span>
                ) : (
                  <span> but you need admin privileges to access this page.</span>
                )}
              </p>
              
              {isDefaultAdmin(user?.email) && (
                <Alert variant="default" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are using the default admin email. Click the button below to access the admin dashboard.
                  </AlertDescription>
                </Alert>
              )}
              
              {isDefaultAdmin(user?.email) ? (
                <Button onClick={handleLoginAsDefaultAdmin} className="mr-2">
                  Access Admin Dashboard
                </Button>
              ) : (
                <Button onClick={() => navigate("/admin")} className="mr-2">
                  Go to Admin Login
                </Button>
              )}
              
              <Button onClick={() => navigate("/")} variant="outline">
                Return to Homepage
              </Button>
            </>
          ) : (
            <>
              <p className="mb-4">You need to be logged in as an admin to access this page.</p>
              <Button onClick={() => navigate("/admin")} className="mr-2">
                Log In
              </Button>
              <Button onClick={() => navigate("/")} variant="outline">
                Return to Homepage
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthorizedView;
