/**
 * Loader for profile page
 * User data is loaded from auth context, no prefetching needed
 */
export const profileLoader = async () => {
  // Profile data comes from AuthContext
  // No prefetching needed here
  return {
    timestamp: Date.now(),
  };
};
