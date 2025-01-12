import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";

interface AuthState {
  isAuthenticated: boolean;
  user?: {
    uid: string;
    email?: string;
  };
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
      .addMatcher(api.endpoints.validateSession.matchFulfilled, (state, { payload }) => {
        state.isAuthenticated = payload.valid;
        state.user = payload.user;
      })
      .addMatcher(api.endpoints.logout.matchFulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = undefined;
      });
  },
});

export const { setAuthState } = authSlice.actions;
export default authSlice.reducer;
