
import { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

// Helper function to transform role string to UserRole type
export const transformRole = (role: string | null): UserRole => {
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

export const useSupabaseUsers = (initialFetch = true) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async (page = 1, limit = 100, searchTerm?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' });
      
      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,business_name.ilike.%${searchTerm}%`
        );
      }
      
      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
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
        
        setUsers(mappedUsers);
        setTotalCount(count || 0);
      } else {
        setUsers([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error('Error fetching users from Supabase:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch users on component mount if initialFetch is true
  useEffect(() => {
    if (initialFetch) {
      fetchUsers();
    }
  }, [fetchUsers, initialFetch]);

  return {
    users,
    isLoading,
    error,
    totalCount,
    fetchUsers,
    setUsers
  };
};

export default useSupabaseUsers;
