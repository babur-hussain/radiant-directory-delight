
import { useState, useEffect } from 'react';
import { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to fetch a user profile by ID
 */
export const useUserProfile = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          const formattedUser: User = {
            uid: data.id,
            email: data.email,
            displayName: data.name,
            name: data.name,
            photoURL: data.photo_url,
            isAdmin: data.is_admin || false,
            role: data.role || 'User',
            employeeCode: data.employee_code,
            createdAt: data.created_at,
            lastLogin: data.last_login,
            phone: data.phone,
            instagramHandle: data.instagram_handle,
            facebookHandle: data.facebook_handle,
            verified: data.verified,
            city: data.city,
            country: data.country,
            niche: data.niche,
            followersCount: data.followers_count,
            bio: data.bio,
            businessName: data.business_name,
            ownerName: data.owner_name,
            businessCategory: data.business_category,
            website: data.website,
            gstNumber: data.gst_number,
            subscription: data.subscription,
            subscriptionId: data.subscription_id,
            subscriptionStatus: data.subscription_status,
            subscriptionPackage: data.subscription_package,
            customDashboardSections: data.custom_dashboard_sections
          };
          
          setUser(formattedUser);
        } else {
          setUser(null);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return {
    user,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        
        if (data) {
          const formattedUser: User = {
            uid: data.id,
            email: data.email,
            displayName: data.name,
            name: data.name,
            photoURL: data.photo_url,
            isAdmin: data.is_admin || false,
            role: data.role || 'User',
            employeeCode: data.employee_code,
            createdAt: data.created_at,
            lastLogin: data.last_login,
            phone: data.phone,
            instagramHandle: data.instagram_handle,
            facebookHandle: data.facebook_handle,
            verified: data.verified,
            city: data.city,
            country: data.country,
            niche: data.niche,
            followersCount: data.followers_count,
            bio: data.bio,
            businessName: data.business_name,
            ownerName: data.owner_name,
            businessCategory: data.business_category,
            website: data.website,
            gstNumber: data.gst_number,
            subscription: data.subscription,
            subscriptionId: data.subscription_id,
            subscriptionStatus: data.subscription_status,
            subscriptionPackage: data.subscription_package,
            customDashboardSections: data.custom_dashboard_sections
          };
          
          setUser(formattedUser);
        } else {
          setUser(null);
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }
  };
};

export default useUserProfile;
