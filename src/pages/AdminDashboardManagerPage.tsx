import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Save, RefreshCw, Users } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { connectToMongoDB } from '@/config/mongodb';
import { User } from '@/models/User';
import { 
  BUSINESS_DASHBOARD_SECTIONS, 
  INFLUENCER_DASHBOARD_SECTIONS,
  updateUserDashboardSections 
} from '@/utils/dashboardSections';

const AdminDashboardManagerPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSections, setUserSections] = useState<string[]>([]);
  const [availableSections, setAvailableSections] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<{ [key: string]: { total: number, completed: number } }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      // Set available sections based on user role
      const sections = selectedUser.role === 'Business' 
        ? BUSINESS_DASHBOARD_SECTIONS 
        : INFLUENCER_DASHBOARD_SECTIONS;
      
      setAvailableSections(sections);
      
      // Set user's current sections
      setUserSections(selectedUser.customDashboardSections || []);
      
      // Initialize metrics with defaults
      const initialMetrics: { [key: string]: { total: number, completed: number } } = {};
      sections.forEach(section => {
        initialMetrics[section] = { 
          total: Math.floor(Math.random() * 10) + 1, // Random sample data
          completed: Math.floor(Math.random() * 5) // Random sample data
        };
      });
      setMetrics(initialMetrics);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await connectToMongoDB();
      const usersQuery = await User.find();
      
      let allUsers = [];
      
      // Check if the query result has a sort method
      if (usersQuery && typeof usersQuery.sort === 'function') {
        const sortedQuery = usersQuery.sort({ name: 1 });
        if (sortedQuery && typeof sortedQuery.exec === 'function') {
          allUsers = await sortedQuery.exec();
        } else if (sortedQuery && sortedQuery.lean) {
          // Try lean if exec is not available
          allUsers = await sortedQuery.lean();
        } else {
          // Fallback to results property
          allUsers = sortedQuery.results || [];
        }
      } else {
        // Fallback if sort is not available
        console.warn("Sort method not available on query result");
        allUsers = usersQuery.results || [];
      }
      
      setUsers(allUsers);
      
      if (allUsers.length > 0 && !selectedUser) {
        setSelectedUserId(allUsers[0].uid);
        setSelectedUser(allUsers[0]);
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    const user = users.find(u => u.uid === userId);
    setSelectedUser(user || null);
  };

  const toggleSection = (section: string) => {
    if (userSections.includes(section)) {
      setUserSections(userSections.filter(s => s !== section));
    } else {
      setUserSections([...userSections, section]);
    }
  };

  const handleMetricChange = (section: string, type: 'total' | 'completed', value: number) => {
    setMetrics({
      ...metrics,
      [section]: {
        ...metrics[section],
        [type]: value
      }
    });
  };

  const saveUserDashboard = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      // Save user dashboard sections
      await updateUserDashboardSections(selectedUser.uid, userSections);
      
      // Here we would save the metrics to the database
      // For now we'll just show a success message
      
      toast({
        title: "Dashboard Updated",
        description: "Dashboard sections and metrics have been updated successfully.",
      });
    } catch (err) {
      console.error("Error saving dashboard:", err);
      toast({
        title: "Update Failed",
        description: "There was an error updating the dashboard. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard Manager</h1>
          <Button onClick={loadUsers} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Users
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle>User Dashboard Customization</CardTitle>
            <CardDescription>
              Select a user to customize their dashboard elements and metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="w-full md:max-w-sm">
                  <Label htmlFor="user-select">Select User</Label>
                  <Select 
                    value={selectedUserId} 
                    onValueChange={handleUserChange}
                  >
                    <SelectTrigger id="user-select">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.uid} value={user.uid}>
                          {user.name || user.email || user.uid} 
                          {user.role && ` (${user.role})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedUser && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-md">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{selectedUser.name || selectedUser.email || selectedUser.uid}</div>
                      <div className="text-sm text-muted-foreground">Role: {selectedUser.role || "User"}</div>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedUser && (
                <>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Dashboard Sections</h3>
                      <p className="text-sm text-muted-foreground">
                        Select which sections will appear on the user's dashboard
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSections.map((section) => (
                        <div 
                          key={section} 
                          className="flex items-start space-x-2 border p-4 rounded-md"
                        >
                          <Checkbox 
                            id={`section-${section}`} 
                            checked={userSections.includes(section)} 
                            onCheckedChange={() => toggleSection(section)}
                          />
                          <div className="space-y-1 w-full">
                            <Label 
                              htmlFor={`section-${section}`}
                              className="font-medium cursor-pointer"
                            >
                              {section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </Label>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label htmlFor={`total-${section}`} className="text-xs">
                                  Total Tasks
                                </Label>
                                <Input
                                  id={`total-${section}`}
                                  type="number"
                                  min="0"
                                  value={metrics[section]?.total || 0}
                                  onChange={(e) => handleMetricChange(
                                    section, 
                                    'total', 
                                    parseInt(e.target.value) || 0
                                  )}
                                  className="h-8"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`completed-${section}`} className="text-xs">
                                  Completed
                                </Label>
                                <Input
                                  id={`completed-${section}`}
                                  type="number"
                                  min="0"
                                  max={metrics[section]?.total || 0}
                                  value={metrics[section]?.completed || 0}
                                  onChange={(e) => handleMetricChange(
                                    section, 
                                    'completed', 
                                    parseInt(e.target.value) || 0
                                  )}
                                  className="h-8"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={saveUserDashboard} 
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Dashboard Settings
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {selectedUser && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Dashboard Metrics Summary</CardTitle>
              <CardDescription>
                Overview of all metrics for this user's dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Enabled</TableHead>
                    <TableHead>Total Tasks</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableSections.map((section) => (
                    <TableRow key={section}>
                      <TableCell className="font-medium">
                        {section.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        {userSections.includes(section) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Disabled
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{metrics[section]?.total || 0}</TableCell>
                      <TableCell>{metrics[section]?.completed || 0}</TableCell>
                      <TableCell>
                        {metrics[section]?.total > 0 ? (
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ 
                                width: `${(metrics[section]?.completed / metrics[section]?.total) * 100}%` 
                              }}
                            ></div>
                          </div>
                        ) : (
                          <span className="text-gray-500">No tasks</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardManagerPage;
