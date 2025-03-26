import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from next/navigation to react-router-dom
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { User, UserRole, normalizeRole } from '@/types/auth';
import { getAllUsers } from '@/features/auth/userDataAccess';
import { updateUserRole } from '@/features/auth/roleManagement';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, MoreHorizontal, Search, Trash2, UserPlus } from 'lucide-react';
import UserDetailsPopup from '@/components/admin/UserDetailsPopup';
import { useToast } from '@/components/ui/use-toast'; // Fixed import

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('user');
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState<Partial<User>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const userToUpdate = users.find(user => user.id === userId);
      if (!userToUpdate) {
        console.error("User not found");
        return;
      }

      // Optimistically update the UI
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      // Update the user role
      await updateUserRole({ ...userToUpdate, role: newRole });

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchMatch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = selectedRole === 'all' || normalizeRole(user.role) === selectedRole;
    return searchMatch && roleMatch;
  });

  const openUserDetails = (user: User) => {
    setUserDetails(user);
    setIsUserDetailsOpen(true);
  };

  const closeUserDetails = () => {
    setIsUserDetailsOpen(false);
    setUserDetails(null);
  };

  const handleCreateUser = async () => {
    setIsCreatingUser(true);
    // Implement your create user logic here
    setIsCreatingUser(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <Button onClick={() => navigate('/admin/create-user')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="influencer">Influencer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar>
                          <AvatarImage src={user.photoURL} />
                          <AvatarFallback>{user.name?.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openUserDetails(user)}>
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleRoleChange(
                                user.id,
                                user.role === 'admin' ? 'user' : 'admin'
                              )
                            }
                          >
                            {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <UserDetailsPopup
        open={isUserDetailsOpen}
        onClose={closeUserDetails}
        user={userDetails}
      />
    </DashboardLayout>
  );
};

export default AdminUsersPage;
