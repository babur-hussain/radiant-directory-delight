
/**
 * Utility to get the current environment
 */
export const getEnvironment = (): string => {
  // Check for environment variables
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }
  
  // Default to development
  return 'development';
};
