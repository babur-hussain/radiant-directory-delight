
import React from "react";

type StatusBadgeProps = {
  status: string;
  packageName?: string;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, packageName }) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-800 bg-green-100";
      case "cancelled":
        return "text-red-800 bg-red-100";
      case "expired":
        return "text-orange-800 bg-orange-100";
      default:
        return "text-gray-800 bg-gray-100";
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full ${getStatusBadgeClass(status)}`}>
      {packageName ? `${packageName} (${status})` : status}
    </span>
  );
};

export default StatusBadge;
