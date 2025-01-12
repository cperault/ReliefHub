import { signInWithEmailAndPassword, createUserWithEmailAndPassword, Auth } from "firebase/auth";
import { AuthService } from "../../src/services/AuthService";
import { FirebaseService } from "../../src/services/FirebaseService";

jest.mock("../../src/services/FirebaseService");
jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
}));

describe("AuthService", () => {
  let mockFirebaseService: jest.Mocked<FirebaseService>;
  let authService: AuthService;
  let mockAuth: Auth;

  beforeEach(() => {
    mockFirebaseService = {
      getFirebaseAuth: jest.fn(),
      getAdminAuth: jest.fn(),
    } as unknown as jest.Mocked<FirebaseService>;

    mockAuth = {
      currentUser: { getIdToken: jest.fn().mockResolvedValue("mockToken") },
    } as any;

    mockFirebaseService.getFirebaseAuth.mockReturnValue(mockAuth);

    authService = new AuthService(mockFirebaseService);
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

    it("should return a token on successful login", async () => {
      const mockUserCredential = {
        user: { getIdToken: jest.fn().mockResolvedValue("mockToken") },
      };
      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential as any);

      const result = await authService.authenticateUser("test@example.com", "password123");

      expect(result.token).toBe("mockToken");
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), "test@example.com", "password123");
    });

    it("should return an error if login fails", async () => {
      const mockError = new Error("Invalid credentials");
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.authenticateUser("test@example.com", "wrongpassword");

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("unknown_error");
      expect(result.error?.message).toBe("An unknown error occurred.");
    });

    it("should return an error when email or password is empty", async () => {
      const result = await authService.authenticateUser("", "");

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("unknown_error");
      expect(result.error?.message).toBe("An unknown error occurred.");
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

    it("should return a token on successful registration", async () => {
      const mockUserCredential = {
        user: { getIdToken: jest.fn().mockResolvedValue("mockToken") },
      };
      (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue(mockUserCredential as any);

      const result = await authService.registerUser("test@example.com", "password123");

      expect(result.token).toBe("mockToken");
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.any(Object), "test@example.com", "password123");
    });

    it("should return an error if registration fails", async () => {
      const mockError = new Error("User already exists");
      (createUserWithEmailAndPassword as jest.Mock).mockRejectedValue(mockError);

      const result = await authService.registerUser("test@example.com", "password123");

      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe("unknown_error");
      expect(result.error?.message).toBe("An unknown error occurred.");
    });
  });

  describe("handleAuthError", () => {
    it("should handle specific error format", () => {
      const mockError = { code: "auth/invalid-email", message: "Invalid email address" };
      const result = (authService as any).handleAuthError(mockError);

      expect(result.error).toEqual({
        code: "auth/invalid-email",
        message: "Invalid email address",
      });
    });

    it("should handle unknown errors", () => {
      const result = (authService as any).handleAuthError(new Error("Unknown error"));

      expect(result.error).toEqual({
        code: "unknown_error",
        message: "An unknown error occurred.",
      });
    });
  });
});
