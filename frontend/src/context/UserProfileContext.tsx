import { createContext } from "react";
import { ProfileUser } from "../services/api";
import { BaseQueryFn, TypedMutationTrigger } from "@reduxjs/toolkit/query/react";

export interface UserProfileContextType {
  createUser: (userProfile: ProfileUser) => void;
  getUser: () => ProfileUser | undefined;
  updateUser: TypedMutationTrigger<ProfileUser, { id: string; user: ProfileUser }, BaseQueryFn>;
  isCreatingUser: boolean;
  isUpdatingUser: boolean;
}

export const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);
