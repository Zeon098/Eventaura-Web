/**
 * Loader for chat list page
 * Chat uses real-time subscriptions, no prefetching needed
 */
export const chatListLoader = async () => {
  // Chat rooms are loaded via real-time subscriptions
  // No prefetching needed here
  return {
    timestamp: Date.now(),
  };
};
