
import React from 'react';
import SubscriptionPackageManagement from '../../components/admin/subscription/SubscriptionManagement';

// Add the missing function for handling permission errors
const Dashboard = () => {
  const handlePermissionError = (error: any) => {
    console.error("Permission error:", error);
    // Handle the permission error appropriately
  };

  return (
    <div>
      <SubscriptionPackageManagement 
        onPermissionError={handlePermissionError} 
        dbInitialized={true} 
        connectionStatus="connected" 
      />
    </div>
  );
};

export default Dashboard;
