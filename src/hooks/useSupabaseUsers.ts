
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, normalizeRole } from '@/types/auth';

const useSupabaseUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' });

      if (error) {
        throw new Error(error.message);
      }

      if (count !== null) {
        setTotalCount(count);
      }

      // Transform the data to match our User interface
      const formattedUsers: User[] = (data || []).map((user: any) => ({
        id: user.id,
        uid: user.uid,
        email: user.email,
        name: user.name || user.displayName || 'Unnamed User',
        photoURL: user.photoURL || user.photo_url || '',
        isAdmin: user.isAdmin || user.is_admin || false,
        role: normalizeRole(user.role),
        createdAt: user.createdAt || user.created_at || '',
        lastLogin: user.lastLogin || user.last_login || '',
        phone: user.phone || '',
        instagramHandle: user.instagramHandle || user.instagram_handle || '',
        facebookHandle: user.facebookHandle || user.facebook_handle || '',
        verified: user.verified || false,
        city: user.city || '',
        country: user.country || '',
        website: user.website || '',
        employeeCode: user.employeeCode || user.employee_code || '',
        niche: user.niche || '',
        followersCount: user.followersCount || user.followers_count || '',
        bio: user.bio || '',
        businessName: user.businessName || user.business_name || '',
        ownerName: user.ownerName || user.owner_name || '',
        businessCategory: user.businessCategory || user.business_category || '',
        gstNumber: user.gstNumber || user.gst_number || '',
        subscription: user.subscription || '',
        subscriptionId: user.subscriptionId || user.subscription_id || '',
        subscriptionStatus: user.subscriptionStatus || user.subscription_status || '',
        subscriptionPackage: user.subscriptionPackage || user.subscription_package || '',
        customDashboardSections: user.customDashboardSections || user.custom_dashboard_sections || [],
        fullName: user.fullName || '',
        userMetadata: user.userMetadata || {},
        appMetadata: user.appMetadata || {}
      }));

      setUsers(formattedUsers);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to fetch users'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, isLoading, error, totalCount, fetchUsers };
};

export default useSupabaseUsers;
