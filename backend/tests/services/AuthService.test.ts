import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  Auth,
  sendEmailVerification,
  signOut,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { Auth as AdminAuth } from "firebase-admin/auth";
import { AuthService } from "../../src/services/AuthService";
import { FirebaseService } from "../../src/services/FirebaseService";
import {
  AuthenticationError,
  BadRequestError,
  ConflictError,
  FormValidationError,
  InternalServerError,
} from "../../src/middleware/APIError";

jest.mock("../../src/services/FirebaseService");
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
  signOut: jest.fn(),
}));

describe("AuthService", () => {
  let mockFirebaseService: jest.Mocked<FirebaseService>;
  let authService: AuthService;
  let mockAuth: Auth;
  let mockAdminAuth: AdminAuth;

  beforeEach(() => {
    mockAuth = {
      currentUser: { getIdToken: jest.fn().mockResolvedValue("mockToken") },
      signOut: jest.fn(),
    } as unknown as Auth;

    mockAdminAuth = {
      createSessionCookie: jest.fn(),
      verifySessionCookie: jest.fn(),
      verifyIdToken: jest.fn(),
    } as unknown as AdminAuth;

    mockFirebaseService = {
      getFirebaseAuth: jest.fn().mockReturnValue(mockAuth),
      getAdminAuth: jest.fn().mockReturnValue(mockAdminAuth),
    } as unknown as jest.Mocked<FirebaseService>;

    authService = new AuthService(mockFirebaseService);
  });

  describe("handleAuthError", () => {
    it("should throw AuthenticationError for wrong password", async () => {
      const mockError = { code: "auth/wrong-password", message: "Invalid password" };

      await expect(async () => {
        await (authService as any).handleAuthError(mockError);
      }).rejects.toThrow(AuthenticationError);
    });

    it("should throw AuthenticationError for invalid credentials", async () => {
      const mockError = { code: "auth/invalid-credential", message: "Invalid credentials" };

      await expect(async () => {
        await (authService as any).handleAuthError(mockError);
      }).rejects.toThrow(AuthenticationError);
    });

    it("should throw AuthenticationError for user not found", async () => {
      const mockError = { code: "auth/user-not-found", message: "User not found" };

      await expect(async () => {
        await (authService as any).handleAuthError(mockError);
      }).rejects.toThrow(AuthenticationError);
    });

    it("should throw FormValidationError for invalid email", async () => {
      const mockError = { code: "auth/invalid-email", message: "Invalid email" };

      await expect(async () => {
        await (authService as any).handleAuthError(mockError);
      }).rejects.toThrow(FormValidationError);
    });

    it("should throw FormValidationError for weak password", async () => {
      const mockError = { code: "auth/weak-password", message: "Weak password" };

      await expect(async () => {
        await (authService as any).handleAuthError(mockError);
      }).rejects.toThrow(FormValidationError);
    });

    it("should throw ConflictError for email in use", async () => {
      const mockError = { code: "auth/email-already-in-use", message: "Email in use" };

      await expect(async () => {
        await (authService as any).handleAuthError(mockError);
      }).rejects.toThrow(ConflictError);
    });

    it("should throw InternalServerError for unknown auth errors", async () => {
      const mockError = { code: "auth/unknown", message: "Unknown error" };

      await expect(async () => {
        await (authService as any).handleAuthError(mockError);
      }).rejects.toThrow(InternalServerError);
    });

    it("should throw InternalServerError for non-auth errors", async () => {
      await expect(async () => {
        await (authService as any).handleAuthError(new Error("Generic error"));
      }).rejects.toThrow(InternalServerError);
    });
  });

  describe("handleAuthOperation", () => {
    it("should handle login operation successfully", async () => {
      const mockUser = { getIdToken: jest.fn().mockResolvedValue("mockToken") };
      const mockOperation = jest.fn().mockResolvedValue({ user: mockUser });

      const result = await (authService as any).handleAuthOperation("login", mockOperation);

      expect(result).toEqual({
        token: "mockToken",
        user: mockUser,
      });
    });

    it("should handle register operation successfully", async () => {
      const mockUser = { getIdToken: jest.fn().mockResolvedValue("mockToken") };
      const mockOperation = jest.fn().mockResolvedValue({ user: mockUser });

      const result = await (authService as any).handleAuthOperation("register", mockOperation);

      expect(result).toEqual({
        token: "mockToken",
        user: mockUser,
      });
    });

    it("should handle auth errors by calling handleAuthError", async () => {
      const mockError = { code: "auth/wrong-password", message: "Invalid password" };
      const mockOperation = jest.fn().mockRejectedValue(mockError);

      await expect(async () => {
        await (authService as any).handleAuthOperation("login", mockOperation);
      }).rejects.toThrow(AuthenticationError);
    });

    it("should return void for non-login/register operations", async () => {
      const mockOperation = jest.fn().mockResolvedValue(undefined);

      const result = await (authService as any).handleAuthOperation("verifyEmail", mockOperation);

      expect(result).toBeUndefined();
    });
  });

  describe("createSessionCookie", () => {
    it("should create session cookie successfully", async () => {
      const mockCookie = "session-cookie-value";
      (mockAdminAuth.createSessionCookie as jest.Mock).mockResolvedValue(mockCookie);

      const result = await authService.createSessionCookie("valid-token");

      expect(result).toBe(mockCookie);
      expect(mockAdminAuth.createSessionCookie).toHaveBeenCalledWith("valid-token", { expiresIn: 432000000 });
    });

    it("should throw InternalServerError when cookie creation fails", async () => {
      (mockAdminAuth.createSessionCookie as jest.Mock).mockRejectedValue(new Error("Failed to create cookie"));

      await expect(async () => {
        await authService.createSessionCookie("valid-token");
      }).rejects.toThrow(InternalServerError);
    });
  });

  describe("validateSession", () => {
    it("should throw BadRequestError when session cookie is empty", async () => {
      await expect(authService.validateSession("")).rejects.toThrow(BadRequestError);
    });

    it("should validate session successfully", async () => {
      const mockDecodedClaims = { uid: "test-uid", email: "test@example.com" };
      (mockAdminAuth.verifySessionCookie as jest.Mock).mockResolvedValue(mockDecodedClaims);

      const result = await authService.validateSession("valid-cookie");

      expect(result).toEqual({
        valid: true,
        user: {
          uid: mockDecodedClaims.uid,
          email: mockDecodedClaims.email,
        },
      });
    });

    it("should throw AuthenticationError for invalid session", async () => {
      (mockAdminAuth.verifySessionCookie as jest.Mock).mockRejectedValue(new Error("Invalid session"));

      await expect(authService.validateSession("invalid-cookie")).rejects.toThrow(AuthenticationError);
    });
  });

  describe("verifyAuthToken", () => {
    it("should return token verification result for valid token", async () => {
      const mockDecodedToken = { uid: "test-uid", email: "test@example.com" };
      (mockAdminAuth.verifyIdToken as jest.Mock).mockResolvedValue(mockDecodedToken);

      const result = await authService.verifyAuthToken("valid-token");
      expect(result).toEqual({ uid: mockDecodedToken.uid, email: mockDecodedToken.email });
    });

    it("should throw AuthenticationError for invalid token", async () => {
      (mockAdminAuth.verifyIdToken as jest.Mock).mockRejectedValue(new Error("Invalid token"));

      await expect(async () => {
        await authService.verifyAuthToken("invalid-token");
      }).rejects.toThrow(AuthenticationError);
    });
  });

  describe("logout", () => {
    it("should sign out successfully", async () => {
      (signOut as jest.Mock).mockResolvedValue(undefined);

      await expect(authService.logout()).resolves.not.toThrow();
      expect(signOut).toHaveBeenCalled();
    });

    it("should throw InternalServerError when sign out fails", async () => {
      (signOut as jest.Mock).mockRejectedValue(new Error("Failed to sign out"));

      await expect(async () => {
        await authService.logout();
      }).rejects.toThrow(InternalServerError);
    });
  });

  describe("authenticateUser", () => {
    it("should call getFirebaseAuth when authenticateUser is called", async () => {
      const mockUserCredential = {
        user: { getIdToken: jest.fn().mockResolvedValue("mockToken") },
      };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential as any);

      await authService.authenticateUser("test@example.com", "password123");

      expect(mockFirebaseService.getFirebaseAuth).toHaveBeenCalled();
    });

    it("should authenticate user successfully, returning a token and user data", async () => {
      const mockUser = { getIdToken: jest.fn().mockResolvedValue("mockToken") };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

      const result = await authService.authenticateUser("test@example.com", "password");

      expect(result).toEqual({
        token: "mockToken",
        user: mockUser,
      });
    });

    it("should return FormValidationError when email or password is empty", async () => {
      await expect(async () => await authService.authenticateUser("", "")).rejects.toThrow(FormValidationError);

      await expect(async () => await authService.authenticateUser("email@test.com", "")).rejects.toThrow(
        FormValidationError
      );

      await expect(async () => await authService.authenticateUser("", "password")).rejects.toThrow(FormValidationError);
    });

    it("should throw AuthenticationError for invalid credentials", async () => {
      const mockError = { code: "auth/wrong-password", message: "Invalid credentials" };
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

      await expect(async () => {
        await authService.authenticateUser("test@example.com", "wrongpass");
      }).rejects.toThrow(AuthenticationError);
    });
  });

  describe("registerUser", () => {
    it("should call getFirebaseAuth when registerUser is called", async () => {
      const mockUserCredential = {
        user: { getIdToken: jest.fn().mockResolvedValue("mockToken") },
      };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential as any);

      await authService.registerUser("test@example.com", "password123");

      expect(mockFirebaseService.getFirebaseAuth).toHaveBeenCalled();
    });

    it("should register user successfully, returning a token and user data", async () => {
      const mockUser = { getIdToken: jest.fn().mockResolvedValue("mockToken") };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });

      const result = await authService.registerUser("test@example.com", "password");

      expect(result).toEqual({
        token: "mockToken",
        user: mockUser,
      });
    });

    it("should return an error if registration fails", async () => {
      const mockError = { code: "auth/email-already-in-use", message: "Email already in use" };
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

      await expect(async () => {
        await authService.registerUser("test@example.com", "wrongpassword");
      }).rejects.toThrow(ConflictError);
    });
  });

  describe("sendVerificationEmail", () => {
    it("should send verification email successfully", async () => {
      const mockUser = { email: "test@example.com" };
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

      await expect(authService.sendVerificationEmail(mockUser as any)).resolves.not.toThrow();
      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
    });

    it("should throw FormValidationError when sending verification email fails due to invalid email", async () => {
      const mockUser = { email: "test@example.com" };
      const mockError = { code: "auth/invalid-email", message: "Invalid email" };
      (sendEmailVerification as jest.Mock).mockRejectedValue(mockError);

      await expect(async () => {
        await authService.sendVerificationEmail(mockUser as any);
      }).rejects.toThrow(FormValidationError);
    });

    it("should throw BadRequestError when user is null", async () => {
      await expect(authService.sendVerificationEmail(null as unknown as User)).rejects.toThrow(BadRequestError);
    });
  });

  describe("resetPassword", () => {
    it("should send password reset email successfully", async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      await expect(authService.resetPassword("test@example.com")).resolves.not.toThrow();
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(expect.any(Object), "test@example.com");
    });

    it("should throw FormValidationError when email is empty", async () => {
      await expect(authService.resetPassword("")).rejects.toThrow(FormValidationError);
    });

    it("should throw error when sending reset password email fails", async () => {
      const mockError = { code: "auth/user-not-found", message: "User not found" };
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue(mockError);

      await expect(async () => {
        await authService.resetPassword("test@example.com");
      }).rejects.toThrow(AuthenticationError);
    });
  });
});
