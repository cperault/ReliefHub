import { useContext } from "react";
import { UserProfileContext, UserProfileContextType } from "../context/UserProfileContext";

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);

  if (!context) {
    throw new Error("useUserProfile must be used within a UserProfileProvider");
  }

  return context;
};
