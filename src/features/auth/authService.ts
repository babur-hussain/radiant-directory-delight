
import { User as FirebaseUser } from 'firebase/auth';
import { User, IUser } from '../../models/User';

// Get user by Firebase UID from MongoDB
export const getUserByUid = async (uid: string): Promise<IUser | null> => {
  try {
    const user = await User.findOne({ uid });
    return user;
  } catch (error) {
    console.error('Error getting user by UID:', error);
    return null;
  }
};

// Create user in MongoDB if not exists
export const createUserIfNotExists = async (firebaseUser: FirebaseUser): Promise<IUser | null> => {
  try {
    // Check if user already exists
    let user = await User.findOne({ uid: firebaseUser.uid });
    
    // If user doesn't exist, create new user
    if (!user) {
      user = await User.create({
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(),
        lastLogin: new Date(),
        role: 'user', // Default role
        isAdmin: false, // Default admin status
      });
      console.log('New user created in MongoDB:', user);
    }
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

// Update user's last login timestamp
export const updateUserLoginTimestamp = async (uid: string): Promise<void> => {
  try {
    await User.updateOne(
      { uid },
      { $set: { lastLogin: new Date() } }
    );
  } catch (error) {
    console.error('Error updating user login timestamp:', error);
  }
};

// Get all users (admin function)
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    return [];
  }
};

// Update user role
export const updateUserRole = async (uid: string, role: string, isAdmin: boolean = false): Promise<IUser | null> => {
  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { $set: { role, isAdmin } },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error('Error updating user role:', error);
    return null;
  }
};
