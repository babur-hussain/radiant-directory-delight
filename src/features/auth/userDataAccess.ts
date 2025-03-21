
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { transformRole } from "./userManagement";

// Get all users with pagination
export const getAllUsers = async (
  page = 1,
  limit = 10,
  searchTerm?: string,
): Promise<{
  users: User[];
  count: number;
}> => {
  try {
    let query = supabase.from("users").select("*", { count: "exact" });

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
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("Error fetching users:", error);
      return { users: [], count: 0 };
    }

    const users: User[] = data.map((userData) => ({
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
      gstNumber: userData.gst_number || ""
    }));

    return { users, count: count || 0 };
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return { users: [], count: 0 };
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching user by ID:", error);
      return null;
    }

    return {
      uid: data.id,
      id: data.id,
      email: data.email || "",
      displayName: data.name || "",
      name: data.name || "",
      role: transformRole(data.role),
      isAdmin: data.is_admin || false,
      photoURL: data.photo_url || "",
      employeeCode: data.employee_code || "",
      createdAt: data.created_at || new Date().toISOString(),
      lastLogin: data.last_login || null,
      phone: data.phone || "",
      instagramHandle: data.instagram_handle || "",
      facebookHandle: data.facebook_handle || "",
      verified: data.verified || false,
      city: data.city || "",
      country: data.country || "",
      niche: data.niche || "",
      followersCount: data.followers_count || "",
      bio: data.bio || "",
      businessName: data.business_name || "",
      ownerName: data.owner_name || "",
      businessCategory: data.business_category || "",
      website: data.website || "",
      gstNumber: data.gst_number || ""
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};
