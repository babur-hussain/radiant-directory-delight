
import { isServerRunning } from '@/api';

/**
 * Check for server connection before making API calls
 */
export const checkServerAvailability = async (): Promise<boolean> => {
  const serverAvailable = await isServerRunning();
  if (!serverAvailable) {
    console.log("Server is not available, using local MongoDB directly");
  }
  return serverAvailable;
};
