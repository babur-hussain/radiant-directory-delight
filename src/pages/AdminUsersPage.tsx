
// Partial update to fix the specific error
// Update the setUsers function to handle the object type

const fetchUsers = async () => {
  setLoading(true);
  try {
    const response = await getUsersWithCount();
    if ('users' in response && 'count' in response) {
      // Now handling the object structure
      setUsers(response.users);
      setTotalCount(response.count);
    } else {
      // Handle array response
      setUsers(response);
      setTotalCount(response.length);
    }
    setLoading(false);
  } catch (error) {
    console.error('Error fetching users:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch users. Please try again.',
      variant: 'destructive',
    });
    setLoading(false);
  }
};

// Later in the code, update the UserDetailsPopup component usage:
{selectedUser && (
  <UserDetailsPopup
    user={selectedUser}
    open={showUserDetails}
    onOpenChange={(open) => setShowUserDetails(open)}
    onClose={() => setSelectedUser(null)}
  />
)}
