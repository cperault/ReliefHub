import request from "supertest";
import createApp, { AppDependencies } from "../../src/app";
import { AuthService } from "../../src/services/AuthService";
import { FirebaseService } from "../../src/services/FirebaseService";
import { UserService } from "../../src/services/UserService";

jest.mock("../../src/services/AuthService");
jest.mock("../../src/services/FirebaseService");
jest.mock("../../src/services/UserService");

describe("AuthController", () => {
  let firebaseService: jest.Mocked<FirebaseService>;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    process.env.JWT_SECRET_KEY = "test-secret-key";

    authService = {
      authenticateUser: jest.fn().mockResolvedValue({
        token: "mockToken",
      }),
      registerUser: jest.fn().mockResolvedValue({
        user: { id: "mockUserId", email: "test@example.com" },
      }),
      verifyToken: jest.fn().mockResolvedValue({ uid: "test-uid", email: "test@example.com" }),
    } as unknown as jest.Mocked<AuthService>;

    firebaseService = {
      getFirebaseAuth: jest.fn().mockReturnValue({}),
    } as unknown as jest.Mocked<FirebaseService>;

    userService = {} as jest.Mocked<UserService>;

    const appDependencies: AppDependencies = { authService, userService, firebaseService };
    app = createApp(appDependencies);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("should return 200 and set a session cookie on successful login", async () => {
      const mockToken = "mock-token";
      authService.authenticateUser.mockResolvedValue({ token: mockToken });
      authService.verifyToken.mockResolvedValue({ uid: "test-uid", email: "test@example.com" });

      const response = await request(app).post("/api/auth/login").send({ email: "user@example.com", password: "password123" });

      expect(authService.authenticateUser).toHaveBeenCalledWith("user@example.com", "password123");
      expect(authService.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(response.status).toBe(200);
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.body.message).toBe("Login successful");

      const cookie = response.headers["set-cookie"][0];
      expect(cookie).toContain("HttpOnly");
      expect(cookie).toContain("SameSite=Strict");
      expect(cookie).toContain("Max-Age=3600");
    });

    it("should return 400 when login fails due to invalid credentials", async () => {
      authService.authenticateUser.mockResolvedValue({
        error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" },
      });

      const response = await request(app).post("/api/auth/login").send({ email: "user@example.com", password: "wrong-password" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
      expect(response.body.error.message).toBe("Invalid credentials");
    });

    it("should return 400 when the token verification fails", async () => {
      authService.authenticateUser.mockResolvedValue({ token: "mock-token" });
      authService.verifyToken.mockResolvedValue(null);

      const response = await request(app).post("/api/auth/login").send({ email: "user@example.com", password: "password123" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid token");
    });

    it("should return 500 on unexpected errors", async () => {
      authService.authenticateUser.mockRejectedValue(new Error("Internal server error"));

      const response = await request(app).post("/api/auth/login").send({ email: "user@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Internal server error");
    });
  });

  describe("POST /api/auth/register", () => {
    it("should return 201 and set a session cookie on successful registration", async () => {
      const mockToken = "mock-registration-token";
      authService.registerUser.mockResolvedValue({ token: mockToken });
      authService.verifyToken.mockResolvedValue({ uid: "new-uid", email: "newuser@example.com" });

      const response = await request(app).post("/api/auth/register").send({ email: "newuser@example.com", password: "password123" });

      expect(authService.registerUser).toHaveBeenCalledWith("newuser@example.com", "password123");
      expect(authService.verifyToken).toHaveBeenCalledWith(mockToken);
      expect(response.status).toBe(201);
      expect(response.headers["set-cookie"]).toBeDefined();
      expect(response.body.message).toBe("Registration successful");
    });

    it("should return 400 when registration fails", async () => {
      authService.registerUser.mockResolvedValue({
        error: { code: "WEAK_PASSWORD", message: "Weak password" },
      });

      const response = await request(app).post("/api/auth/register").send({ email: "newuser@example.com", password: "123" });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("WEAK_PASSWORD");
      expect(response.body.error.message).toBe("Weak password");
    });

    it("should return 500 on unexpected errors during registration", async () => {
      authService.registerUser.mockRejectedValue(new Error("Database connection error"));

      const response = await request(app).post("/api/auth/register").send({ email: "newuser@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database connection error");
    });
  });
});
