
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, RefreshCw, Users, Filter, UserPlus, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { User, UserRole } from "@/types/auth";
import { loadAllUsers, saveUserToAllUsersList } from "@/features/auth/authStorage";
import { getAllUsers, createTestUser, ensureTestUsers } from "@/features/auth/userManagement";
import { db } from "@/config/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loading from "@/components/ui/loading";

interface UserData {
  id: string;
  email: string | null;
  name: string | null;
  role: string | null;
  isAdmin: boolean;
  createdAt?: string;
}

interface UserPermissionsTabProps {
  onRefresh?: () => void;
}

const USERS_PER_PAGE = 10;

const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({ onRefresh }) => {
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
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("Business");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeListenerActive, setRealtimeListenerActive] = useState(false);
  
  const { updateUserPermission } = useAuth();
  const { toast } = useToast();

  const convertToUserData = (user: User | Partial<User>): UserData => {
    return {
      id: user.id || "",
      email: user.email || null,
      name: typeof user.name === 'boolean' ? 'User' : (user.name || null),
      role: user.role || null,
      isAdmin: typeof user.isAdmin === 'boolean' 
        ? user.isAdmin 
        : (typeof user.isAdmin === 'string' 
          ? user.isAdmin.toLowerCase() === 'true' 
          : Boolean(user.isAdmin)),
      createdAt: (user as any).createdAt || new Date().toISOString(),
    };
  };

  const loadUsersFromFirebase = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching users directly from Firebase using getAllUsers()...");
      
      // First ensure we have some test users
      await ensureTestUsers();
      
      // Then fetch all users including the test ones
      const firebaseUsers = await getAllUsers();
      
      console.log("Users fetched from Firebase:", firebaseUsers.length, firebaseUsers);
      
      if (firebaseUsers.length > 0) {
        setUsers(firebaseUsers.map(convertToUserData));
        
        firebaseUsers.forEach(user => {
          saveUserToAllUsersList(user);
        });
        
        toast({
          title: "Users Loaded",
          description: `Successfully loaded ${firebaseUsers.length} users from Firebase`,
        });
      } else {
        console.log("Firebase returned no users, falling back to localStorage");
        const localUsers = loadAllUsers().map(convertToUserData);
        setUsers(localUsers);
        console.log("Local users loaded:", localUsers.length);
        
        toast({
          title: "Warning",
          description: "No users found in Firebase. Using cached data.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      const localUsers = loadAllUsers().map(convertToUserData);
      setUsers(localUsers);
      setError("Failed to fetch users from Firebase. Using cached data.");
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

  useEffect(() => {
    loadUsersFromFirebase();
  }, []);

  useEffect(() => {
    try {
      if (realtimeListenerActive) {
        console.log("Real-time listener is already active");
        return;
      }
      
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, orderBy("createdAt", "desc"));
      
      console.log("Setting up real-time listener for users collection");
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
          console.log(`Real-time update: Received ${snapshot.docs.length} users from Firebase`);
          
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
            
            console.log("User data from real-time listener:", updatedUsers);
            setUsers(updatedUsers);
            
            // Also update the localStorage cache
            updatedUsers.forEach(user => {
              saveUserToAllUsersList(convertToUserData(user) as User);
            });
            
            if (!realtimeListenerActive) {
              setRealtimeListenerActive(true);
              toast({
                title: "Real-time Updates Active",
                description: "You'll now see live user updates",
              });
            }
          } else {
            console.log("Real-time update: Firebase users collection is empty");
          }
        } catch (innerError) {
          console.error("Error processing real-time updates:", innerError);
        }
      }, (error) => {
        console.error("Error in real-time user updates:", error);
        setError("Real-time updates failed. Data may be stale.");
        setRealtimeListenerActive(false);
        toast({
          title: "Real-time Updates Failed",
          description: "Could not establish real-time updates. Data may be stale.",
          variant: "destructive",
        });
      });
      
      return () => {
        console.log("Cleaning up real-time listener");
        unsubscribe();
        setRealtimeListenerActive(false);
      };
    } catch (error) {
      console.error("Error setting up real-time user updates:", error);
      setError("Failed to set up real-time updates. Using static data.");
    }
  }, [toast]);

  useEffect(() => {
    let result = [...users];
    
    console.log("Filtering/sorting users:", users.length);
    
    if (roleFilter !== "all") {
      result = result.filter(user => 
        roleFilter === "admin" 
          ? user.isAdmin 
          : user.role?.toLowerCase() === roleFilter.toLowerCase()
      );
    }
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
        (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
        (user.role && user.role.toLowerCase().includes(lowerSearch))
      );
    }
    
    result.sort((a, b) => {
      const aValue = a[sortBy as keyof UserData];
      const bValue = b[sortBy as keyof UserData];
      
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortDirection === "asc" ? -1 : 1;
      if (!bValue) return sortDirection === "asc" ? 1 : -1;
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return sortDirection === "asc"
          ? (aValue === bValue ? 0 : aValue ? 1 : -1)
          : (aValue === bValue ? 0 : aValue ? -1 : 1);
      }
      
      return 0;
    });
    
    console.log("Filtered/sorted users:", result.length);
    setFilteredUsers(result);
    setTotalPages(Math.ceil(result.length / USERS_PER_PAGE));
  }, [users, searchTerm, roleFilter, sortBy, sortDirection]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Call the parent refresh if available
    if (onRefresh) {
      onRefresh();
    } else {
      await loadUsersFromFirebase();
    }
    
    toast({
      title: "Refreshed",
      description: "User data has been refreshed",
    });
  };

  const handleToggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      await updateUserPermission(userId, isAdmin);
      
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

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
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

  const handleCreateTestUser = async () => {
    if (!newUserEmail || !newUserName) {
      toast({
        title: "Error",
        description: "Please provide both email and name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsCreatingUser(true);
      setError(null);
      
      console.log("Attempting to create test user:", {
        email: newUserEmail,
        name: newUserName,
        role: newUserRole
      });
      
      const newUser = await createTestUser({
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
        isAdmin: false
      });
      
      console.log("Test user created successfully:", newUser);
      
      // Update the local users state immediately to show the new user
      setUsers(prevUsers => [convertToUserData(newUser), ...prevUsers]);
      
      setIsAddUserOpen(false);
      setNewUserEmail("");
      setNewUserName("");
      
      toast({
        title: "Success",
        description: `Test user "${newUserName}" created successfully`,
      });
      
      // Real-time updates should catch this, but let's refresh to be sure
      setTimeout(() => {
        handleRefresh();
      }, 1000);
    } catch (error) {
      console.error("Error creating test user:", error);
      setError(`Failed to create user: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Error Creating User",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const getCurrentPageUsers = () => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  };

  if (loading && !refreshing) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-10">
          <Loading 
            size="lg" 
            message="Loading users data..." 
          />
        </CardContent>
      </Card>
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
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Test User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Test User</DialogTitle>
                <DialogDescription>
                  Create a test user for development purposes.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="col-span-3"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    placeholder="john@example.com"
                    className="col-span-3"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select 
                    value={newUserRole} 
                    onValueChange={(value) => setNewUserRole(value as UserRole)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Influencer">Influencer</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateTestUser}
                  disabled={isCreatingUser || !newUserEmail || !newUserName}
                >
                  {isCreatingUser && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {realtimeListenerActive && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <div className="flex items-center">
              <Badge variant="outline" className="bg-green-100 text-green-800 mr-2">Live</Badge>
              <AlertDescription>Real-time updates are active. User changes will appear automatically.</AlertDescription>
            </div>
          </Alert>
        )}
      
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or role"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
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
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setSortDirection(prev => prev === "asc" ? "desc" : "asc")}
            className="flex-shrink-0"
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            Showing {filteredUsers.length > 0 ? Math.min(filteredUsers.length, 1 + (currentPage - 1) * USERS_PER_PAGE) : 0} - {Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
          </span>
          {refreshing && <Loader2 className="h-3 w-3 animate-spin ml-2" />}
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 border rounded-md border-dashed">
            <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
            <Button 
              variant="outline"
              className="mt-4"
              onClick={handleRefresh}
            >
              Refresh Users
            </Button>
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
