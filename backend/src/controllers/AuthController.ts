import { Request, Response } from "express";
import { AuthResult, AuthService } from "../services/AuthService";
import { User } from "firebase/auth";
import { UserNotFoundError, UserService } from "../services/UserService";
import { DocumentData } from "firebase/firestore";
import { AuthenticationError, FormValidationError } from "../middleware/APIError";
import { APIError } from "../middleware/APIError";

export interface SafeUserResponse {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  createdAt: string | null;
}

export class AuthController {
  private authService: AuthService;
  private userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    this.authService = authService;
    this.userService = userService;
  }

  private sanitizeUserData(user: User): SafeUserResponse {
    return {
      uid: user.uid,
      email: user.email || null,
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime || null,
    };
  }

  private handleAuthResponse = async (res: Response, result: AuthResult, successStatusCode: number): Promise<void> => {
    // login and register both return a token and user object; nothing else should be calling this handler
    if (!result?.token) {
      throw new AuthenticationError(result?.error?.message || "Authentication failed");
    }

    const tokenVerificationResult = await this.authService.verifyAuthToken(result.token);

    if (!tokenVerificationResult) {
      throw new AuthenticationError("Invalid token");
    }

    const isRegistration = successStatusCode === 201;

    // handle unverified email cases
    if (!result.user?.emailVerified) {
      res.clearCookie("sessionToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        sameSite: "strict",
      });

      const statusCode = isRegistration ? successStatusCode : 403;
      const message = isRegistration
        ? "Registration successful and a verification email has been sent."
        : "Email not verified. A new verification email has been sent.";

      if (result.user) {
        await this.authService.sendVerificationEmail(result.user);
      }

      res.status(statusCode).json({ user: result.user ? this.sanitizeUserData(result.user) : undefined, message });
      return;
    }

    // create a session cookie for verified users logging in
    if (!isRegistration) {
      const sessionCookie = await this.authService.createSessionCookie(result.token);
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

      res.cookie("sessionToken", sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        sameSite: "strict",
        maxAge: expiresIn,
      });
    }

    let userProfileResult: DocumentData | null = null;
    let hasProfile = false;

    try {
      userProfileResult = await this.userService.getUser(result.user.uid);
      hasProfile = true;
    } catch (error) {
      if (!(error instanceof UserNotFoundError)) {
        throw error;
      }
    }

    const sanitizedUser = this.sanitizeUserData(result.user);
    const userResponse: SafeUserResponse & { hasProfile: boolean } = {
      ...sanitizedUser,
      hasProfile: hasProfile,
      ...(userProfileResult && { profile: userProfileResult }),
    };

    res.status(successStatusCode).json({
      user: userResponse,
      message: `${isRegistration ? "Registration" : "Login"} successful`,
    });
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const errors: Record<string, string> = {};

        if (!email) errors.email = "Email is required";
        if (!password) errors.password = "Password is required";

        throw new FormValidationError(errors, "Email and password are required");
      }

      const result = await this.authService.authenticateUser(email, password);

      await this.handleAuthResponse(res, result, 200);
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  };

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const errors: Record<string, string> = {};

        if (!email) errors.email = "Email is required";
        if (!password) errors.password = "Password is required";

        throw new FormValidationError(errors, "Email and password are required");
      }

      const result = await this.authService.registerUser(email, password);

      await this.handleAuthResponse(res, result, 201);
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  };

  public logout = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.logout();

      res.clearCookie("sessionToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "prod",
        sameSite: "strict",
      });

      res.status(204).end();
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  };

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new FormValidationError({ email: "Email is required" }, "Email is required");
      }

      await this.authService.resetPassword(email);

      res.status(202).end();
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  };

  public validateSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const sessionCookie = req.cookies.sessionToken;

      if (!sessionCookie) {
        throw new AuthenticationError("No session cookie found");
      }

      const validateSessionResult = await this.authService.validateSession(sessionCookie);

      if (typeof validateSessionResult !== "object" || !validateSessionResult.valid) {
        throw new AuthenticationError("Invalid session cookie");
      }

      let userProfileResult = null;
      let hasProfile = false;

      try {
        userProfileResult = await this.userService.getUser(validateSessionResult.user.uid);
        hasProfile = true;
      } catch (error) {
        if (!(error instanceof UserNotFoundError)) {
          throw error;
        }
      }

      res.status(200).json({
        valid: true,
        user: {
          ...validateSessionResult.user,
          hasProfile,
          ...(userProfileResult && { profile: userProfileResult }),
        },
      });
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  };
}
