
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Save, Users, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import useSupabaseUsers from '@/hooks/useSupabaseUsers';
import { supabase } from '@/integrations/supabase/client';
import { normalizeRole } from '@/types/auth';

const BUSINESS_SECTIONS = [
  'seo_optimization',
  'google_business',
  'reels_and_ads',
  'marketing_campaigns',
  'business_ratings',
  'creative_designs',
  'leads_and_inquiries',
  'reach_and_visibility',
  'growth_analytics'
];

const INFLUENCER_SECTIONS = [
  'influencer_rank',
  'performance_metrics',
  'leads_generated',
  'ratings_reviews',
  'creatives_tracker',
  'reels_progress',
  'seo_progress',
  'google_listing_status'
];

const SupabaseDashboardSections = () => {
  const [activeTab, setActiveTab] = useState('packages');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [packageSections, setPackageSections] = useState<string[]>([]);
  const [userSections, setUserSections] = useState<string[]>([]);
  const [isSavingPackage, setIsSavingPackage] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  
  const { packages, isLoading: packagesLoading, refetch: refetchPackages } = useSubscriptionPackages();
  const { users, isLoading: usersLoading, fetchUsers } = useSupabaseUsers();
  const { toast } = useToast();
  
  useEffect(() => {
    if (packages && packages.length > 0 && !selectedPackageId) {
      setSelectedPackageId(packages[0].id);
      setPackageSections(packages[0].dashboardSections || []);
    }
  }, [packages, selectedPackageId]);
  
  useEffect(() => {
    if (users && users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].uid);
      setUserSections(users[0].custom_dashboard_sections || []);
    }
  }, [users, selectedUserId]);
  
  const handleSelectPackage = (packageId: string) => {
    setSelectedPackageId(packageId);
    const selectedPackage = packages.find(p => p.id === packageId);
    if (selectedPackage) {
      setPackageSections(selectedPackage.dashboardSections || []);
    } else {
      setPackageSections([]);
    }
  };
  
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    const selectedUser = users.find(u => u.uid === userId);
    if (selectedUser) {
      setUserSections(selectedUser.custom_dashboard_sections || []);
    } else {
      setUserSections([]);
    }
  };
  
  const togglePackageSection = (section: string) => {
    if (packageSections.includes(section)) {
      setPackageSections(packageSections.filter(s => s !== section));
    } else {
      setPackageSections([...packageSections, section]);
    }
  };
  
  const toggleUserSection = (section: string) => {
    if (userSections.includes(section)) {
      setUserSections(userSections.filter(s => s !== section));
    } else {
      setUserSections([...userSections, section]);
    }
  };
  
  const savePackageSections = async () => {
    if (!selectedPackageId) return;
    
    setIsSavingPackage(true);
    try {
      const { error } = await supabase
        .from('subscription_packages')
        .update({ dashboard_sections: packageSections })
        .eq('id', selectedPackageId);
      
      if (error) throw error;
      
      toast({
        title: "Package Updated",
        description: "Dashboard sections have been updated for this package.",
      });
      
      refetchPackages();
    } catch (error) {
      console.error("Error saving package sections:", error);
      toast({
        title: "Update Failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsSavingPackage(false);
    }
  };
  
  const saveUserSections = async () => {
    if (!selectedUserId) return;
    
    setIsSavingUser(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ custom_dashboard_sections: userSections })
        .eq('id', selectedUserId);
      
      if (error) throw error;
      
      toast({
        title: "User Updated",
        description: "Dashboard sections have been updated for this user.",
      });
      
      fetchUsers();
    } catch (error) {
      console.error("Error saving user sections:", error);
      toast({
        title: "Update Failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsSavingUser(false);
    }
  };
  
  const getAvailableSections = (type: 'Business' | 'Influencer' | null) => {
    return type === 'Influencer' ? INFLUENCER_SECTIONS : BUSINESS_SECTIONS;
  };
  
  const selectedPackage = packages.find(p => p.id === selectedPackageId);
  const selectedUser = users.find(u => u.uid === selectedUserId);
  
  const handleRefresh = () => {
    refetchPackages();
  };
  
  const handleRefetchPackages = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    refetchPackages();
  };
  
  const handleRefetchUsers = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fetchUsers();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard Sections Management</CardTitle>
        <CardDescription>
          Configure dashboard sections for subscription packages and individual users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="packages">
            <div className="space-y-4">
              {packagesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="package-select">Select Package</Label>
                      <Select
                        value={selectedPackageId}
                        onValueChange={handleSelectPackage}
                      >
                        <SelectTrigger id="package-select" className="w-[300px]">
                          <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              {pkg.title} ({pkg.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline" 
                      onClick={handleRefetchPackages} 
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  {selectedPackage && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">
                            Dashboard Sections for {selectedPackage.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            <Badge variant={selectedPackage.type === 'Business' ? 'default' : 'secondary'}>
                              {selectedPackage.type}
                            </Badge>
                          </p>
                        </div>
                        <Button 
                          onClick={savePackageSections}
                          disabled={isSavingPackage}
                        >
                          {isSavingPackage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Sections
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {getAvailableSections(selectedPackage.type as any).map((section) => (
                          <div key={section} className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                            <div className="flex-1">
                              <Label htmlFor={`pkg-${section}`} className="flex cursor-pointer">
                                {section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </Label>
                            </div>
                            <Switch
                              id={`pkg-${section}`}
                              checked={packageSections.includes(section)}
                              onCheckedChange={() => togglePackageSection(section)}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <div className="space-y-4">
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="user-select">Select User</Label>
                      <Select
                        value={selectedUserId}
                        onValueChange={handleSelectUser}
                      >
                        <SelectTrigger id="user-select" className="w-[300px]">
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.uid} value={user.uid}>
                              {user.displayName || user.email} ({user.role || 'User'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline" 
                      onClick={handleRefetchUsers} 
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                  
                  {selectedUser && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium">
                            Dashboard Sections for {selectedUser.displayName || selectedUser.email}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            <Badge variant={normalizeRole(selectedUser.role) === 'business' ? 'default' : 'secondary'}>
                              {selectedUser.role || 'User'}
                            </Badge>
                          </p>
                        </div>
                        <Button 
                          onClick={saveUserSections}
                          disabled={isSavingUser}
                        >
                          {isSavingUser ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Sections
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {getAvailableSections(selectedUser.role as any).map((section) => (
                          <div key={section} className="flex items-center justify-between space-x-2 p-4 border rounded-md">
                            <div className="flex-1">
                              <Label htmlFor={`user-${section}`} className="flex cursor-pointer">
                                {section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                              </Label>
                            </div>
                            <Switch
                              id={`user-${section}`}
                              checked={userSections.includes(section)}
                              onCheckedChange={() => toggleUserSection(section)}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Add explicit default export
export default SupabaseDashboardSections;
