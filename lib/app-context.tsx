'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User, Post, Club, Event, MembershipRequest, Notification,
  DEMO_USERS, DEMO_POSTS, DEMO_CLUBS, DEMO_EVENTS,
  DEMO_MEMBERSHIP_REQUESTS, DEMO_NOTIFICATIONS,
} from '@/lib/demo-data';

interface AppState {
  currentUser: User;
  users: User[];
  posts: Post[];
  clubs: Club[];
  events: Event[];
  membershipRequests: MembershipRequest[];
  notifications: Notification[];
  registeredEventIds: string[];
  savedPostIds: string[];
}

interface AppActions {
  setCurrentUser: (user: User) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleFollowClub: (clubId: string) => void;
  requestJoinClub: (clubId: string, message?: string) => void;
  leaveClub: (clubId: string) => void;
  toggleRegisterEvent: (eventId: string) => void;
  addPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'savedBy' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  decideMembershipRequest: (requestId: string, decision: 'approved' | 'rejected') => void;
  updateCurrentUser: (updates: Partial<User>) => void;
}

const AppContext = createContext<{ state: AppState; actions: AppActions } | null>(null);

const STORAGE_KEY = 'koinelio_demo_state';

function loadState(): Partial<AppState> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return {};
    return JSON.parse(saved);
  } catch {
    return {};
  }
}

function saveState(state: Partial<AppState>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentUserId: state.currentUser?.id,
      registeredEventIds: state.registeredEventIds,
      savedPostIds: state.savedPostIds,
    }));
  } catch {
    // ignore
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = loadState();
    const savedUserId = (saved as { currentUserId?: string }).currentUserId;
    const currentUser = DEMO_USERS.find(u => u.id === savedUserId) ?? DEMO_USERS[0];
    return {
      currentUser,
      users: DEMO_USERS,
      posts: DEMO_POSTS,
      clubs: DEMO_CLUBS,
      events: DEMO_EVENTS,
      membershipRequests: DEMO_MEMBERSHIP_REQUESTS,
      notifications: DEMO_NOTIFICATIONS,
      registeredEventIds: (saved as { registeredEventIds?: string[] }).registeredEventIds ?? ['e1', 'e5'],
      savedPostIds: (saved as { savedPostIds?: string[] }).savedPostIds ?? ['p3', 'p8'],
    };
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const actions: AppActions = {
    setCurrentUser: useCallback((user: User) => {
      setState(s => ({ ...s, currentUser: user }));
    }, []),

    toggleLikePost: useCallback((postId: string) => {
      setState(s => ({
        ...s,
        posts: s.posts.map(p => {
          if (p.id !== postId) return p;
          const liked = p.likes.includes(s.currentUser.id);
          return {
            ...p,
            likes: liked
              ? p.likes.filter(id => id !== s.currentUser.id)
              : [...p.likes, s.currentUser.id],
          };
        }),
      }));
    }, []),

    addComment: useCallback((postId: string, content: string) => {
      setState(s => ({
        ...s,
        posts: s.posts.map(p => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: [...p.comments, {
              id: `cm_${Date.now()}`,
              authorId: s.currentUser.id,
              content,
              createdAt: new Date().toISOString(),
              likes: [],
            }],
          };
        }),
      }));
    }, []),

    toggleSavePost: useCallback((postId: string) => {
      setState(s => {
        const saved = s.savedPostIds.includes(postId);
        return {
          ...s,
          savedPostIds: saved
            ? s.savedPostIds.filter(id => id !== postId)
            : [...s.savedPostIds, postId],
          posts: s.posts.map(p => {
            if (p.id !== postId) return p;
            return {
              ...p,
              savedBy: saved
                ? p.savedBy.filter(id => id !== s.currentUser.id)
                : [...p.savedBy, s.currentUser.id],
            };
          }),
        };
      });
    }, []),

    toggleFollowClub: useCallback((clubId: string) => {
      setState(s => {
        const following = s.currentUser.clubMemberships.includes(clubId);
        const updatedUser = {
          ...s.currentUser,
          clubMemberships: following
            ? s.currentUser.clubMemberships.filter(id => id !== clubId)
            : [...s.currentUser.clubMemberships, clubId],
        };
        return {
          ...s,
          currentUser: updatedUser,
          users: s.users.map(u => u.id === s.currentUser.id ? updatedUser : u),
        };
      });
    }, []),

    requestJoinClub: useCallback((clubId: string, message?: string) => {
      setState(s => {
        const existing = s.membershipRequests.find(
          r => r.userId === s.currentUser.id && r.clubId === clubId
        );
        if (existing) return s;
        const newRequest: MembershipRequest = {
          id: `mr_${Date.now()}`,
          userId: s.currentUser.id,
          clubId,
          status: 'pending',
          requestedAt: new Date().toISOString(),
          message,
        };
        return { ...s, membershipRequests: [...s.membershipRequests, newRequest] };
      });
    }, []),

    leaveClub: useCallback((clubId: string) => {
      setState(s => {
        const updatedUser = {
          ...s.currentUser,
          clubMemberships: s.currentUser.clubMemberships.filter(id => id !== clubId),
          clubLeaderOf: s.currentUser.clubLeaderOf.filter(id => id !== clubId),
        };
        return {
          ...s,
          currentUser: updatedUser,
          users: s.users.map(u => u.id === s.currentUser.id ? updatedUser : u),
        };
      });
    }, []),

    toggleRegisterEvent: useCallback((eventId: string) => {
      setState(s => {
        const registered = s.registeredEventIds.includes(eventId);
        return {
          ...s,
          registeredEventIds: registered
            ? s.registeredEventIds.filter(id => id !== eventId)
            : [...s.registeredEventIds, eventId],
          events: s.events.map(e => {
            if (e.id !== eventId) return e;
            return {
              ...e,
              registeredCount: registered ? e.registeredCount - 1 : e.registeredCount + 1,
            };
          }),
        };
      });
    }, []),

    addPost: useCallback((postData) => {
      setState(s => {
        const newPost: Post = {
          ...postData,
          id: `p_${Date.now()}`,
          likes: [],
          comments: [],
          savedBy: [],
          createdAt: new Date().toISOString(),
        };
        return { ...s, posts: [newPost, ...s.posts] };
      });
    }, []),

    markNotificationRead: useCallback((id: string) => {
      setState(s => ({
        ...s,
        notifications: s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
      }));
    }, []),

    markAllNotificationsRead: useCallback(() => {
      setState(s => ({
        ...s,
        notifications: s.notifications.map(n => ({ ...n, isRead: true })),
      }));
    }, []),

    decideMembershipRequest: useCallback((requestId: string, decision: 'approved' | 'rejected') => {
      setState(s => ({
        ...s,
        membershipRequests: s.membershipRequests.map(r =>
          r.id === requestId
            ? { ...r, status: decision, decidedAt: new Date().toISOString() }
            : r
        ),
      }));
    }, []),

    updateCurrentUser: useCallback((updates: Partial<User>) => {
      setState(s => {
        const updatedUser = { ...s.currentUser, ...updates };
        return {
          ...s,
          currentUser: updatedUser,
          users: s.users.map(u => u.id === s.currentUser.id ? updatedUser : u),
        };
      });
    }, []),
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useCurrentUser() {
  return useApp().state.currentUser;
}

export function useUnreadNotificationCount() {
  const { state } = useApp();
  return state.notifications.filter(
    n => n.userId === state.currentUser.id && !n.isRead
  ).length;
}
