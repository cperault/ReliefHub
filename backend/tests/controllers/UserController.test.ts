import request from "supertest";
import createApp, { AppDependencies } from "../../src/app";
import { FirebaseService } from "../../src/services/FirebaseService";

jest.mock("../../src/services/AuthService");
jest.mock("../../src/services/UserService");

describe("UserController", () => {
  let firebaseService: jest.Mocked<FirebaseService>;
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    firebaseService = {
      getFirebaseAuth: jest.fn(),
      getFirestore: jest.fn(),
    } as unknown as jest.Mocked<FirebaseService>;

    const appDependencies: AppDependencies = { firebaseService };
    app = createApp(appDependencies);
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
