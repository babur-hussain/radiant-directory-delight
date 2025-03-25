
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Search, Edit, Trash2, Check, X } from 'lucide-react';
import useSupabaseUsers from '@/hooks/useSupabaseUsers';
import { User } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const SupabaseUsersPanel = () => {
  const { users, isLoading, error, totalCount, fetchUsers, setUsers } = useSupabaseUsers(true);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limitPerPage = 10;
  
  const handleSearch = async () => {
    setIsSearching(true);
    try {
      await fetchUsers(1, limitPerPage, searchTerm);
      setPage(1);
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "Failed to search users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleRefresh = async () => {
    setSearchTerm('');
    await fetchUsers(page, limitPerPage);
  };
  
  const handlePageChange = async (newPage: number) => {
    await fetchUsers(newPage, limitPerPage, searchTerm);
    setPage(newPage);
  };
  
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsEditing(true);
  };
  
  const handleCloseEdit = () => {
    setIsEditing(false);
    setEditingUser(null);
  };
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: editingUser.name,
          role: editingUser.role,
          is_admin: editingUser.isAdmin,
          phone: editingUser.phone,
          business_name: editingUser.businessName,
          business_category: editingUser.businessCategory,
          instagram_handle: editingUser.instagramHandle,
          facebook_handle: editingUser.facebookHandle,
          city: editingUser.city,
          country: editingUser.country,
          verified: editingUser.verified,
        })
        .eq('id', editingUser.uid);
      
      if (error) throw error;
      
      toast({
        title: "User Updated",
        description: "User information has been updated successfully.",
      });
      
      handleCloseEdit();
      handleRefresh();
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };
  
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      // For safety, we'll just update the user's status rather than actually deleting
      const { error } = await supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userToDelete.uid);
      
      if (error) throw error;
      
      toast({
        title: "User Deactivated",
        description: "User has been deactivated successfully.",
      });
      
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      handleRefresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Deactivation Failed",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };
  
  const totalPages = Math.ceil(totalCount / limitPerPage);
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 p-4 rounded-md bg-red-50 border border-red-200">
            Error loading users: {error}
          </div>
          <Button className="mt-4" onClick={handleRefresh}>Retry</Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users Management</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading users...' : `Total users: ${totalCount}`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Input
              placeholder="Search by name, email or business name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="max-w-sm"
              disabled={isLoading || isSearching}
            />
            <Button 
              variant="outline" 
              onClick={handleSearch}
              disabled={isLoading || isSearching}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800"></div>
                      </div>
                      <div className="mt-2">Loading users...</div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {user.photoURL ? (
                              <img 
                                src={user.photoURL} 
                                alt={user.displayName || user.email || 'User'} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm text-gray-500">
                                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.displayName || 'Unnamed User'}</div>
                            <div className="text-sm text-muted-foreground">{user.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isAdmin ? "destructive" : user.role === 'Business' ? "default" : "secondary"}>
                          {user.isAdmin ? 'Admin' : user.role || 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.businessName || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.verified ? "success" : "outline"}>
                          {user.verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteClick(user)}>
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
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) handlePageChange(page - 1);
                      }}
                      className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          isActive={pageNum === page}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <PaginationItem>
                        <span className="px-2">...</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(totalPages);
                          }}
                          isActive={totalPages === page}
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) handlePageChange(page + 1);
                      }}
                      className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit User Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
            <SheetDescription>
              Update user information and settings
            </SheetDescription>
          </SheetHeader>
          
          {editingUser && (
            <form onSubmit={handleUpdate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  value={editingUser.name || ''} 
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select 
                  value={editingUser.role || 'User'} 
                  onValueChange={(value) => setEditingUser({...editingUser, role: value as any})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Influencer">Influencer</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="admin" className="flex-1">Admin Access</Label>
                <input
                  id="admin"
                  type="checkbox"
                  checked={editingUser.isAdmin}
                  onChange={(e) => setEditingUser({...editingUser, isAdmin: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={editingUser.phone || ''} 
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input 
                  id="businessName" 
                  value={editingUser.businessName || ''} 
                  onChange={(e) => setEditingUser({...editingUser, businessName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessCategory">Business Category</Label>
                <Input 
                  id="businessCategory" 
                  value={editingUser.businessCategory || ''} 
                  onChange={(e) => setEditingUser({...editingUser, businessCategory: e.target.value})}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Label htmlFor="verified" className="flex-1">Verified</Label>
                <input
                  id="verified"
                  type="checkbox"
                  checked={editingUser.verified}
                  onChange={(e) => setEditingUser({...editingUser, verified: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseEdit}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>
      
      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Deactivation</CardTitle>
              <CardDescription>
                Are you sure you want to deactivate this user? This action is reversible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p><strong>Name:</strong> {userToDelete.displayName || 'Unnamed User'}</p>
                <p><strong>Email:</strong> {userToDelete.email}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deactivating...
                    </>
                  ) : (
                    'Deactivate User'
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
