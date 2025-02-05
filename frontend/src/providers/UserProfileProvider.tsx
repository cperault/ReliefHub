import { ReactNode } from "react";
import { useCreateUserMutation, useUpdateUserMutation, ProfileUser } from "@/services/api";
import { UserProfileContext, UserProfileContextType } from "@/context/UserProfileContext";

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
