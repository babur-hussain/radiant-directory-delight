
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from "@/types/auth";
import { Building2, User, Users, UserCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RegisterTypeSelectorProps {
  onSelectType: (type: UserRole) => void;
  selectedType: UserRole;
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
      icon: <User className="h-10 w-10 mb-3 text-blue-500" />,
      color: "bg-blue-500/10 border-blue-200 hover:border-blue-500",
      activeColor: "border-blue-500 bg-blue-500/10",
      iconBg: "bg-blue-100",
      buttonColor: "bg-blue-500 hover:bg-blue-600"
    },
    {
      id: "Business",
      title: "Business Owner",
      description: "Register your business to connect with influencers and customers.",
      icon: <Building2 className="h-10 w-10 mb-3 text-emerald-500" />,
      color: "bg-emerald-500/10 border-emerald-200 hover:border-emerald-500",
      activeColor: "border-emerald-500 bg-emerald-500/10",
      iconBg: "bg-emerald-100",
      buttonColor: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
      id: "Influencer",
      title: "Influencer",
      description: "Join as an influencer to showcase your reach and partner with businesses.",
      icon: <Users className="h-10 w-10 mb-3 text-purple-500" />,
      color: "bg-purple-500/10 border-purple-200 hover:border-purple-500",
      activeColor: "border-purple-500 bg-purple-500/10",
      iconBg: "bg-purple-100",
      buttonColor: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  return (
    <div className="space-y-6 py-4">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold">Choose Your Account Type</h3>
        <p className="text-muted-foreground mt-2">
          Select the type of account that best describes you
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {registrationTypes.map((type) => (
          <Card 
            key={type.id} 
            className={cn(
              "cursor-pointer transition-all border-2",
              selectedType === type.id ? type.activeColor : type.color
            )}
            onClick={() => onSelectType(type.id as UserRole)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-center">
                <div className={cn("p-3 rounded-full", type.iconBg)}>
                  {type.icon}
                </div>
              </div>
              <CardTitle className="text-center mt-2">{type.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-sm">
                {type.description}
              </CardDescription>
            </CardContent>
            <CardFooter className="pt-0 justify-center pb-4">
              <Button 
                variant={selectedType === type.id ? "default" : "outline"}
                className={cn("w-full", selectedType === type.id && type.buttonColor)}
                onClick={() => onSelectType(type.id as UserRole)}
              >
                {selectedType === type.id && <CheckCircle2 className="mr-2 h-4 w-4" />}
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
