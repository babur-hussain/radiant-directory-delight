
import React from "react";
import { Info } from "lucide-react";

type DebugInfoProps = {
  info: string | null;
};

const DebugInfo: React.FC<DebugInfoProps> = ({ info }) => {
  if (!info) return null;
  
  return (
    <div className="text-xs text-muted-foreground mb-2 flex items-center">
      <Info className="h-3 w-3 mr-1" />
      <span>{info}</span>
    </div>
  );
};

export default DebugInfo;
