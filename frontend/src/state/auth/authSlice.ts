import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api, AuthUser } from "../../services/api";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | undefined; // Includes `hasProfile` for initial auth flow
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (state, action: PayloadAction<AuthState>) => {
      state.isAuthenticated = action.payload.isAuthenticated;
      state.user = action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
        const { profile, ...authUser } = payload.user;
        state.isAuthenticated = authUser.emailVerified;
        state.user = {
          ...authUser,
          hasProfile: payload.user.hasProfile,
        };
      })
      .addMatcher(api.endpoints.validateSession.matchFulfilled, (state, { payload }) => {
        if (payload.valid && payload.user) {
          state.isAuthenticated = true;
          state.user = {
            ...payload.user,
            hasProfile: payload.user.hasProfile ?? false,
          };
        } else {
          state.isAuthenticated = false;
          state.user = undefined;
        }
      })
      .addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = undefined;
      });
  },
});

export const { setAuthState } = authSlice.actions;
export default authSlice.reducer;
