import { configureStore } from "@reduxjs/toolkit";
import { api } from "../services/api";
import authReducer from "./auth/authSlice";
import userReducer from "./user/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
