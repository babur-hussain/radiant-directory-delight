import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, RefreshCw, Users, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { User, UserRole } from "@/types/auth";
import { loadAllUsers, saveUserToAllUsersList } from "@/features/auth/authStorage";
import { getAllUsers } from "@/features/auth/userManagement";

interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  isAdmin: boolean;
  createdAt?: string;
}

const USERS_PER_PAGE = 10;

const UserPermissionsTab = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { updateUserPermission } = useAuth();
  const { toast } = useToast();

  // Function to convert User to UserData
  const convertToUserData = (user: User | Partial<User>): UserData => {
    return {
      id: user.id || "",
      email: user.email || null,
      name: user.name || null,
      role: user.role || null,
      isAdmin: user.isAdmin || false,
      createdAt: (user as any).createdAt || new Date().toISOString(),
    };
  };

  // Function to load users directly from Firebase using userManagement.ts
  const loadUsersFromFirebase = async () => {
    try {
      setLoading(true);
      console.log("Fetching users directly from Firebase using getAllUsers()...");
      
      // Use the enhanced getAllUsers function
      const firebaseUsers = await getAllUsers();
      
      console.log("Users fetched from Firebase:", firebaseUsers.length, firebaseUsers);
      
      if (firebaseUsers.length > 0) {
        // We found users in Firebase
        setUsers(firebaseUsers.map(convertToUserData));
        
        // Save to localStorage for backup
        firebaseUsers.forEach(user => {
          saveUserToAllUsersList(user);
        });
      } else {
        // Fallback to localStorage if Firebase is empty
        console.log("Firebase returned no users, falling back to localStorage");
        const localUsers = loadAllUsers().map(convertToUserData);
        setUsers(localUsers);
        console.log("Local users loaded:", localUsers.length);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      // Fallback to localStorage
      const localUsers = loadAllUsers().map(convertToUserData);
      setUsers(localUsers);
      toast({
        title: "Warning",
        description: "Could not connect to Firebase. Using cached data instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    loadUsersFromFirebase();
  }, []);

  // Set up real-time listener for users collection
  useEffect(() => {
    try {
      // First, load initial data
      loadUsersFromFirebase();
      
      // Then set up the real-time listener on the users collection
      const usersCollection = collection(db, "users");
      const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
        if (!snapshot.empty) {
          const updatedUsers = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              email: data.email || null,
              name: data.name || data.displayName || null,
              role: data.role || null,
              isAdmin: data.isAdmin || false,
              createdAt: data.createdAt || new Date().toISOString(),
            };
          });
          
          // Update local state with real-time data
          setUsers(updatedUsers);
          console.log("Real-time user update:", updatedUsers);
          
          // Also update localStorage
          updatedUsers.forEach(user => {
            saveUserToAllUsersList(convertToUserData(user) as User);
          });
        }
      }, (error) => {
        console.error("Error in real-time user updates:", error);
        toast({
          title: "Real-time Updates Failed",
          description: "Could not establish real-time updates. Data may be stale.",
          variant: "destructive",
        });
      });
      
      // Clean up the listener when component unmounts
      return () => unsubscribe();
    } catch (error) {
      console.error("Error setting up real-time user updates:", error);
      // Fallback to non-real-time data
      loadUsersFromFirebase();
    }
  }, []);

  // Filter and sort users whenever relevant states change
  useEffect(() => {
    let result = [...users];
    
    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter(user => 
        roleFilter === "admin" 
          ? user.isAdmin 
          : user.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
        (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
        (user.role && user.role.toLowerCase().includes(lowerSearch))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortBy as keyof UserData];
      const bValue = b[sortBy as keyof UserData];
      
      // Handle null or undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortDirection === "asc" ? -1 : 1;
      if (!bValue) return sortDirection === "asc" ? 1 : -1;
      
      // Compare string values
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Compare boolean values
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortDirection === "asc"
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1);
      }
      
      return 0;
    });
    
    setFilteredUsers(result);
    setTotalPages(Math.ceil(result.length / USERS_PER_PAGE));
  }, [users, searchTerm, roleFilter, sortBy, sortDirection]);

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsersFromFirebase();
    
    toast({
      title: "Refreshed",
      description: "User data has been refreshed",
    });
  };

  // Handle toggle admin permission
  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await updateUserPermission(userId, isAdmin);
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isAdmin } : user
        )
      );
      
      toast({
        title: "Success",
        description: `Admin permission ${isAdmin ? 'granted' : 'removed'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user permissions",
        variant: "destructive",
      });
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // Update role in Firebase would be implemented here
      
      // For now, just update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      toast({
        title: "Success",
        description: `User role updated to ${newRole}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  // Pagination - get current page of users
  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Permissions</CardTitle>
          <CardDescription>
            Manage access and roles for users ({filteredUsers.length} users)
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Role Filter */}
          <div className="flex-shrink-0 w-full md:w-[180px]">
            <Select 
              value={roleFilter} 
              onValueChange={setRoleFilter}
            >
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Influencer">Influencer</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort Control */}
          <div className="flex-shrink-0 w-full md:w-[180px]">
            <Select 
              value={sortBy} 
              onValueChange={setSortBy}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="role">Role</SelectItem>
                <SelectItem value="isAdmin">Admin Status</SelectItem>
                <SelectItem value="createdAt">Registration Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Sort Direction Button */}
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
            className="flex-shrink-0"
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </Button>
        </div>
        
        {/* User Count Summary */}
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            Showing {Math.min(filteredUsers.length, 1 + (currentPage - 1) * USERS_PER_PAGE)} - {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
          </span>
          {refreshing && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 border rounded-md border-dashed">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Admin Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getCurrentPageUsers().map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name || "Unknown"}</TableCell>
                    <TableCell>{user.email || "No email"}</TableCell>
                    <TableCell>
                      <Select 
                        defaultValue={user.role || ""}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                      >
                        <SelectTrigger className="h-8 w-[120px]">
                          <SelectValue>
                            {user.role ? (
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                {user.role}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">Not set</span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Influencer">Influencer</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge className="bg-green-500">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={user.isAdmin || false}
                        onCheckedChange={(checked) => handleToggleAdmin(user.id, checked)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserPermissionsTab;
