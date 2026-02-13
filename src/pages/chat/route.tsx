import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../config/pathKeys';

/**
 * Chat page route configuration
 * 
 * Architecture:
 * - loader.ts: Contains custom hooks for real-time chat data
 *   - useChatRooms: Subscribes to user's chat rooms list
 *   - useChatRoomWithMessages: Subscribes to specific room and messages
 *   - useSendMessage: React Query mutation for sending messages
 * - ui.tsx: Pure UI component that consumes hooks from loader.ts
 * - route.tsx: Binds everything together with lazy loading
 */
export const chatListRoute: RouteObject = {
  path: pathKeys.chat,
  lazy: async () => {
    // Lazy load the UI component which internally uses the loader hooks
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};

export const chatRoomRoute: RouteObject = {
  path: pathKeys.chatRoom,
  lazy: async () => {
    // Same component handles both list and individual room views
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};
