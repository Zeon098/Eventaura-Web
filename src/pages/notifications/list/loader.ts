/**
 * Loader for notifications page
 * Notifications use real-time subscriptions, no prefetching needed
 */
export const notificationsLoader = async () => {
  // Notifications are loaded via real-time subscriptions
  // No prefetching needed here
  return {
    timestamp: Date.now(),
  };
};
