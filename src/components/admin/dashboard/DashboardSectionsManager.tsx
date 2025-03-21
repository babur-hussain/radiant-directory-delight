
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { useDashboardSections } from '@/hooks/useDashboardSections';
import { supabase } from '@/integrations/supabase/client';
import Loading from '@/components/ui/loading';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import AdminPermissionError from './AdminPermissionError';
import { IUser } from '@/models/User';

interface DashboardSectionsManagerProps {
  userId?: string;
  isAdmin?: boolean;
  selectedUser?: IUser | null;
}

const DashboardSectionsManager: React.FC<DashboardSectionsManagerProps> = ({ 
  userId, 
  isAdmin = false,
  selectedUser = null
}) => {
  const effectiveUserId = selectedUser?.uid || userId;
  const { subscription, loading: isSubscriptionLoading, error: subscriptionError } = useSubscription(effectiveUserId);
  const { dashboardSections, isLoading: isSectionsLoading, error: sectionsError } = useDashboardSections();
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [userSections, setUserSections] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    if (subscription?.packageId) {
      fetchSubscriptionPackage(subscription.packageId);
    }
  }, [subscription?.packageId]);

  useEffect(() => {
    if (dashboardSections && dashboardSections.length > 0) {
      setUserSections(dashboardSections);
    }
  }, [dashboardSections]);

  const fetchSubscriptionPackage = async (packageId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('dashboard_sections')
        .eq('id', packageId)
        .single();

      if (error) {
        console.error("Error fetching subscription package:", error);
        setError("Failed to load subscription package details.");
        return;
      }

      if (data && data.dashboard_sections) {
        setAvailableSections(data.dashboard_sections);
      } else {
        setAvailableSections([]);
      }
    } catch (err) {
      console.error("Unexpected error fetching subscription package:", err);
      setError("Failed to load subscription package details.");
    }
  };

  const handleSectionToggle = (section: string) => {
    if (userSections) {
      const newSections = userSections.includes(section)
        ? userSections.filter(s => s !== section)
        : [...userSections, section];
      setUserSections(newSections);
    }
  };

  const saveDashboardSections = async () => {
    if (!effectiveUserId) return;
    
    setIsSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('users')
        .update({ custom_dashboard_sections: userSections })
        .eq('id', effectiveUserId);

      if (error) {
        console.error("Error updating dashboard sections:", error);
        setError("Failed to update dashboard sections.");
        toast({
          title: "Error",
          description: "Failed to update dashboard sections.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Dashboard sections updated successfully.",
      });
    } catch (err) {
      console.error("Unexpected error updating dashboard sections:", err);
      setError("Failed to update dashboard sections.");
      toast({
        title: "Error",
        description: "Failed to update dashboard sections.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const dismissError = () => {
    setPermissionError(null);
  };

  if (!isAdmin && !selectedUser) {
    return <AdminPermissionError permissionError="You don't have permission to manage dashboard sections" dismissError={dismissError} />;
  }

  if (isSubscriptionLoading || isSectionsLoading) {
    return <Loading message="Loading dashboard sections..." />;
  }

  if (subscriptionError || sectionsError || error) {
    return (
      <Card>
        <CardContent>
          <p className="text-red-500">
            Error: {error || subscriptionError?.message || sectionsError || "Failed to load dashboard sections."}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardContent>
          <p>No subscription found for this user.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Dashboard Sections</CardTitle>
      </CardHeader>
      <CardContent>
        {availableSections.length > 0 ? (
          <div className="space-y-2">
            {availableSections.map(section => (
              <div key={section} className="flex items-center space-x-2">
                <Checkbox
                  id={section}
                  checked={userSections?.includes(section) || false}
                  onCheckedChange={() => handleSectionToggle(section)}
                />
                <label
                  htmlFor={section}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {section}
                </label>
              </div>
            ))}
            <Button onClick={saveDashboardSections} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <p>No dashboard sections available for this subscription.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardSectionsManager;
