import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  Auth,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";
import { Auth as AdminAuth } from "firebase-admin/auth";
import { FirebaseService } from "../Firebase/FirebaseService";
import { Logger } from "../../utils/Logger";
import { AuthErrorType, AuthServiceError, AuthenticationError, ValidationError, ConflictError } from "./auth-types";

export type AuthResult = {
  token?: string;
  error?: {
    code: string;
    message: string;
  };
  user?: User;
} | void;

export type TokenVerificationResult = {
  uid: string;
  email?: string;
};

export type SessionValidationResult = {
  valid: boolean;
  user: {
    uid: string;
    email: string;
  };
};

export class AuthService {
  private auth: Auth;
  private adminAuth: AdminAuth;
  private logger: Logger;

  constructor(firebaseService: FirebaseService) {
    this.auth = firebaseService.getFirebaseAuth();
    this.adminAuth = firebaseService.getAdminAuth();
    this.logger = Logger.getInstance();
  }

  private handleAuthError = (
    error: unknown,
    operation: string,
    ErrorClass: AuthErrorType = AuthServiceError
  ): never => {
    if (error && typeof error === "object" && "code" in error) {
      this.logger.error(`Firebase Auth error during ${operation}:`, error);

      const authError = error as { code: string; message: string };

      switch (authError.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          throw new ErrorClass("Invalid email or password");
        case "auth/invalid-email":
          throw new ValidationError("Invalid email format", "VALIDATION_ERROR", { email: "Invalid email format" });
        case "auth/email-already-in-use":
          throw new ErrorClass("Email already in use");
        case "auth/weak-password":
          throw new ValidationError("Password is too weak", "VALIDATION_ERROR", { password: "Password is too weak" });
        case "auth/invalid-credential":
          throw new ErrorClass("Invalid credentials");
        case "auth/too-many-requests":
          throw new AuthenticationError("Too many requests, please try again later");
        default:
          throw new ErrorClass(process.env.NODE_ENV === "dev" ? authError.message : "An authentication error occurred");
      }
    }

    throw new AuthServiceError((error as Error).message);
  };

  private handleAuthOperation = async (
    operationName: string,
    operation: () => Promise<UserCredential | void>
  ): Promise<AuthResult> => {
    try {
      const result = await operation();

      if (operationName === "login" || operationName === "register") {
        const token = await result?.user.getIdToken();
        const user = result?.user;

        return {
          token,
          user,
        };
      }

      // For operations that don't return a UserCredential (like sendEmailVerification)
      if (operationName === "verifyEmail") {
        return;
      }

      // For other operations that might return a user
      return {
        user: result?.user,
      };
    } catch (error: unknown) {
      throw this.handleAuthError(error, operationName, AuthServiceError);
    }
  };

  public createSessionCookie = async (token: string): Promise<string> => {
    try {
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

      return await this.adminAuth.createSessionCookie(token, { expiresIn });
    } catch (error) {
      throw new AuthServiceError("Error creating session cookie");
    }
  };

  public validateSession = async (sessionCookie: string): Promise<SessionValidationResult> => {
    try {
      const decodedClaims = await this.adminAuth.verifySessionCookie(sessionCookie, false);

      return {
        valid: true,
        user: {
          uid: decodedClaims.uid,
          email: decodedClaims.email ?? "",
        },
      };
    } catch (error) {
      throw new AuthenticationError("Invalid or expired session");
    }
  };

  public verifyAuthToken = async (authToken: string): Promise<TokenVerificationResult> => {
    try {
      const decodedToken = await this.adminAuth.verifyIdToken(authToken);
      return { uid: decodedToken.uid, email: decodedToken.email };
    } catch (error) {
      throw new AuthenticationError("Invalid or expired token");
    }
  };

  public logout = async (): Promise<void> => {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw new AuthServiceError("Error logging out");
    }
  };

  public authenticateUser = async (email: string, password: string): Promise<AuthResult> => {
    return await this.handleAuthOperation(
      "login",
      async () => await signInWithEmailAndPassword(this.auth, email, password)
    );
  };

  public registerUser = async (email: string, password: string): Promise<AuthResult> => {
    return await this.handleAuthOperation(
      "register",
      async () => await createUserWithEmailAndPassword(this.auth, email, password)
    );
  };

  public sendVerificationEmail = async (user: User): Promise<AuthResult> => {
    return await this.handleAuthOperation("verifyEmail", async () => await sendEmailVerification(user));
  };

  public resetPassword = async (email: string): Promise<AuthResult> => {
    return await this.handleAuthOperation("reset", async () => await sendPasswordResetEmail(this.auth, email));
  };
}
