import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

interface AuthResult {
  token: string;
  user: {
    uid: string;
    email: string;
  };
}
interface ValidateSessionResult extends AuthResult {
  valid: boolean;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "https://localhost:4000/api", credentials: "include" }),
  endpoints: (builder) => ({
    login: builder.mutation<AuthResult, { email: string; password: string }>({
      query: (credentials) => ({
        url: "auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResult, { email: string; password: string }>({
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
    resetPassword: builder.mutation<any, { email: string }>({
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
