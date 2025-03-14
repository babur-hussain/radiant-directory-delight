import React from "react";
import { Button } from "@/components/ui/button";
import { Store, Users } from "lucide-react";
import { UserRole } from "@/types/auth";

interface RegisterTypeSelectorProps {
  onSelectType: (type: UserRole) => void;
}

const RegisterTypeSelector: React.FC<RegisterTypeSelectorProps> = ({ onSelectType }) => {
  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground mb-4">
        Choose how you want to register
      </p>
      <Button 
        onClick={() => onSelectType("Business")} 
        variant="outline" 
        className="w-full mb-2 py-6"
      >
        <Store className="mr-2 h-5 w-5" />
        Register as Business
      </Button>
      <Button 
        onClick={() => onSelectType("Influencer")} 
        variant="outline" 
        className="w-full py-6"
      >
        <Users className="mr-2 h-5 w-5" />
        Register as Influencer
      </Button>
    </div>
  );
};

export default RegisterTypeSelector;
