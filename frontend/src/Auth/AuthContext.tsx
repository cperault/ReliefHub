import { createContext, useState, useEffect, useContext } from "react";
import { Auth, getAuth, onAuthStateChanged } from "firebase/auth";

type UserAddress = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
};

export type UserProfileType = "volunteer" | "affected";

type User = {
  emailAddress: string;
  displayName: string;
  phoneNumber: string;
  userAddress?: UserAddress;
};

type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { ReactNode } from "react";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    const auth: Auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const mappedUser: User = {
          emailAddress: user.email || "",
          displayName: user.displayName || "",
          phoneNumber: user.phoneNumber || "",
        };
        setCurrentUser(mappedUser);
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
