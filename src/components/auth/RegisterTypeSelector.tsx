
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/types/auth";
import { Building2, User, Users } from "lucide-react";

export interface RegisterTypeSelectorProps {
  onSelectType: (type: UserRole) => void;
  selectedType: UserRole; // Added missing prop
}

const RegisterTypeSelector: React.FC<RegisterTypeSelectorProps> = ({ 
  onSelectType,
  selectedType
}) => {
  // Create registration type cards with icons and descriptions
  const registrationTypes = [
    {
      id: "User",
      title: "Regular User",
      description: "Create an account to explore and interact with the platform.",
      icon: <User className="h-8 w-8 mb-2 text-blue-500" />,
    },
    {
      id: "Business",
      title: "Business Owner",
      description: "Register your business to connect with influencers and customers.",
      icon: <Building2 className="h-8 w-8 mb-2 text-emerald-500" />,
    },
    {
      id: "Influencer",
      title: "Influencer",
      description: "Join as an influencer to showcase your reach and partner with businesses.",
      icon: <Users className="h-8 w-8 mb-2 text-purple-500" />,
    },
  ];

  return (
    <div className="space-y-4 py-2">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium">Choose Your Account Type</h3>
        <p className="text-sm text-muted-foreground">
          Select the type of account you want to create
        </p>
      </div>

      <div className="grid gap-4">
        {registrationTypes.map((type) => (
          <Card 
            key={type.id} 
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedType === type.id ? 'border-2 border-primary bg-primary/5' : ''
            }`}
            onClick={() => onSelectType(type.id as UserRole)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-center">{type.icon}</div>
              <CardTitle className="text-center">{type.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                {type.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="pt-0 justify-center">
              <Button 
                variant={selectedType === type.id ? "default" : "outline"}
                className="w-full"
                onClick={() => onSelectType(type.id as UserRole)}
              >
                {selectedType === type.id ? "Selected" : "Select"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RegisterTypeSelector;
