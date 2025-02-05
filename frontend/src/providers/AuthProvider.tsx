import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useValidateSessionQuery,
} from "../services/api";
import { setAuthState } from "../state/auth/authSlice";
import { toast } from "react-toastify";
import { AuthContext, AuthContextType } from "../context/AuthContext";
import { AppDispatch, RootState } from "../state/store";

type FirebaseAuthError = {
  status: number;
  data: {
    error: string;
    code: string;
    errors?: Record<string, string>;
  };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [resetPassword, { isLoading: isResettingPassword }] = useResetPasswordMutation();
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

  const errorMessages: Record<string, string> = {
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
    "auth/email-already-in-use": "Email already in use. Please try a different email.",
    // TODO: Add more Firebase error codes as necessary
  };

  const getErrorMessage = (error: unknown): string => {
    const firebaseError = error as FirebaseAuthError;
    const errorCode = firebaseError?.data?.code;

    if (errorCode) {
      return errorMessages[errorCode] || firebaseError.data.error;
    }

    return "An unknown error occurred. Please try again.";
  };

  const handleLogin = async (email: string, password: string): Promise<void> => {
    try {
      const result = await login({ email, password }).unwrap();

      if (result.user.hasProfile) {
        navigate("/map");
      }
    } catch (error) {
      // catch email not verified
      if ((error as FirebaseAuthError)?.status === 403) {
        const rejectedResponse = (error as any)?.data;
        toast.error(rejectedResponse?.message);

        return;
      }

      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleRegister = async (email: string, password: string): Promise<void> => {
    try {
      await register({ email, password }).unwrap();
      toast.success("Registration successful and a verification email has been sent.");
      navigate("/sign-in");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout().unwrap();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = async (email: string): Promise<void> => {
    try {
      await resetPassword({ email }).unwrap();
      toast.success("Password reset email sent!");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    resetPassword: handleResetPassword,
    isLoggingIn,
    isRegistering,
    isLoggingOut,
    isValidatingSession,
    isResettingPassword,
  };

  return <AuthContext.Provider value={value}>{!isValidatingSession && children}</AuthContext.Provider>;
};
