import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface AuthUser {
  uid: string;
  createdAt: string;
  email: string;
  emailVerified: boolean;
}

interface AuthResponse {
  user: AuthUser;
  message: string;
}

interface ValidateSessionResult {
  valid: boolean;
  user: AuthUser;
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
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useResetPasswordMutation, useValidateSessionQuery } = api;
