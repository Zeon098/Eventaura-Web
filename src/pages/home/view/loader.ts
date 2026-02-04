/**
 * Loader for home page
 * Prefetches initial data for the home page
 */
export const homeLoader = async () => {
  // Home page data can be prefetched here if needed
  return {
    timestamp: Date.now(),
  };
};
