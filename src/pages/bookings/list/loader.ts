/**
 * Loader for bookings list page
 * Note: Bookings use real-time subscriptions, so prefetching is not needed
 * This loader just validates authentication state
 */
export const bookingsListLoader = async () => {
  // Bookings are loaded via real-time subscriptions in the component
  // No prefetching needed here
  return {
    timestamp: Date.now(),
  };
};
