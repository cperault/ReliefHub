import request from "supertest";
import createApp, { AppDependencies } from "../../src/app";
import { AuthService } from "../../src/services/AuthService";
import { FirebaseService } from "../../src/services/FirebaseService";
import { UserNotFoundError, UserService } from "../../src/services/UserService";
import { AuthenticationError, BadRequestError, ConflictError, DatabaseError } from "../../src/middleware/APIError";

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
      verifyAuthToken: jest.fn(),
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

    (AuthService as jest.Mock).mockImplementation(() => authService);
    (UserService as jest.Mock).mockImplementation(() => userService);
    (FirebaseService as jest.Mock).mockImplementation(() => firebaseService);

    const appDependencies: AppDependencies = { firebaseService };
    app = createApp(appDependencies);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("should return 200 with user data and set a session cookie on successful login with a verified email", async () => {
      const mockToken = "mock-token";
      const mockUser = {
        uid: "test-uid",
        emailVerified: true,
        email: "test@example.com",
        metadata: {},
        isAnonymous: false,
        providerData: [],
        refreshToken: "",
        tenantId: null,
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
        displayName: null,
        phoneNumber: null,
        photoURL: null,
        providerId: "",
      };

      authService.authenticateUser.mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      const mockProfile = {
        uid: "test-uid",
        displayName: "Test User",
        type: "volunteer",
        email: "test@example.com",
        phoneNumber: "(123) 456-7890",
        hasProfile: true,
      };

      authService.verifyAuthToken.mockResolvedValue({ uid: "test-uid", email: "test@example.com" });
      userService.getUser.mockResolvedValue(mockProfile);

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

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
    });

    it("should indicate when user has no profile", async () => {
      const mockToken = "mock-token";
      const mockUser = {
        uid: "test-uid",
        emailVerified: true,
        email: "test@example.com",
        metadata: {},
        isAnonymous: false,
        providerData: [],
        refreshToken: "",
        tenantId: null,
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
        displayName: null,
        phoneNumber: null,
        photoURL: null,
        providerId: "",
      };

      authService.authenticateUser.mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      authService.verifyAuthToken.mockResolvedValue({ uid: "test-uid", email: "test@example.com" });

      const error = new UserNotFoundError("User not found");
      Object.defineProperty(error, "message", { value: "User not found" });
      userService.getUser.mockRejectedValue(error);

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

    it("should handle database errors when fetching profile data", async () => {
      const mockToken = "mock-token";
      const mockUser = {
        uid: "test-uid",
        emailVerified: true,
        email: "test@example.com",
        metadata: {},
        isAnonymous: false,
        providerData: [],
        refreshToken: "",
        tenantId: null,
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
        displayName: null,
        phoneNumber: null,
        photoURL: null,
        providerId: "",
      };

      authService.authenticateUser.mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      authService.verifyAuthToken.mockResolvedValue({ uid: "test-uid", email: "test@example.com" });
      userService.getUser.mockRejectedValue(new DatabaseError("Database error"));

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("DatabaseError");
      expect(response.body.message).toBe("Database error");
    });

    it("should return 403 for a login with an unverified email", async () => {
      const mockToken = "mock-token";
      const mockUser = {
        uid: "test-uid",
        emailVerified: false,
        email: "test@example.com",
        metadata: {},
        isAnonymous: false,
        providerData: [],
        refreshToken: "",
        tenantId: null,
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
        displayName: null,
        phoneNumber: null,
        photoURL: null,
        providerId: "",
      };

      authService.authenticateUser.mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      authService.verifyAuthToken.mockResolvedValue({ uid: "test-uid", email: "test@example.com" });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Email not verified. A new verification email has been sent.");
    });

    it("should return 401 when login fails due to invalid credentials", async () => {
      authService.authenticateUser.mockResolvedValue({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
      });

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrong-password" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("AuthenticationError");
      expect(response.body.message).toBe("Invalid credentials");
    });

    it("should return 422 and FormValidationErrorwhen email and password are missing", async () => {
      const response = await request(app).post("/api/auth/login").send({});

      expect(response.status).toBe(422);
      expect(response.body.error).toBe("FormValidationError");
      expect(response.body.message).toBe("Email and password are required");
    });

    it("should return 400 when token verification fails", async () => {
      const mockToken = "mock-token";
      authService.authenticateUser.mockResolvedValue({ token: mockToken });
      authService.verifyAuthToken.mockRejectedValue(new BadRequestError("Invalid token"));

      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("BadRequestError");
      expect(response.body.message).toBe("Invalid token");
    });
  });

  describe("POST /api/auth/register", () => {
    it("should return 201 on successful registration", async () => {
      const mockToken = "mock-token";
      const mockUser = {
        uid: "new-uid",
        emailVerified: false,
        email: "newuser@example.com",
        metadata: {},
        isAnonymous: false,
        providerData: [],
        refreshToken: "",
        tenantId: null,
        delete: jest.fn(),
        getIdToken: jest.fn(),
        getIdTokenResult: jest.fn(),
        reload: jest.fn(),
        toJSON: jest.fn(),
        displayName: null,
        phoneNumber: null,
        photoURL: null,
        providerId: "",
      };

      authService.registerUser.mockResolvedValue({ token: mockToken, user: mockUser });
      authService.verifyAuthToken.mockResolvedValue({ uid: "new-uid", email: "newuser@example.com" });

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "newuser@example.com", password: "password123" });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Registration successful and a verification email has been sent.");
    });

    it("should return 401 when registration fails due to weak password", async () => {
      authService.registerUser.mockResolvedValue({
        error: { code: "auth/weak-password", message: "Password should be at least 6 characters" },
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "newuser@example.com", password: "123" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("AuthenticationError");
      expect(response.body.message).toBe("Password should be at least 6 characters");
    });

    it("should return 409 when email is already in use", async () => {
      authService.registerUser.mockRejectedValue(new ConflictError("Email already in use"));

      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "existing@example.com", password: "password123" });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("ConflictError");
      expect(response.body.message).toBe("Email already in use");
    });

    it("should return 422 and FormValidationError when email and password are missing", async () => {
      const response = await request(app).post("/api/auth/register").send({});

      expect(response.status).toBe(422);
      expect(response.body.error).toBe("FormValidationError");
      expect(response.body.message).toBe("Email and password are required");
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

      const error = new UserNotFoundError("User not found");
      Object.defineProperty(error, "message", { value: "User not found" });
      userService.getUser.mockRejectedValue(error);

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
      expect(response.body.error).toBe("AuthenticationError");
      expect(response.body.message).toBe("No session cookie found");
    });

    it("should return 401 when session is invalid", async () => {
      authService.validateSession.mockRejectedValue(new AuthenticationError("Invalid session cookie"));

      const response = await request(app)
        .get("/api/auth/validate-session")
        .set("Cookie", ["sessionToken=invalid-token"]);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("AuthenticationError");
      expect(response.body.message).toBe("Invalid session cookie");
    });

    it("should return 500 when database error occurs during profile fetch", async () => {
      authService.validateSession.mockResolvedValue({
        valid: true,
        user: {
          uid: "test-uid",
          email: "test@example.com",
        },
      });

      userService.getUser.mockRejectedValue(new DatabaseError("Database error"));

      const response = await request(app).get("/api/auth/validate-session").set("Cookie", ["sessionToken=valid-token"]);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("DatabaseError");
      expect(response.body.message).toBe("Database error");
    });
  });
});
