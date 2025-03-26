
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { updateUser, getUserById } from '@/services/userService';
import { User, UserRole } from '@/types/auth';
import { toast } from './use-toast';

export const useUserProfile = (userId?: string) => {
  const { user: currentUser } = useAuth();
  const targetUserId = userId || currentUser?.uid;
  const queryClient = useQueryClient();
  
  // Local state for form
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [savingStatus, setSavingStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'
  
  // Fetch user data
  const { data: userData, isLoading, error, refetch } = useQuery({
    queryKey: ['user', targetUserId],
    queryFn: () => targetUserId ? getUserById(targetUserId) : null,
    enabled: !!targetUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Update form data when user data changes
  useEffect(() => {
    if (userData) {
      setFormData(userData);
    }
  }, [userData]);
  
  // Handle form field changes
  const handleChange = (field: keyof User, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Special handler for role changes to ensure it's a UserRole type
  const handleRoleChange = (value: string) => {
    // Ensure role is a valid UserRole
    const role: UserRole = (value as UserRole) || 'User';
    setFormData(prev => ({ ...prev, role }));
  };
  
  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      if (!targetUserId) throw new Error('No user ID provided');
      
      // Validate role is a UserRole type
      if (data.role && typeof data.role === 'string') {
        const validRoles: UserRole[] = ['Admin', 'Business', 'Influencer', 'User', 'Staff'];
        data.role = validRoles.includes(data.role as UserRole) ? (data.role as UserRole) : 'User';
      }
      
      return updateUser(targetUserId, data);
    },
    onMutate: () => {
      setSavingStatus('saving');
    },
    onSuccess: (updatedUser) => {
      setSavingStatus('success');
      
      // Update the user in the cache
      queryClient.setQueryData(['user', targetUserId], updatedUser);
      
      // Show success toast
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      
      // Exit edit mode
      setIsEditing(false);
      
      // Reset status after a delay
      setTimeout(() => {
        setSavingStatus('idle');
      }, 2000);
    },
    onError: (error) => {
      setSavingStatus('error');
      
      // Show error toast
      toast({
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
      
      // Reset status after a delay
      setTimeout(() => {
        setSavingStatus('idle');
      }, 2000);
    },
  });
  
  // Save profile changes
  const saveProfile = async () => {
    // Validate role is a UserRole type if it exists
    if (formData.role && typeof formData.role === 'string') {
      const validRoles: UserRole[] = ['Admin', 'Business', 'Influencer', 'User', 'Staff'];
      formData.role = validRoles.includes(formData.role as UserRole) ? (formData.role as UserRole) : 'User';
    }
    
    updateUserMutation.mutate(formData);
  };
  
  return {
    userData,
    formData,
    isLoading,
    error,
    isEditing,
    setIsEditing,
    handleChange,
    handleRoleChange,
    saveProfile,
    isSaving: savingStatus === 'saving',
    isSuccess: savingStatus === 'success',
    isError: savingStatus === 'error',
    refetch,
  };
};
