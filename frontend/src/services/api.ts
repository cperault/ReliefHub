import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface User {
  uid: string;
  email?: string;
}

interface AuthResponse {
  user: User;
  message: string;
}

interface ValidateSessionResult {
  valid: boolean;
  user: User;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:4000/api", credentials: "include" }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (credentials) => ({
        url: "auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),
    resetPassword: builder.mutation<void, { email: string }>({
      query: (credentials) => ({
        url: "auth/reset-password",
        method: "POST",
        body: credentials,
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
