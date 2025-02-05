import { createContext } from "react";
import { ProfileUser } from "../services/api";
import { BaseQueryFn, TypedMutationTrigger } from "@reduxjs/toolkit/query/react";

interface CreateUserResponse {
  message: string;
  user: ProfileUser;
}

export interface UserProfileContextType {
  createUser: TypedMutationTrigger<CreateUserResponse, { user: ProfileUser }, BaseQueryFn>;
  getUser: () => ProfileUser | undefined;
  updateUser: TypedMutationTrigger<ProfileUser, Partial<ProfileUser>, BaseQueryFn>;
  isCreatingUser: boolean;
  isUpdatingUser: boolean;
}

export const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);
