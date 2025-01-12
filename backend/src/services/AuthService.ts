import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, Auth, signOut } from "firebase/auth";
import { Auth as AdminAuth } from "firebase-admin/auth";
import { Logger } from "../utils/Logger";
import { FirebaseService } from "./FirebaseService";

export type AuthResult = {
  token?: string;
  error?: {
    code: string;
    message: string;
  };
  user?: {
    uid: string;
    email: string;
  };
};

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

  private async handleAuthOperation(operation: () => Promise<any>): Promise<AuthResult> {
    try {
      const userCredential = await operation();
      const token = await userCredential.user.getIdToken();
      const { uid, email } = userCredential.user;

      return {
        token,
        user: { uid, email },
      };
    } catch (error: unknown) {
      return this.handleAuthError(error);
    }
  }

  private handleAuthError(error: unknown): AuthResult {
    if (typeof error === "object" && error !== null && "code" in error && "message" in error) {
      return {
        error: {
          code: (error as any).code,
          message: (error as any).message,
        },
      };
    }
    return {
      error: {
        code: "unknown_error",
        message: "An unknown error occurred.",
      },
    };
  }

  public async createSessionCookie(token: string): Promise<string> {
    try {
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
      return await this.adminAuth.createSessionCookie(token, { expiresIn });
    } catch (error) {
      this.logger.error(`Error creating session cookie: ${(error as Error).message}`);
      throw new Error("Error creating session cookie");
    }
  }

  public authenticateUser(email: string, password: string): Promise<AuthResult> {
    return this.handleAuthOperation(() => signInWithEmailAndPassword(this.auth, email, password));
  }

  public registerUser(email: string, password: string): Promise<AuthResult> {
    return this.handleAuthOperation(() => createUserWithEmailAndPassword(this.auth, email, password));
  }

  public resetPassword(email: string): Promise<AuthResult> {
    return this.handleAuthOperation(() => sendPasswordResetEmail(this.auth, email));
  }

  public async logout(): Promise<void> {
    try {
      await signOut(this.auth);
    } catch (error) {
      this.logger.error(`Error logging out: ${(error as Error).message}`);
    }
  }

  public async validateSession(sessionCookie: string): Promise<boolean | SessionValidationResult> {
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
      this.logger.error(`Error validating session: ${(error as Error).message}`);
      return false;
    }
  }

  public async verifyToken(authToken: string): Promise<TokenVerificationResult | null> {
    try {
      const decodedToken = await this.adminAuth.verifyIdToken(authToken);
      return { uid: decodedToken.uid, email: decodedToken.email };
    } catch (error) {
      this.logger.error(`Error verifying token: ${(error as Error).message}`);
      return null;
    }
  }
}
