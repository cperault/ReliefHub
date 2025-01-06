import request from "supertest";
import createApp from "../../src/app";
import { AuthService } from "../../src/services/AuthService";
import { UserService } from "../../src/services/UserService";

jest.mock("../../src/services/AuthService");
jest.mock("../../src/services/UserService");

describe("UserController", () => {
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    authService = new AuthService() as jest.Mocked<AuthService>;
    userService = new UserService() as jest.Mocked<UserService>;
    app = createApp(authService, userService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/user", () => {
    it.skip("", () => {
      // TODO: implement tests
    });
  });
  describe("GET /api/user/:id", () => {});
  describe("POST /api/user", () => {});
  describe("PUT /api/user", () => {});
  describe("DELETE /api/user/:id", () => {});
});
