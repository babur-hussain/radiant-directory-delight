import { AuthChangeEvent, Session, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';
import { User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { fetchUserByUid } from '@/lib/supabase/userUtils';
import { normalizeRole } from '@/types/auth';

// Fix role capitalizations throughout the file
export const determineDefaultRole = (userData?: Record<string, any>): UserRole => {
  if (!userData) return 'user';

  // Check if this is a business account
  if (userData.businessName || userData.business_name) {
    return 'business';
  }

  // Check if this is an influencer account
  if (userData.followersCount || userData.followers_count || userData.niche) {
    return 'influencer';
  }

  // Default to regular user
  return 'user';
};

export const mapSupabaseUserToUser = (supabaseUser: SupabaseUser, initialRole?: UserRole): User => {
  const defaultRole = initialRole || 'user';

  return {
    id: supabaseUser.id,
    uid: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
    photoURL: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
    role: defaultRole,
    isAdmin: false,
    createdAt: new Date(supabaseUser.created_at).toISOString(),
    lastLogin: new Date(supabaseUser.last_sign_in_at || supabaseUser.created_at).toISOString(),
    userMetadata: supabaseUser.user_metadata,
    appMetadata: supabaseUser.app_metadata,
    verified: supabaseUser.email_confirmed_at !== null,
  };
};

export const syncSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  try {
    if (!supabaseUser) {
      console.warn("No Supabase user to sync");
      return null;
    }

    let user = await fetchUserByUid(supabaseUser.id);

    if (!user) {
      console.warn(`No user found in database with uid ${supabaseUser.id}, creating...`);
      const initialRole = determineDefaultRole(supabaseUser.user_metadata);
      user = mapSupabaseUserToUser(supabaseUser, initialRole);
    } else {
      // Update existing user with latest data from Supabase
      user = {
        ...user,
        email: supabaseUser.email || user.email,
        displayName: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || user.displayName,
        name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || user.name,
        photoURL: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || user.photoURL,
        lastLogin: new Date(supabaseUser.last_sign_in_at || new Date().toISOString()).toISOString(),
        userMetadata: supabaseUser.user_metadata,
        appMetadata: supabaseUser.app_metadata,
        verified: supabaseUser.email_confirmed_at !== null,
      };
    }

    return user;
  } catch (error) {
    console.error("Error syncing Supabase user:", error);
    return null;
  }
};

export const handleAuthStateChange = async (
  event: AuthChangeEvent,
  session: Session | null,
  supabaseClient: SupabaseClient
): Promise<User | null> => {
  try {
    if (event === 'SIGNED_IN') {
      if (session?.user) {
        const user = await syncSupabaseUser(session.user);
        return user;
      } else {
        console.warn("SIGNED_IN event but no user in session");
        return null;
      }
    } else if (event === 'INITIAL_SESSION') {
      if (session?.user) {
        const user = await syncSupabaseUser(session.user);
        return user;
      } else {
        console.warn("INITIAL_SESSION event but no user in session");
        return null;
      }
    } else if (event === 'USER_UPDATED') {
      if (session?.user) {
        const user = await syncSupabaseUser(session.user);
        return user;
      } else {
        console.warn("USER_UPDATED event but no user in session");
        return null;
      }
    } else if (event === 'SIGNED_OUT') {
      console.log("SIGNED_OUT event");
      return null;
    } else if (event === 'PASSWORD_RECOVERY') {
      console.log("PASSWORD_RECOVERY event");
      return null;
    } else if (event === 'MFA_CHALLENGE') {
      console.log("MFA_CHALLENGE event");
      return null;
    } else {
      console.warn("Unhandled AuthChangeEvent:", event);
      return null;
    }
  } catch (error) {
    console.error("Error handling auth state change:", error);
    return null;
  }
};

export const updateUserRole = async (userId: string, role: UserRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ role: role })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

export const updateUserAdminStatus = async (userId: string, isAdmin: boolean): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user admin status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user admin status:', error);
    return false;
  }
};

export const fetchAllUsers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    if (!data) {
      console.warn('No users found in the database.');
      return [];
    }

    return data.map(user => ({
      id: user.id,
      uid: user.id,
      email: user.email || '',
      displayName: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
      role: normalizeRole(user.role),
      isAdmin: user.is_admin || false,
      createdAt: new Date(user.created_at).toISOString(),
      lastLogin: new Date(user.last_sign_in_at || user.created_at).toISOString(),
      userMetadata: user.user_metadata,
      appMetadata: user.app_metadata,
      verified: user.email_confirmed_at !== null,
    }));
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};
