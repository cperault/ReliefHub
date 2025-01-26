import request from "supertest";
import createApp, { AppDependencies } from "../../src/app";
import { AuthService } from "../../src/services/AuthService";
import { FirebaseService } from "../../src/services/FirebaseService";
import { UserNotFoundError, UserService } from "../../src/services/UserService";

jest.mock("../../src/services/FirebaseService");
jest.mock("../../src/services/AuthService");
jest.mock("../../src/services/UserService");

describe("AuthController", () => {
  let app: ReturnType<typeof createApp>;
  let firebaseService: jest.Mocked<FirebaseService>;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    authService = {
      authenticateUser: jest.fn(),
      registerUser: jest.fn(),
      verifyToken: jest.fn(),
      createSessionCookie: jest.fn(),
      sendVerificationEmail: jest.fn(),
      validateSession: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    userService = {
      createUser: jest.fn(),
      getUser: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    firebaseService = {
      getFirebaseAuth: jest.fn(),
      getFirestore: jest.fn(),
    } as unknown as jest.Mocked<FirebaseService>;

    (AuthService as jest.Mock) = jest.fn().mockImplementation(() => authService);
    (UserService as jest.Mock) = jest.fn().mockImplementation(() => userService);
    (FirebaseService as jest.Mock) = jest.fn().mockImplementation(() => firebaseService);

    const appDependencies: AppDependencies = { firebaseService };
    app = createApp(appDependencies);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("should return 200 with user data and set a session cookie on successful login with a verified email", async () => {
      const mockToken = "mock-token";
      authService.authenticateUser.mockResolvedValue({
        token: mockToken,
        user: {
          uid: "test-uid",
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: "",
          tenantId: null,
          delete: jest.fn(),
          getIdToken: jest.fn(),
          getIdTokenResult: jest.fn(),
          reload: jest.fn(),
          toJSON: jest.fn(),
          displayName: null,
          email: "test@example.com",
          phoneNumber: null,
          photoURL: null,
          providerId: "",
        },
      });

      const mockProfile = {
        uid: "test-uid",
        displayName: "Test User",
        type: "volunteer",
        email: "test@example.com",
        phoneNumber: "(123) 456-7890",
        hasProfile: true,
      };

      authService.verifyToken.mockResolvedValue({ uid: "test-uid", email: "test@example.com" });
      userService.getUser.mockResolvedValue(mockProfile);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "password123" });

      expect(authService.authenticateUser).toHaveBeenCalledWith("user@example.com", "password123");
      expect(authService.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(response.status).toBe(200);
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.body.user).toEqual({
        uid: "test-uid",
        email: "test@example.com",
        emailVerified: true,
        createdAt: null,
        hasProfile: true,
        profile: mockProfile,
      });
      expect(response.body.message).toBe("Login successful");

      const cookie = response.headers["set-cookie"][0];
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Strict");
      expect(cookie).toContain("Max-Age=432000");
    });

    it("should indicate when user has no profile", async () => {
      const mockToken = "mock-token";

      authService.authenticateUser.mockResolvedValue({
        token: mockToken,
        user: {
          uid: "test-uid",
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: "",
          tenantId: null,
          delete: jest.fn(),
          getIdToken: jest.fn(),
          getIdTokenResult: jest.fn(),
          reload: jest.fn(),
          toJSON: jest.fn(),
          displayName: null,
          email: "test@example.com",
          phoneNumber: null,
          photoURL: null,
          providerId: "",
        },
      });

      authService.verifyToken.mockResolvedValue({ uid: "test-uid", email: "test@example.com" });
      userService.getUser.mockRejectedValue(new UserNotFoundError("User not found"));

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        uid: "test-uid",
        email: "test@example.com",
        emailVerified: true,
        createdAt: null,
        hasProfile: false,
      });
      expect(response.body.user.profile).toBeUndefined();
    });

    it("should handle errors when fetching profile data", async () => {
      const mockToken = "mock-token";

      authService.authenticateUser.mockResolvedValue({
        token: mockToken,
        user: {
          uid: "test-uid",
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: "",
          tenantId: null,
          delete: jest.fn(),
          getIdToken: jest.fn(),
          getIdTokenResult: jest.fn(),
          reload: jest.fn(),
          toJSON: jest.fn(),
          displayName: null,
          email: "test@example.com",
          phoneNumber: null,
          photoURL: null,
          providerId: "",
        },
      });
      authService.verifyToken.mockResolvedValue({ uid: "test-uid", email: "test@example.com" });
      userService.getUser.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Internal server error while processing authentication");
    });

    it("should return 403 for a login with an unverified email", async () => {
      const mockToken = "mock-token";
      authService.authenticateUser.mockResolvedValue({
        token: mockToken,
        user: {
          uid: "test-uid",
          emailVerified: false,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: "",
          tenantId: null,
          delete: jest.fn(),
          getIdToken: jest.fn(),
          getIdTokenResult: jest.fn(),
          reload: jest.fn(),
          toJSON: jest.fn(),
          displayName: null,
          email: "test@example.com",
          phoneNumber: null,
          photoURL: null,
          providerId: "",
        },
      });
      authService.verifyToken.mockResolvedValue({ uid: "test-uid", email: "test@example.com" });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(authService.authenticateUser).toHaveBeenCalledWith("test@example.com", "password123");
      expect(authService.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Email not verified. A new verification email has been sent.");
    });

    it("should return 400 when login fails due to invalid credentials", async () => {
      authService.authenticateUser.mockResolvedValue({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "wrong-password" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
      expect(response.body.error.message).toBe("Invalid credentials");
    });

    it("should return 400 when the token verification fails", async () => {
      authService.authenticateUser.mockResolvedValue({ token: "mock-token" });
      authService.verifyToken.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid token");
    });

    it("should return 500 on unexpected errors", async () => {
      authService.authenticateUser.mockRejectedValue(new Error("Internal server error"));

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "user@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Internal server error");
    });
  });

  describe("POST /api/auth/register", () => {
    it("should return 201 on a successful registration", async () => {
      const mockToken = "mock-registration-token";
      authService.registerUser.mockResolvedValue({ token: mockToken });
      authService.verifyToken.mockResolvedValue({ uid: "new-uid", email: "newuser@example.com" });

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "newuser@example.com", password: "password123" });

      expect(authService.registerUser).toHaveBeenCalledWith("newuser@example.com", "password123");
      expect(authService.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Registration successful and a verification email has been sent.");
    });

    it("should return 400 when registration fails", async () => {
      authService.registerUser.mockResolvedValue({
        error: { code: "WEAK_PASSWORD", message: "Weak password" },
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "newuser@example.com", password: "123" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("WEAK_PASSWORD");
      expect(response.body.error.message).toBe("Weak password");
    });

    it("should return 500 on unexpected errors during registration", async () => {
      authService.registerUser.mockRejectedValue(new Error("Database connection error"));

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "newuser@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database connection error");
    });
  });

  describe("GET /api/auth/validate-session", () => {
    it("should return valid session with profile data when user has profile", async () => {
      const mockProfile = {
        uid: "test-uid",
        displayName: "Test User",
        type: "volunteer",
        email: "test@example.com",
        phoneNumber: "(123) 456-7890",
      };

      authService.validateSession.mockResolvedValue({
        valid: true,
        user: {
          uid: "test-uid",
          email: "test@example.com",
        },
      });

      userService.getUser.mockResolvedValue(mockProfile);

      const response = await request(app).get("/api/auth/validate-session").set("Cookie", ["sessionToken=valid-token"]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        valid: true,
        user: {
          uid: "test-uid",
          email: "test@example.com",
          hasProfile: true,
          profile: mockProfile,
        },
      });
    });

    it("should return valid session without profile data when user has no profile", async () => {
      authService.validateSession.mockResolvedValue({
        valid: true,
        user: {
          uid: "test-uid",
          email: "test@example.com",
        },
      });

      userService.getUser.mockRejectedValue(new UserNotFoundError("User not found"));

      const response = await request(app).get("/api/auth/validate-session").set("Cookie", ["sessionToken=valid-token"]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        valid: true,
        user: {
          uid: "test-uid",
          email: "test@example.com",
          hasProfile: false,
        },
      });
    });

    it("should return 401 when no session cookie is present", async () => {
      const response = await request(app).get("/api/auth/validate-session");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "No session cookie found" });
    });

    it("should return 401 when session is invalid", async () => {
      authService.validateSession.mockResolvedValue(false);

      const response = await request(app)
        .get("/api/auth/validate-session")
        .set("Cookie", ["sessionToken=invalid-token"]);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid session cookie" });
    });
  });
});
