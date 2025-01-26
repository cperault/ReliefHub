import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../services/api";
import { ProfileUser } from "../../services/api";
import { AddressType, State } from "../../types";

export enum ProfileType {
  VOLUNTEER = "volunteer",
  AFFECTED = "affected",
  ADMIN = "admin",
}

/**
 * Initial state for user slice
 * Note: address is optional in the type definition because volunteer profiles don't have addresses,
 * but it is required for affected user profiles. We include it in initial state to handle both cases.
 */
const initialState: ProfileUser & { hasProfile: boolean } = {
  uid: "",
  displayName: "",
  email: "",
  phoneNumber: "",
  type: "" as ProfileType,
  address: {
    type: AddressType.DROPOFF,
    street: "",
    city: "",
    state: "" as State,
    zip: "",
    position: {
      latitude: 0,
      longitude: 0,
    },
  },
  hasProfile: false, // `hasProfile` in user slice represents the existence of profile data in Firestore
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserState: (_state, action: PayloadAction<ProfileUser & { hasProfile: boolean }>) => {
      return action.payload;
    },
    clearUserState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(api.endpoints.login.matchFulfilled, (_state, { payload }) => {
        if (payload.user.hasProfile && payload.user.profile) {
          return {
            ...payload.user.profile,
            hasProfile: true,
          };
        }
        // For users without profiles (like new registrations/first time login after email verification or if they delete their profile (not the same as account deletion))
        return {
          ...initialState,
          uid: payload.user.uid,
          email: payload.user.email,
          hasProfile: false,
        };
      })
      .addMatcher(api.endpoints.validateSession.matchFulfilled, (_state, { payload }) => {
        console.log("validateSession payload:", payload);
        if (payload.valid && payload.user) {
          if (payload.user.profile) {
            console.log("Setting profile data:", payload.user.profile);
            return {
              ...payload.user.profile,
              hasProfile: true,
            };
          }
          console.log("No profile data in payload");
          return {
            ...initialState,
            uid: payload.user.uid,
            email: payload.user.email,
            hasProfile: false,
          };
        }
        return initialState;
      })
      .addMatcher(api.endpoints.logout.matchFulfilled, () => initialState);
  },
});

export const { setUserState } = userSlice.actions;
export default userSlice.reducer;
