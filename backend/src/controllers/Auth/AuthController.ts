import { Request, Response } from "express";
import { Logger } from "../../utils/Logger";
import { User } from "firebase/auth";
import { AuthResult, AuthService } from "../../services/Auth/AuthService";
import { UserService } from "../../services/User/UserService";
import { AuthenticationError, AuthServiceError, ConflictError, ValidationError } from "../../services/Auth/auth-types";
import { UserNotFoundError, UserServiceError } from "../../services/User/user-types";

interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  createdAt: string | null;
  hasProfile?: boolean;
  profile?: any;
}

export class AuthController {
  private authService: AuthService;
  private userService: UserService;
  private logger: Logger;

  private static readonly COOKIE_OPTIONS = {
    maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
  };

  constructor(authService: AuthService, userService: UserService) {
    this.authService = authService;
    this.userService = userService;
    this.logger = Logger.getInstance();
  }

  private handleErrorResponse = (error: unknown, res: Response): void => {
    if (error instanceof AuthServiceError) {
      res.status(error.status).json({
        message: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { errors: error.errors }),
      });
    } else {
      res.status(500).json({
        message: "Internal server error",
        code: "UNKNOWN_ERROR",
      });
    }
  };

  private sanitizeUser = (user: User | { uid: string; email: string | null }): AuthUser => {
    return {
      uid: user.uid,
      email: user.email,
      emailVerified: "emailVerified" in user ? user.emailVerified : false,
      createdAt: "metadata" in user && user.metadata?.creationTime ? user.metadata.creationTime : null,
    };
  };

  private validateCredentials = (email?: string, password?: string): void => {
    if (!email || !password) {
      const errors: Record<string, string> = {};

      if (!email) errors.email = "Email is required";
      if (!password) errors.password = "Password is required";

      throw new ValidationError("Email and password are required", "FormValidationError", errors);
    }
  };

  private sendVerificationEmail = async (user: User): Promise<void> => {
    try {
      if (!user || !user.email) {
        throw new ValidationError("User email is required", "FormValidationError", { email: "User email is required" });
      }

      await this.authService.sendVerificationEmail(user);
    } catch (error: any) {
      throw new AuthServiceError("Error sending verification email");
    }
  };

  private setSessionCookie = async (res: Response, token: string): Promise<void> => {
    try {
      if (!token || token.trim() === "") {
        throw new ValidationError("Auth token is required", "FormValidationError", {
          authToken: "Auth token is required",
        });
      }

      await this.authService.verifyAuthToken(token);

      const sessionCookie = await this.authService.createSessionCookie(token);
      res.cookie("session", sessionCookie, AuthController.COOKIE_OPTIONS);
    } catch (error) {
      throw new AuthenticationError("Invalid token");
    }
  };

  private createAuthResponse = (
    user: AuthUser,
    isRegistration: boolean = false
  ): { message: string; user: AuthUser } => {
    return {
      message: isRegistration ? "Registration successful and a verification email has been sent." : "Login successful",
      user,
    };
  };

  private handleAuthOperation = async (
    operation: () => Promise<AuthResult>,
    res: Response,
    isRegistration: boolean = false
  ): Promise<void> => {
    try {
      const result = await operation();

      if (result?.error) {
        // Pass through specific error messages from Firebase
        if (result.error.code === "auth/weak-password") {
          throw new AuthenticationError("Password should be at least 8 characters");
        } else if (result.error.code === "auth/email-already-in-use") {
          throw new ConflictError("Email already in use");
        } else if (result.error.code === "auth/invalid-email") {
          throw new ValidationError("Invalid email format", "FormValidationError", { email: "Invalid email format" });
        } else if (result.error.code === "auth/user-disabled") {
          throw new AuthenticationError("Account has been disabled");
        } else if (result.error.code === "auth/user-not-found" || result.error.code === "auth/wrong-password") {
          throw new AuthenticationError("Invalid credentials");
        }

        throw new AuthenticationError(result.error.message || "Invalid credentials");
      }

      if (!result?.user) {
        throw new AuthenticationError("Invalid credentials");
      }

      const user = this.sanitizeUser(result.user);

      if (!user.emailVerified) {
        await this.sendVerificationEmail(result.user);

        if (!isRegistration) {
          res.status(403).json({
            message: "Email not verified. A new verification email has been sent.",
            user,
          });
          return;
        }
      }

      if (result.token) {
        try {
          await this.setSessionCookie(res, result.token);
        } catch (error) {
          this.handleErrorResponse(error, res);
        }
      }

      const statusCode = isRegistration ? 201 : 200;
      const response = this.createAuthResponse(user, isRegistration);

      if (!isRegistration) {
        try {
          user.profile = await this.userService.getUser(user.uid);
          user.hasProfile = true;
        } catch (error) {
          if (error instanceof UserNotFoundError) {
            user.hasProfile = false;
            throw error;
          }

          throw new AuthServiceError("Failed to fetch user profile");
        }
      }

      res.status(statusCode).json(response);
    } catch (error) {
      this.handleErrorResponse(error, res);
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      this.validateCredentials(email, password);

      await this.handleAuthOperation(() => this.authService.authenticateUser(email, password), res);
    } catch (error: unknown) {
      this.handleErrorResponse(error, res);
    }
  };

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      this.validateCredentials(email, password);

      await this.handleAuthOperation(() => this.authService.registerUser(email, password), res, true);
    } catch (error: unknown) {
      this.handleErrorResponse(error, res);
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.logout();

      res.clearCookie("session", AuthController.COOKIE_OPTIONS);

      res.status(204).end();
    } catch (error: unknown) {
      this.handleErrorResponse(error, res);
    }
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new ValidationError("Email is required", "FormValidationError", { email: "Email is required" });
      }

      await this.authService.resetPassword(email);
      res.status(202).end();
    } catch (error: unknown) {
      this.handleErrorResponse(error, res);
    }
  };

  public validateSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionCookie = req.cookies.session;

      if (!sessionCookie) {
        throw new AuthenticationError("No session cookie found");
      }

      const validateSessionResult = await this.authService.validateSession(sessionCookie);

      if (!validateSessionResult?.valid) {
        throw new AuthenticationError("Invalid session cookie");
      }

      const user = this.sanitizeUser(validateSessionResult.user);

      try {
        user.profile = await this.userService.getUser(user.uid);
        user.hasProfile = true;
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          user.hasProfile = false;
        } else {
          throw new AuthServiceError("Failed to fetch user profile");
        }
      }

      res.status(200).json({ valid: true, user });
    } catch (error: unknown) {
      this.handleErrorResponse(error, res);
    }
  };
}
