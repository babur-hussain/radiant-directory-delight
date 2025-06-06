
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Pause } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  packageName: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, packageName }) => {
  if (!status) return null;

  const badgeConfig = {
    active: {
      variant: "default" as const,
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      text: "Active"
    },
    paused: {
      variant: "outline" as const,
      icon: <Pause className="h-3 w-3 mr-1" />,
      text: "Paused"
    },
    pending: {
      variant: "secondary" as const,
      icon: <Clock className="h-3 w-3 mr-1" />,
      text: "Pending"
    },
    cancelled: {
      variant: "destructive" as const,
      icon: <XCircle className="h-3 w-3 mr-1" />,
      text: "Cancelled"
    },
    expired: {
      variant: "destructive" as const,
      icon: <XCircle className="h-3 w-3 mr-1" />,
      text: "Expired"
    }
  };

  const config = badgeConfig[status as keyof typeof badgeConfig] || badgeConfig.pending;

  return (
    <div className="flex flex-col space-y-1">
      <Badge variant={config.variant} className="w-fit flex items-center text-xs">
        {config.icon}
        <span>
          {config.text}
        </span>
      </Badge>
      <span className="text-xs text-muted-foreground">
        {packageName || "Unknown package"}
      </span>
    </div>
  );
};

export default StatusBadge;
