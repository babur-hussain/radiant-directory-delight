
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ShieldAlert } from "lucide-react";

type AdminWarningProps = {
  showWarning: boolean;
};

const AdminWarning: React.FC<AdminWarningProps> = ({ showWarning }) => {
  if (!showWarning) return null;
  
  return (
    <Alert variant="warning" className="mt-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Admin Permission Required</AlertTitle>
      <AlertDescription>
        <div className="flex items-center">
          <ShieldAlert className="h-4 w-4 mr-1" />
          <span>You need admin privileges to manage subscriptions.</span>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default AdminWarning;
