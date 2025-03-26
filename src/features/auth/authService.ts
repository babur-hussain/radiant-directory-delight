
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
  
  // Ensure user has the correct properties
  return {
    id: supabaseUser.id,
    uid: supabaseUser.id,
    email: supabaseUser.email || '',
    displayName: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
    photoURL: supabaseUser.user_metadata?.avatar_url || supabaseUser.user_metadata?.picture || '',
    role: defaultRole,
    isAdmin: defaultRole === 'admin',
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
      // For database users, we need to handle differently
      // Make sure to use properties that exist on the user object
      user = {
        ...user,
        email: supabaseUser.email || user.email,
        // Use conditional logic for metadata properties that may not exist
        displayName: user.name || user.displayName,
        name: user.name || user.displayName,
        photoURL: user.photo_url || user.photoURL,
        lastLogin: new Date().toISOString(),
        verified: Boolean(user.verified),
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
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
      if (session?.user) {
        const user = await syncSupabaseUser(session.user);
        return user;
      } else {
        console.warn(`${event} event but no user in session`);
        return null;
      }
    } else if (event === 'SIGNED_OUT' || event === 'PASSWORD_RECOVERY') {
      console.log(`${event} event`);
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
