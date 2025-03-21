import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, RefreshCw, Search, UserPlus, Eye, Filter, IdCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserDetailsPopup from '@/components/admin/UserDetailsPopup';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeCodeFilter, setEmployeeCodeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const { toast } = useToast();

  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('User');
  const [newEmployeeCode, setNewEmployeeCode] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      let filtered = [...users];
      
      if (searchTerm) {
        filtered = filtered.filter((user) => 
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.name || user.displayName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (employeeCodeFilter) {
        filtered = filtered.filter((user) => 
          user.employeeCode?.toLowerCase().includes(employeeCodeFilter.toLowerCase())
        );
      }
      
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, employeeCodeFilter, users]);

  const transformRole = (role: string | null): UserRole => {
    if (!role) return 'User';
    
    switch (role.toLowerCase()) {
      case 'admin':
        return 'Admin';
      case 'business':
        return 'Business';
      case 'influencer':
        return 'Influencer';
      case 'staff':
        return 'Staff';
      case 'user':
      default:
        return 'User';
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching users from Supabase...');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const mappedUsers: User[] = data.map(userData => ({
          uid: userData.id,
          id: userData.id,
          email: userData.email || "",
          displayName: userData.name || "",
          name: userData.name || "",
          role: transformRole(userData.role),
          isAdmin: userData.is_admin || false,
          photoURL: userData.photo_url || "",
          employeeCode: userData.employee_code || "",
          createdAt: userData.created_at || new Date().toISOString(),
          lastLogin: userData.last_login || null,
          phone: userData.phone || "",
          instagramHandle: userData.instagram_handle || "",
          facebookHandle: userData.facebook_handle || "",
          verified: userData.verified || false,
          city: userData.city || "",
          country: userData.country || "",
          niche: userData.niche || "",
          followersCount: userData.followers_count || "",
          bio: userData.bio || "",
          businessName: userData.business_name || "",
          ownerName: userData.owner_name || "",
          businessCategory: userData.business_category || "",
          website: userData.website || "",
          gstNumber: userData.gst_number || "",
          subscription: userData.subscription || null,
          subscriptionId: userData.subscription_id || null,
          subscriptionStatus: userData.subscription_status || null,
          subscriptionPackage: userData.subscription_package || null,
          customDashboardSections: userData.custom_dashboard_sections || null
        }));
        
        console.log(`Fetched ${mappedUsers.length} users from Supabase`);
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } else {
        toast({
          title: "No users found",
          description: "The system didn't return any users",
          variant: "destructive"
        });
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEmployeeCodeFilter('');
    setShowFilterPopover(false);
  };

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserName) {
      toast({
        title: 'Validation Error',
        description: 'Email and name are required',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: newUserEmail,
          name: newUserName,
          role: newUserRole.toLowerCase(),
          is_admin: isAdmin,
          employee_code: newEmployeeCode,
          created_at: new Date().toISOString()
        }])
        .select();
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newUser: User = {
          uid: data[0].id,
          id: data[0].id,
          email: data[0].email,
          name: data[0].name,
          displayName: data[0].name,
          role: transformRole(data[0].role),
          isAdmin: data[0].is_admin || false,
          employeeCode: data[0].employee_code || '',
          createdAt: data[0].created_at,
          lastLogin: null,
          phone: '',
          photoURL: '',
          instagramHandle: '',
          facebookHandle: '',
          verified: false,
          city: '',
          country: '',
          niche: '',
          followersCount: '',
          bio: '',
          businessName: '',
          ownerName: '',
          businessCategory: '',
          website: '',
          gstNumber: '',
          subscription: null,
          subscriptionId: null,
          subscriptionStatus: null,
          subscriptionPackage: null,
          customDashboardSections: null
        };

        toast({
          title: 'Success',
          description: `User ${newUserName} has been created`,
        });

        setUsers((prevUsers) => {
          const updatedUsers = [newUser, ...prevUsers];
          return updatedUsers;
        });
      }
      
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('User');
      setNewEmployeeCode('');
      setIsAdmin(false);
      setShowAddUserDialog(false);
    } catch (err) {
      console.error('Error creating user:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create user',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkUploadUsers = async (users: any[]) => {
    try {
      setIsLoading(true);
      
      const formattedUsers = users.map(user => ({
        id: user.id || undefined,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        is_admin: user.is_admin || false,
        employee_code: user.employee_code || '',
        created_at: user.created_at || new Date().toISOString()
      }));
      
      for (const user of formattedUsers) {
        const { error } = await supabase
          .from('users')
          .upsert(user);
          
        if (error) {
          console.error('Error adding user:', error);
          throw error;
        }
      }
      
      toast({
        title: 'Users Added',
        description: `Successfully added ${users.length} users.`,
      });
      
      fetchUsers();
    } catch (error) {
      console.error('Error in bulk upload:', error);
      toast({
        title: 'Error',
        description: 'Failed to add users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (employeeCodeFilter) count++;
    return count;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">User Management</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={fetchUsers} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
            <Button 
              className="flex items-center gap-2"
              onClick={() => setShowAddUserDialog(true)}
            >
              <UserPlus className="h-4 w-4" />
              Add New User
            </Button>
          </div>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View and manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
                
                <Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      Filters
                      {getActiveFiltersCount() > 0 && (
                        <Badge variant="secondary" className="ml-1 rounded-full px-1.5 py-0.5">
                          {getActiveFiltersCount()}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4">
                    <h4 className="font-medium mb-2">Filter Options</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="employeeCodeFilter" className="flex items-center gap-2">
                          <IdCard className="h-4 w-4" />
                          Employee Code
                        </Label>
                        <Input
                          id="employeeCodeFilter"
                          placeholder="Search by employee code"
                          value={employeeCodeFilter}
                          onChange={(e) => setEmployeeCodeFilter(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-between pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={clearFilters}
                        >
                          Clear Filters
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => setShowFilterPopover(false)}
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {filteredUsers.length} users found
                </p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Employee Code</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.uid || user.id}>
                          <TableCell className="font-medium">
                            {user.name || user.displayName || 'No Name'}
                          </TableCell>
                          <TableCell>{user.email || 'No Email'}</TableCell>
                          <TableCell>{user.role || 'User'}</TableCell>
                          <TableCell>
                            {user.employeeCode ? (
                              <span className="px-2 py-1 bg-amber-50 rounded-md text-amber-800 font-medium text-xs">
                                {user.employeeCode}
                              </span>
                            ) : (
                              <span className="text-gray-400">Not assigned</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.isAdmin ? (
                              <Badge variant="default">Admin</Badge>
                            ) : (
                              <Badge variant="outline">Standard</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {user.createdAt 
                              ? new Date(user.createdAt).toLocaleDateString() 
                              : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => viewUserDetails(user)}
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">Edit</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                placeholder="John Doe"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeCode">Employee Code</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="employeeCode" 
                  placeholder="EMP-12345"
                  className="pl-10"
                  value={newEmployeeCode}
                  onChange={(e) => setNewEmployeeCode(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={newUserRole} 
                onValueChange={(value: UserRole) => setNewUserRole(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Influencer">Influencer</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAdmin"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="rounded border-gray-300"
              />
              <Label htmlFor="isAdmin">Admin Access</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddUserDialog(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmitting || !newUserEmail || !newUserName}
              onClick={handleAddUser}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserDetailsPopup 
        isOpen={showUserDetails}
        onClose={() => setShowUserDetails(false)}
        user={selectedUser}
      />
    </AdminLayout>
  );
};

export default AdminUsersPage;
