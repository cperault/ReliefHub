import { ReactNode } from "react";
import { UserProfileContext, UserProfileContextType } from "../context/UserProfileContext";
import { ProfileUser, useCreateUserMutation, useUpdateUserMutation } from "../services/api";

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [createUser, { isLoading: isCreatingUser }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();

  const getUser = () => {
    return {} as ProfileUser;
  };

  const value: UserProfileContextType = {
    createUser,
    getUser,
    updateUser,
    isCreatingUser,
    isUpdatingUser,
  };

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
};
