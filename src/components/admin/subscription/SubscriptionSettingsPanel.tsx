
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface SubscriptionSettingsPanelProps {
  onConfigureRazorpay: () => void;
}

const SubscriptionSettingsPanel: React.FC<SubscriptionSettingsPanelProps> = ({ onConfigureRazorpay }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Payment Gateway</h3>
          <Button 
            variant="outline" 
            onClick={onConfigureRazorpay}
            className="w-full sm:w-auto"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure Razorpay
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettingsPanel;
