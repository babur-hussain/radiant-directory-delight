
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { RefreshCw, Save } from "lucide-react";

interface UserSectionsListProps {
  selectedUser: any;
  userSections: string[];
  availableSections: string[];
  isLoading: boolean;
  toggleUserSection: (section: string) => void;
  saveUserSections: () => void;
  refreshData: () => void;
}

const UserSectionsList: React.FC<UserSectionsListProps> = ({
  selectedUser,
  userSections,
  availableSections,
  isLoading,
  toggleUserSection,
  saveUserSections,
  refreshData,
}) => {
  if (!selectedUser) {
    return (
      <div className="text-center p-6">
        <p>Please select a user to manage their dashboard sections</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">
            Dashboard sections for {selectedUser.name || selectedUser.email}
          </h3>
          <p className="text-sm text-muted-foreground">
            Role: {selectedUser.role || "Not specified"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      <Separator className="my-4" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableSections.map((section) => (
          <div key={section} className="flex items-center justify-between space-x-2 p-2 border rounded">
            <Label htmlFor={`user-${section}`} className="flex-1 cursor-pointer">
              {section.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Label>
            <Switch
              id={`user-${section}`}
              checked={userSections.includes(section)}
              onCheckedChange={() => toggleUserSection(section)}
            />
          </div>
        ))}
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={saveUserSections}>
          <Save className="h-4 w-4 mr-2" />
          Save User Settings
        </Button>
      </div>
    </>
  );
};

export default UserSectionsList;
