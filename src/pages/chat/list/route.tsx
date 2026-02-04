import type { RouteObject } from 'react-router-dom';
import { pathKeys } from '../../../config/pathKeys';

export const chatListRoute: RouteObject = {
  path: pathKeys.chat,
  lazy: async () => {
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};

export const chatRoomRoute: RouteObject = {
  path: pathKeys.chatRoom,
  lazy: async () => {
    const Component = await import('./ui').then((module) => module.default);
    return { Component };
  },
};
