import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAllUsers } from "@/services/userService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Copy, Edit, Trash, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  User,
  UserRole,
  normalizeRole
} from "@/types/auth";
import { cn } from "@/lib/utils";
import { updateUser } from "@/services/userService";
import { Loader2 } from "lucide-react";

interface UserDetailsPopupProps {
  open: boolean;
  onClose: () => void;
  user: User;
}

const UserDetailsPopup: React.FC<UserDetailsPopupProps> = ({ open, onClose, user }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View detailed information about the selected user.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input type="text" id="name" value={user.name || "N/A"} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input type="email" id="email" value={user.email || "N/A"} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Input type="text" id="role" value={user.role || "N/A"} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isAdmin" className="text-right">
              Is Admin
            </Label>
            <Input
              type="text"
              id="isAdmin"
              value={user.isAdmin ? "Yes" : "No"}
              readOnly
              className="col-span-3"
            />
          </div>
          {/* Add more user details here as needed */}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminUsersPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(normalizeRole('user'));
  const [isRoleUpdateLoading, setIsRoleUpdateLoading] = useState(false);
  const [isRoleUpdateSuccess, setIsRoleUpdateSuccess] = useState(false);
  const [isRoleUpdateError, setIsRoleUpdateError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const usersPerPage = 10;
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push('/auth');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getAllUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsOpen(true);
  };

  const handleRoleChange = async (user: User, newRole: UserRole) => {
    setIsRoleUpdateLoading(true);
    setIsRoleUpdateSuccess(false);
    setIsRoleUpdateError(false);

    try {
      // Optimistically update the user's role in the local state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === user.id ? { ...u, role: newRole } : u
        )
      );

      // Call the updateUser function to update the user's role in the database
      await updateUser(user.id, { role: newRole });

      toast({
        title: "Success",
        description: `User role updated to ${newRole}.`,
      });
      setIsRoleUpdateSuccess(true);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      });
      setIsRoleUpdateError(true);

      // Revert the optimistic update if the API call fails
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? { ...u, role: user.role } : u))
      );
    } finally {
      setIsRoleUpdateLoading(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    // Implement delete user logic here
    console.log("Delete user:", user);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower)
    );
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getRoleBadge = (role: UserRole | undefined) => {
    if (normalizeRole(role) === 'admin') {
      return <Badge variant="destructive">Admin</Badge>;
    } else if (normalizeRole(role) === 'business') {
      return <Badge variant="secondary">Business</Badge>;
    } else if (normalizeRole(role) === 'influencer') {
      return <Badge className="bg-sky-500 text-white">Influencer</Badge>;
    } else if (normalizeRole(role) === 'staff') {
      return <Badge className="bg-orange-500 text-white">Staff</Badge>;
    } else {
      return <Badge>User</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <Card className="container mx-auto max-w-7xl p-6">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          Manage users and their roles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Avatar</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <Avatar>
                      <AvatarImage src={user.photoURL} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          <UserIcon className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Update Role</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user, 'admin')}
                          disabled={isRoleUpdateLoading}
                        >
                          Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user, 'business')}
                          disabled={isRoleUpdateLoading}
                        >
                          Business
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user, 'influencer')}
                          disabled={isRoleUpdateLoading}
                        >
                          Influencer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user, 'staff')}
                          disabled={isRoleUpdateLoading}
                        >
                          Staff
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user, 'user')}
                          disabled={isRoleUpdateLoading}
                        >
                          User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          <span>Copy Info</span>
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem>
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete{" "}
                                {user.name} and remove their data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-2">
          <Button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span>Page {currentPage}</span>
          <Button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={paginatedUsers.length < usersPerPage}
            variant="outline"
          >
            Next
          </Button>
        </div>
      </CardContent>

      {selectedUser && (
        <UserDetailsPopup 
          open={isUserDetailsOpen} 
          onClose={() => setIsUserDetailsOpen(false)} 
          user={selectedUser} 
        />
      )}
    </Card>
  );
};

export default AdminUsersPage;
