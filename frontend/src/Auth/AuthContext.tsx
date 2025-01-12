import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../app/store";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation, useLogoutMutation, useRegisterMutation, useResetPasswordMutation, useValidateSessionQuery } from "../services/api";
import { setAuthState } from "../features/auth/authSlice";
import { toast } from "react-toastify";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isLoggingOut: boolean;
  isValidatingSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [resetPassword] = useResetPasswordMutation();
  const { data: validateSessionData, isLoading: isValidatingSession } = useValidateSessionQuery();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (validateSessionData) {
      if (validateSessionData?.valid) {
        dispatch(setAuthState({ isAuthenticated: true, user: validateSessionData.user }));
      } else {
        dispatch(setAuthState({ isAuthenticated: false, user: undefined }));
      }
    }
  }, [validateSessionData, dispatch]);

  const errorMessages: { [key: string]: string } = {
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
    // TOOO: add more Firebase error codes as necessary
  };

  const getErrorMessage = (errorCode: string): string => {
    return errorMessages[errorCode] || "An unknown error occurred. Please try again.";
  };

  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      const { user } = await login({ email, password }).unwrap();
      dispatch(setAuthState({ isAuthenticated: true, user }));
      navigate("/map");
    } catch (error) {
      const errorMessage = getErrorMessage((error as { code: string }).code);
      toast.error(errorMessage);
      console.error("Login failed:", error);
    }
  };

  const handleRegister = async (email: string, password: string): Promise<void> => {
    try {
      const { user } = await register({ email, password }).unwrap();
      dispatch(setAuthState({ isAuthenticated: true, user }));
      navigate("/sign-in");
    } catch (error) {
      const errorMessage = getErrorMessage((error as { code: string }).code);
      toast.error(errorMessage);
      console.error("Register failed:", error);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout().unwrap();
      dispatch(setAuthState({ isAuthenticated: false, user: undefined }));
      navigate("/sign-in");
    } catch (error) {
      const errorMessage = getErrorMessage((error as { code: string }).code);
      toast.error(errorMessage);
      console.error("Logout failed:", error);
    }
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    try {
      await resetPassword({ email }).unwrap();
      dispatch(setAuthState({ isAuthenticated: false, user: undefined }));
      navigate("/sign-in");
    } catch (error) {
      const errorMessage = getErrorMessage((error as { code: string }).code);
      toast.error(errorMessage);
      console.error("Reset password failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        resetPassword: handleResetPassword,
        isLoggingIn,
        isRegistering,
        isLoggingOut,
        isValidatingSession,
      }}
    >
      {!isValidatingSession && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
