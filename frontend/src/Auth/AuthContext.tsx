import { createContext } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  isValidatingSession: boolean;
  isResettingPassword: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
