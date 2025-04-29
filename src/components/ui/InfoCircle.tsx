
import { Info } from "lucide-react";
import React from "react";

interface InfoCircleProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const InfoCircle: React.FC<InfoCircleProps> = ({ className, ...props }) => {
  return <Info className={className} {...props} />;
};

export default InfoCircle;
