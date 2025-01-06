import request from "supertest";
import { Response } from "express";
import createApp from "../../src/app";
import { AuthService } from "../../src/services/AuthService";

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

describe("APIRouter", () => {
  let authService: jest.Mocked<AuthService>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    authService = new AuthService() as jest.Mocked<AuthService>;
    app = createApp(authService);
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
