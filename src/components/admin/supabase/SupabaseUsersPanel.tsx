import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  RefreshCw, 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  Loader2,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';
import { capitalize, titleCase } from '@/utils/string-helpers';
import { ISubscriptionPackage } from '@/models/SubscriptionPackage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import useSupabaseUsers from '@/hooks/useSupabaseUsers';
import { 
  Pagination, 
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { User } from '@/types/auth';

const SupabaseUsersPanel: React.FC = () => {
  const { users, isLoading, error, fetchUsers, totalCount } = useSupabaseUsers();
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = users.filter(user => 
        user.name?.toLowerCase().includes(term) || 
        user.email?.toLowerCase().includes(term) || 
        user.role?.toLowerCase().includes(term) ||
        user.business_name?.toLowerCase().includes(term)
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, currentPage]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleEditUser = (user: User) => {
    setEditingUser({...user});
    setIsEditing(true);
  };
  
  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setConfirmDelete(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "User Deleted",
        description: `${userToDelete.name || userToDelete.email} has been deleted.`,
      });
      
      fetchUsers();
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
      setUserToDelete(null);
    }
  };
  
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setIsSubmitting(true);
    try {
      const { id, name, email, role, is_admin, phone, business_name, business_category, 
              subscription_id, subscription_status, subscription_package } = editingUser;
      
      const { error } = await supabase
        .from('users')
        .update({ 
          name, 
          email, 
          role, 
          is_admin, 
          phone, 
          business_name, 
          business_category,
          subscription_id,
          subscription_status,
          subscription_package,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "User Updated",
        description: `${editingUser.name || editingUser.email} has been updated.`,
      });
      
      setIsEditing(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredUsers.length);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage all users in your application. Total: {filteredUsers.length}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchUsers()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users by name, email or role..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          {error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md">
              {error}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          <div className="flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                          <div className="mt-2">Loading users...</div>
                        </TableCell>
                      </TableRow>
                    ) : paginatedUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                          No users found matching your search.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.photo_url || user.photoURL} />
                                <AvatarFallback>
                                  {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name || 'Unnamed User'}</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.is_admin || user.isAdmin ? "default" : "outline"} className="capitalize">
                              {user.role || 'User'}
                            </Badge>
                            {user.is_admin || user.isAdmin && (
                              <div className="flex items-center mt-1 text-xs">
                                <ShieldCheck className="h-3 w-3 mr-1 text-primary" />
                                Admin
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={user.subscription_status === 'active' ? "default" : "outline"} 
                              className="capitalize"
                            >
                              {user.subscription_status || 'No subscription'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.phone || 'No phone'}
                            </div>
                            {user.business_name && (
                              <div className="text-xs text-muted-foreground">
                                {user.business_name}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1 || isLoading}
                      />
                    </PaginationItem>
                    
                    {currentPage > 2 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(1)}>
                          1
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {currentPage > 3 && (
                      <PaginationItem>
                        <PaginationLink className={currentPage === 3 ? "opacity-50 cursor-not-allowed" : ""}>...</PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {currentPage > 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(currentPage - 1)}>
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationLink isActive>{currentPage}</PaginationLink>
                    </PaginationItem>
                    
                    {currentPage < totalPages && (
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(currentPage + 1)}>
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {currentPage < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationLink className={currentPage === totalPages - 2 ? "opacity-50 cursor-not-allowed" : ""}>...</PaginationLink>
                      </PaginationItem>
                    )}
                    
                    {currentPage < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationLink onClick={() => handlePageChange(totalPages)}>
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || isLoading}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <Sheet open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
          </SheetHeader>
          
          <div className="py-4 space-y-4">
            {editingUser && (
              <div>
                <Button
                  className="w-full mt-4"
                  onClick={handleUpdateUser}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {confirmDelete && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Deletion</CardTitle>
              <CardDescription>
                Are you sure you want to delete this user? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p><strong>Name:</strong> {userToDelete.name || 'N/A'}</p>
                <p><strong>Email:</strong> {userToDelete.email || 'N/A'}</p>
                <p><strong>Role:</strong> {userToDelete.role || 'User'}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setConfirmDelete(false);
                    setUserToDelete(null);
                  }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete User'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default SupabaseUsersPanel;
