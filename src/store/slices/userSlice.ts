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
    setUser(state, action: PayloadAction<AppUser | null>) {
      state.data = action.payload;
      state.loading = false;
    },
    updateUser(state, action: PayloadAction<Partial<AppUser>>) {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    clearUser(state) {
      state.data = null;
      state.loading = false;
    },
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
