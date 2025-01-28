import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  Auth,
  signOut,
  User,
} from "firebase/auth";
import { Auth as AdminAuth } from "firebase-admin/auth";
import { FirebaseService } from "./FirebaseService";
import {
  AuthenticationError,
  BadRequestError,
  ConflictError,
  FormValidationError,
  InternalServerError,
} from "../middleware/APIError";

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

  constructor(firebaseService: FirebaseService) {
    this.auth = firebaseService.getFirebaseAuth();
    this.adminAuth = firebaseService.getAdminAuth();
  }

  private handleAuthError(error: unknown): never {
    if (error && typeof error === "object" && "code" in error) {
      const authError = error as { code: string; message: string };
      switch (authError.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          throw new AuthenticationError("Invalid email or password");
        case "auth/invalid-email":
          throw new FormValidationError({ email: "Invalid email format" }, "Invalid email format");
        case "auth/email-already-in-use":
          throw new ConflictError("Email already in use");
        case "auth/weak-password":
          throw new FormValidationError({ password: "Password is too weak" }, "Password is too weak");
        case "auth/invalid-credential":
          throw new AuthenticationError("Invalid credentials");
        default:
          throw new InternalServerError(
            process.env.NODE_ENV === "dev" ? authError.message : "An authentication error occurred"
          );
      }
    }
    throw new InternalServerError("An unknown error occurred");
  }

  private async handleAuthOperation(operationName: string, operation: () => Promise<any>): Promise<AuthResult> {
    try {
      const userCredential = await operation();

      if (operationName === "login" || operationName === "register") {
        const token = await userCredential.user.getIdToken();

        const user = userCredential.user;

        return {
          token,
          user,
        };
      }
    } catch (error: unknown) {
      return this.handleAuthError(error);
    }
  }

  public async createSessionCookie(token: string): Promise<string> {
    try {
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      return await this.adminAuth.createSessionCookie(token, { expiresIn });
    } catch (error) {
      throw new InternalServerError("Error creating session cookie");
    }
  }

  public async validateSession(sessionCookie: string): Promise<SessionValidationResult> {
    if (!sessionCookie) {
      throw new BadRequestError("Session cookie is required");
    }

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
  }

  public async verifyAuthToken(authToken: string): Promise<TokenVerificationResult> {
    if (!authToken) {
      throw new BadRequestError("Auth token is required");
    }

    try {
      const decodedToken = await this.adminAuth.verifyIdToken(authToken);
      return { uid: decodedToken.uid, email: decodedToken.email };
    } catch (error) {
      throw new AuthenticationError("Invalid or expired token");
    }
  }

  public async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      throw new InternalServerError("Error logging out");
    }
  }

  public async authenticateUser(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      const errors: Record<string, string> = {};

      if (!email) errors.email = "Email is required";
      if (!password) errors.password = "Password is required";

      throw new FormValidationError(errors, "Email and password are required");
    }

    return await this.handleAuthOperation(
      "login",
      async () => await signInWithEmailAndPassword(this.auth, email, password)
    );
  }

  public async registerUser(email: string, password: string): Promise<AuthResult> {
    if (!email || !password) {
      const errors: Record<string, string> = {};

      if (!email) errors.email = "Email is required";
      if (!password) errors.password = "Password is required";

      throw new FormValidationError(errors, "Email and password are required");
    }

    return await this.handleAuthOperation(
      "register",
      async () => await createUserWithEmailAndPassword(this.auth, email, password)
    );
  }

  public async sendVerificationEmail(user: User): Promise<AuthResult> {
    if (!user) {
      throw new BadRequestError("User is required");
    }

    return await this.handleAuthOperation("verifyEmail", async () => await sendEmailVerification(user));
  }

  public async resetPassword(email: string): Promise<AuthResult> {
    if (!email) {
      throw new FormValidationError({ email: "Email is required" }, "Email is required");
    }

    return await this.handleAuthOperation("reset", async () => await sendPasswordResetEmail(this.auth, email));
  }
}
