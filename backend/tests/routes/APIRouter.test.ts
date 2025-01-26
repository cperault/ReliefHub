import request from "supertest";
import { Response } from "express";
import createApp, { AppDependencies } from "../../src/app";
import { FirebaseService } from "../../src/services/FirebaseService";
import { AuthenticateSession } from "../../src/middleware/AuthenticateSession";

jest.mock("../../src/controllers/AuthController", () => {
  return {
    AuthController: jest.fn().mockImplementation(() => ({
      login: (req: Request, res: Response) => res.status(200).json({ message: "Login successful" }),
      register: (req: Request, res: Response) => res.status(201).json({ message: "Registration successful" }),
      logout: (req: Request, res: Response) => res.status(204).end(),
      resetPassword: (req: Request, res: Response) => res.status(202).end(),
      validateSession: (req: Request, res: Response) =>
        res.status(200).json({ valid: true, user: { uid: "test-uid", email: "email@example.com" } }),
    })),
  };
});

jest.mock("../../src/controllers/UserController", () => {
  return {
    UserController: jest.fn().mockImplementation(() => ({
      createUser: (req: Request, res: Response) => res.status(201).json({ message: "User created successfully" }),
      getAllUsers: (req: Request, res: Response) =>
        res.status(200).json({
          users: [
            { id: "test-uid", email: "fake-email-1@example.com" },
            { id: "test-uid-2", email: "fake-email-2@example.com" },
            { id: "test-uid-3", email: "fake-email-3@example.com" },
            { id: "test-uid-4", email: "fake-email-4@example.com" },
          ],
        }),
      getUserById: (req: Request, res: Response) =>
        res.status(200).json({ userData: { id: "test-uid", email: "fake-email-1@example.com" } }),
      updateUser: (req: Request, res: Response) => res.status(200).json({ message: "User updated successfully" }),
      deleteUser: (req: Request, res: Response) => res.status(200).json({ message: "User deleted successfully" }),
    })),
  };
});

jest.mock("../../src/services/AuthService", () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock("../../src/services/UserService", () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock("../../src/middleware/AuthenticateSession");

describe("APIRouter", () => {
  let firebaseService: jest.Mocked<FirebaseService>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    firebaseService = {
      getFirebaseAuth: jest.fn(),
    } as unknown as jest.Mocked<FirebaseService>;
    (AuthenticateSession.verifyToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: "mock-user-id" };
      next();
    });

    const appDependencies: AppDependencies = { firebaseService };
    app = createApp(appDependencies);
  });

  describe("/api/auth routes", () => {
    it("should return 200 and a success message for login", async () => {
      const response = await request(app).post("/api/auth/login").send();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Login successful" });
    });

    it("should return 201 and a success message for registration", async () => {
      const response = await request(app).post("/api/auth/register").send();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "Registration successful" });
    });

    it("should return 204 and an empty body for logout", async () => {
      const response = await request(app).post("/api/auth/logout").send();
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it("should return 202 and a success message for password reset", async () => {
      const response = await request(app).post("/api/auth/reset-password").send();
      expect(response.status).toBe(202);
      expect(response.body).toEqual({});
    });

    it("should return 200 and a success message for session validation", async () => {
      const response = await request(app).get("/api/auth/validate-session").send();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ valid: true, user: { uid: "test-uid", email: "email@example.com" } });
    });
  });

  describe("/api/user routes", () => {
    it("should return 201 and a success message for user creation", async () => {
      const response = await request(app).post("/api/user").send();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ message: "User created successfully" });
    });

    it("should return 200 and a list of users for getting all users", async () => {
      const response = await request(app).get("/api/user").send();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        users: [
          { id: "test-uid", email: "fake-email-1@example.com" },
          { id: "test-uid-2", email: "fake-email-2@example.com" },
          { id: "test-uid-3", email: "fake-email-3@example.com" },
          { id: "test-uid-4", email: "fake-email-4@example.com" },
        ],
      });
    });

    it("should return 200 and user data for getting a user by ID", async () => {
      const response = await request(app).get("/api/user/test-uid").send();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ userData: { id: "test-uid", email: "fake-email-1@example.com" } });
    });

    it("should return 200 and a success message for updating a user", async () => {
      const response = await request(app).put("/api/user/test-uid").send();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "User updated successfully" });
    });

    it("should return 200 and a success message for deleting a user", async () => {
      const response = await request(app).delete("/api/user/test-uid").send();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "User deleted successfully" });
    });
  });
});
