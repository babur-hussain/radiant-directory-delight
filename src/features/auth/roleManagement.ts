
import { User, UserRole } from "@/types/auth";
import { getRoleKey, getAdminKey, syncUserData } from "./authStorage";
import { connectToMongoDB } from '@/config/mongodb';
import { createOrUpdateUser } from '@/api/services/userAPI';

export const updateUserRole = async (user: User) => {
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  let roleToAssign = user.role;
  
  try {
    // Special handling for default admin
    if (user.email === 'baburhussain660@gmail.com') {
      user.isAdmin = true;
      roleToAssign = 'Admin';
    }
    
    // Save to localStorage for fallback
    localStorage.setItem(getRoleKey(user.uid), roleToAssign as string);
    
    // Ensure MongoDB is connected
    const connected = await connectToMongoDB();
    
    if (connected) {
      // Try to update in MongoDB first through our API
      try {
        await createOrUpdateUser({
          uid: user.uid,
          role: roleToAssign,
          isAdmin: roleToAssign === 'Admin' || user.isAdmin,
          // Include other fields to ensure they don't get lost
          name: user.name || user.displayName,
          email: user.email,
          updatedAt: new Date()
        });
        
        console.log(`User role updated to ${roleToAssign} for uid ${user.uid}`);
        
        // Sync user data to ensure consistency
        await syncUserData(user.uid, { role: roleToAssign, isAdmin: roleToAssign === 'Admin' || user.isAdmin });
        
        return {
          ...user,
          role: roleToAssign,
          isAdmin: roleToAssign === 'Admin' || user.isAdmin
        };
      } catch (mongoError) {
        console.error("Error updating user role in MongoDB:", mongoError);
        // Fall back to localStorage update
      }
    }
    
    console.log("Falling back to localStorage-only update for role");
    
    // Update in localStorage all users list
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.uid === user.uid);
    
    if (userIndex >= 0) {
      allUsers[userIndex].role = roleToAssign;
      allUsers[userIndex].isAdmin = roleToAssign === 'Admin' || user.isAdmin;
      localStorage.setItem('all_users_data', JSON.stringify(allUsers));
    }
    
    return {
      ...user,
      role: roleToAssign,
      isAdmin: roleToAssign === 'Admin' || user.isAdmin
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    
    // Last resort fallback to ensure UI updates
    localStorage.setItem(getRoleKey(user.uid), roleToAssign as string);
    
    return {
      ...user,
      role: roleToAssign,
      isAdmin: roleToAssign === 'Admin' || user.isAdmin
    };
  }
};

export const updateUserPermission = async (userId: string, isAdmin: boolean) => {
  try {
    localStorage.setItem(getAdminKey(userId), isAdmin ? 'true' : 'false');
    
    // Update user admin status in MongoDB through API
    await createOrUpdateUser({
      uid: userId,
      isAdmin: isAdmin,
      updatedAt: new Date()
    });
    
    await syncUserData(userId, { isAdmin });
    
    return { userId, isAdmin };
  } catch (error) {
    console.error("Error updating user permission:", error);
    
    console.log("Falling back to localStorage-only update for permission");
    
    localStorage.setItem(getAdminKey(userId), isAdmin ? 'true' : 'false');
    
    const allUsers = JSON.parse(localStorage.getItem('all_users_data') || '[]');
    const userIndex = allUsers.findIndex((u: any) => u.uid === userId);
    
    if (userIndex >= 0) {
      allUsers[userIndex].isAdmin = isAdmin;
      localStorage.setItem('all_users_data', JSON.stringify(allUsers));
    }
    
    return { userId, isAdmin };
  }
};
