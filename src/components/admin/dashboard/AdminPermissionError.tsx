
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminPermissionErrorProps {
  permissionError: string | null;
  dismissError: () => void;
}

const AdminPermissionError = ({ permissionError, dismissError }: AdminPermissionErrorProps) => {
  if (!permissionError) return null;
  
  return (
    <Alert variant="destructive" className="mb-6">
      <ShieldAlert className="h-5 w-5" />
      <AlertTitle>Permission Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{permissionError}</p>
        <p className="text-sm">
          This usually happens when your Firebase security rules do not allow the operation.
          Please check your Firebase rules or contact your administrator.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={dismissError} 
          className="self-end mt-2"
        >
          Dismiss
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default AdminPermissionError;
