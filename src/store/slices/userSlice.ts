import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AppUser } from '../../types/user.types';
import type { RootState } from '../store';

interface UserState {
  data: AppUser | null;
  loading: boolean;
}

const initialState: UserState = {
  data: null,
  loading: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    /** Replace the entire user object (called on sign-in / auth-state change) */
    setUser(state, action: PayloadAction<AppUser | null>) {
      state.data = action.payload;
      state.loading = false;
    },
    /** Merge partial updates into the current user (called on profile edits) */
    updateUser(state, action: PayloadAction<Partial<AppUser>>) {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    /** Reset to initial state (called on sign-out) */
    clearUser(state) {
      state.data = null;
      state.loading = false;
    },
    /** Set the loading flag independently */
    setUserLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setUser, updateUser, clearUser, setUserLoading } = userSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.user.data;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectIsProvider = (state: RootState) => state.user.data?.isProvider ?? false;
export const selectUserRole = (state: RootState) => state.user.data?.role ?? 'user';

export default userSlice.reducer;
