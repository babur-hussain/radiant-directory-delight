
import React, { useState } from 'react';
import { User, normalizeRole } from '@/types/auth';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

interface UserPermissionsTabProps {
  user: User;
  onRoleSaved?: (success: boolean, message: string) => void;
}

const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({ user, onRoleSaved }) => {
  const [selectedRole, setSelectedRole] = useState(user.role || 'user');
  const [isAdmin, setIsAdmin] = useState(user.isAdmin || false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { updateUserRole, updateUserPermission } = useAdmin();
  
  const handleRoleChange = (value: string) => {
    setSelectedRole(normalizeRole(value));
  };
  
  const handleAdminChange = (checked: boolean) => {
    setIsAdmin(checked);
  };
  
  const handleSavePermissions = async () => {
    try {
      setIsSaving(true);
      
      // Update role
      if (user.role !== selectedRole) {
        const updatedUser = await updateUserRole(user.id, normalizeRole(selectedRole));
        if (updatedUser) {
          toast({
            title: "Role Updated",
            description: `User's role has been updated to ${selectedRole}`,
          });
        }
      }
      
      // Update admin permission
      if (user.isAdmin !== isAdmin) {
        const updatedPermission = await updateUserPermission(user.id, isAdmin);
        if (updatedPermission) {
          toast({
            title: "Admin Permission Updated",
            description: isAdmin 
              ? "User now has admin permissions" 
              : "Admin permissions have been removed",
          });
        }
      }
      
      if (onRoleSaved) {
        onRoleSaved(true, "Permissions updated successfully");
      }
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive",
      });
      
      if (onRoleSaved) {
        onRoleSaved(false, "Failed to update permissions");
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">User Role</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select the appropriate role for this user.
        </p>
        
        <RadioGroup 
          defaultValue={selectedRole}
          value={selectedRole}
          onValueChange={handleRoleChange}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted">
            <RadioGroupItem value="user" id="user" />
            <Label htmlFor="user" className="cursor-pointer flex-1">User</Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted">
            <RadioGroupItem value="business" id="business" />
            <Label htmlFor="business" className="cursor-pointer flex-1">Business</Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted">
            <RadioGroupItem value="influencer" id="influencer" />
            <Label htmlFor="influencer" className="cursor-pointer flex-1">Influencer</Label>
          </div>
          
          <div className="flex items-center space-x-2 border p-4 rounded-md hover:bg-muted">
            <RadioGroupItem value="admin" id="admin" />
            <Label htmlFor="admin" className="cursor-pointer flex-1">Admin</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium">Admin Permissions</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enable or disable administrative privileges for this user.
        </p>
        
        <div className="flex items-center justify-between border p-4 rounded-md">
          <div className="flex items-center gap-3">
            {isAdmin ? 
              <ShieldCheck className="h-6 w-6 text-primary" /> : 
              <ShieldAlert className="h-6 w-6 text-muted-foreground" />
            }
            <div>
              <Label className="font-medium">Admin Access</Label>
              <p className="text-sm text-muted-foreground">
                Can access administration functions
              </p>
            </div>
          </div>
          
          <Switch 
            checked={isAdmin}
            onCheckedChange={handleAdminChange}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={isSaving}
        >
          Cancel
        </Button>
        
        <Button
          onClick={handleSavePermissions}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Permissions"}
        </Button>
      </div>
    </div>
  );
};

export default UserPermissionsTab;
