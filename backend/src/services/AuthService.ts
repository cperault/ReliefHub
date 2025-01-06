import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, Auth } from "firebase/auth";
import { firebaseApp } from "../config/firebaseConfig";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { Logger } from "../utils/Logger";

export type AuthResult = {
  token?: string;
  error?: {
    code: string;
    message: string;
  };
};

export type TokenVerificationResult = {
  uid: string;
  email?: string;
};

export class AuthService {
  private auth: Auth;
  private logger: Logger;

  constructor() {
    this.auth = getAuth(firebaseApp);
    this.logger = new Logger();
  }

  private async handleAuthOperation(operation: () => Promise<any>): Promise<AuthResult> {
    try {
      const userCredential = await operation();
      const token = await userCredential.user.getIdToken();
      return { token };
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

  public authenticateUser(email: string, password: string): Promise<AuthResult> {
    return this.handleAuthOperation(() => signInWithEmailAndPassword(this.auth, email, password));
  }

  public registerUser(email: string, password: string): Promise<AuthResult> {
    return this.handleAuthOperation(() => createUserWithEmailAndPassword(this.auth, email, password));
  }

  public async verifyToken(authToken: string): Promise<TokenVerificationResult | null> {
    try {
      const decodedToken = await getAdminAuth().verifyIdToken(authToken);
      return { uid: decodedToken.uid, email: decodedToken.email };
    } catch (error) {
      this.logger.error(`Error verifying token: ${(error as Error).message}`);
      return null;
    }
  }
}
