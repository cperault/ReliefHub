import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Address } from "../types";
import { ProfileType } from "../state/user/userSlice";

export interface AuthUser {
  uid: string;
  createdAt: string;
  email: string;
  emailVerified: boolean;
  hasProfile: boolean;
}

interface AuthResponse {
  user: AuthUser & { profile?: ProfileUser };
  message: string;
}

interface ValidateSessionResult {
  valid: boolean;
  user: AuthUser & { profile?: ProfileUser };
}

export interface ProfileUser {
  uid: string;
  displayName: string;
  email: string;
  phoneNumber: string;
  type: ProfileType;
  address?: Address;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:4000/api", credentials: "include" }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: "auth/login",
        method: "POST",
        body: body,
      }),
    }),
    register: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({
        url: "auth/register",
        method: "POST",
        body: body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),
    resetPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({
        url: "auth/reset-password",
        method: "POST",
        body: body,
      }),
    }),
    validateSession: builder.query<ValidateSessionResult, void>({
      query: () => ({
        url: "auth/validate-session",
        method: "GET",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }),
    }),
    getUser: builder.query<ProfileUser, { id: string }>({
      query: (body) => ({
        url: `user/${body.id}`,
        method: "GET",
      }),
    }),
    createUser: builder.mutation<ProfileUser, ProfileUser>({
      query: (body) => ({
        url: `user`,
        method: "POST",
        body: body,
      }),
    }),
    updateUser: builder.mutation<ProfileUser, { id: string; user: ProfileUser }>({
      query: (body) => ({
        url: `user/${body.id}`,
        method: "PUT",
        body: body,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useValidateSessionQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
} = api;
