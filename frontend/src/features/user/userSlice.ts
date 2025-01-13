import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";

interface UserState {
  user: {
    uid: string;
    email?: string;
    displayName?: string;
  };
}

const initialState: UserState = {
  user: {
    uid: "",
    email: undefined,
    displayName: undefined,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserState: (state, action: PayloadAction<UserState>) => {
      state.user = action.payload.user;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.user = payload.user;
    });
  },
});

export const { setUserState } = userSlice.actions;
export default userSlice.reducer;
