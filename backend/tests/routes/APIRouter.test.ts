import request from "supertest";
import { Response } from "express";
import createApp, { AppDependencies } from "../../src/app";
import { AuthService } from "../../src/services/AuthService";
import { FirebaseService } from "../../src/services/FirebaseService";
import { UserService } from "../../src/services/UserService";

jest.mock("../../src/controllers/AuthController", () => {
  return {
    AuthController: jest.fn().mockImplementation(() => ({
      login: (req: Request, res: Response) => res.status(200).json({ message: "Login successful" }),
      register: (req: Request, res: Response) => res.status(201).json({ message: "Registration successful" }),
    })),
  };
});

jest.mock("../../src/services/AuthService", () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock("../../src/services/UserService");

describe("APIRouter", () => {
  let firebaseService: jest.Mocked<FirebaseService>;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    firebaseService = {
      getFirebaseAuth: jest.fn(),
    } as unknown as jest.Mocked<FirebaseService>;

    authService = new AuthService(firebaseService) as jest.Mocked<AuthService>;

    userService = {} as jest.Mocked<UserService>;

    const appDependencies: AppDependencies = { authService, firebaseService, userService };
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
});
