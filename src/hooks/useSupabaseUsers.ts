import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

interface UseSupabaseUsersReturn {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  totalCount: number;
}

const useSupabaseUsers = (): UseSupabaseUsersReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' });
        
      if (error) throw error;
      
      const formattedUsers: User[] = (data || []).map(user => ({
        id: user.id,
        uid: user.id,
        email: user.email || '',
        displayName: user.name || '',
        name: user.name || '',
        role: normalizeRole(user.role),
        isAdmin: user.is_admin || false,
        photoURL: user.photo_url || '',
        createdAt: user.created_at || '',
        lastLogin: user.last_login || '',
        phone: user.phone || '',
        instagramHandle: user.instagram_handle || '',
        facebookHandle: user.facebook_handle || '',
        verified: user.verified || false,
        city: user.city || '',
        country: user.country || '',
        niche: user.niche || '',
        followersCount: user.followers_count || '',
        bio: user.bio || '',
        businessName: user.business_name || '',
        ownerName: user.owner_name || '',
        businessCategory: user.business_category || '',
        website: user.website || '',
        gstNumber: user.gst_number || '',
        employeeCode: user.employee_code || '',
        subscription: user.subscription || null,
        subscriptionId: user.subscription_id || null,
        subscriptionStatus: user.subscription_status || null,
        subscriptionPackage: user.subscription_package || null,
        customDashboardSections: user.custom_dashboard_sections || null
      }));
      
      setUsers(formattedUsers);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, fetchUsers, totalCount };
};

export default useSupabaseUsers;
