import request from "supertest";
import { Response } from "express";
import createApp, { AppDependencies } from "../../src/app";
import { FirebaseService } from "../../src/services/FirebaseService";

jest.mock("../../src/controllers/AuthController", () => {
  return {
    AuthController: jest.fn().mockImplementation(() => ({
      login: (req: Request, res: Response) => res.status(200).json({ message: "Login successful" }),
      register: (req: Request, res: Response) => res.status(201).json({ message: "Registration successful" }),
      logout: (req: Request, res: Response) => res.status(204).end(),
      resetPassword: (req: Request, res: Response) => res.status(202).json({ message: "Password reset email sent" }),
      validateSession: (req: Request, res: Response) => res.status(200).json({ valid: true, user: { uid: "test-uid", email: "email@example.com" } }),
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

describe("APIRouter", () => {
  let firebaseService: jest.Mocked<FirebaseService>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    firebaseService = {
      getFirebaseAuth: jest.fn(),
    } as unknown as jest.Mocked<FirebaseService>;

    const appDependencies: AppDependencies = { firebaseService };
    app = createApp(appDependencies);
  });

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
    expect(response.body).toEqual({ message: "Password reset email sent" });
  });

  it("should return 200 and a success message for session validation", async () => {
    const response = await request(app).get("/api/auth/validate-session").send();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ valid: true, user: { uid: "test-uid", email: "email@example.com" } });
  });
});
