import request from "supertest";
import createApp, { AppDependencies } from "../../src/app";
import { UserService } from "../../src/services/UserService";
import { FirebaseService } from "../../src/services/FirebaseService";
import { AuthenticateSession } from "../../src/middleware/AuthenticateSession";

jest.mock("../../src/services/FirebaseService");
jest.mock("../../src/services/UserService");
jest.mock("../../src/middleware/AuthenticateSession");

describe("UserController", () => {
  let app: ReturnType<typeof createApp>;
  let firebaseService: jest.Mocked<FirebaseService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    userService = {
      createUser: jest.fn(),
      getAllUsers: jest.fn(),
      getUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    firebaseService = {
      getFirebaseAuth: jest.fn(),
      getFirestore: jest.fn(),
      getAdminAuth: jest.fn(),
    } as unknown as jest.Mocked<FirebaseService>;

    (AuthenticateSession.verifyToken as jest.Mock).mockImplementation((req, res, next) => {
      req.user = { id: "1" };
      next();
    });

    (UserService as jest.Mock) = jest.fn().mockImplementation(() => userService);
    (FirebaseService as jest.Mock) = jest.fn().mockImplementation(() => firebaseService);

    const appDependencies: AppDependencies = { firebaseService };
    app = createApp(appDependencies);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/user", () => {
    it("should create a user and return 201", async () => {
      userService.createUser.mockResolvedValue({ id: "1", email: "test@eample.com" });

      const response = await request(app).post("/api/user").send({ email: "test@example.com", password: "password123" });

      expect(userService.createUser).toHaveBeenCalledWith({ email: "test@example.com", password: "password123" });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User created successfully");
    });

    it("should return 500 if the service throws an error", async () => {
      userService.createUser.mockRejectedValue(new Error("Service error"));

      const response = await request(app).post("/api/user").send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Service error");
    });
  });

  describe("GET /api/user", () => {
    it("should return all users and status 200", async () => {
      const users = [
        { id: "test-uid", email: "fake-email-1@example.com" },
        { id: "test-uid-2", email: "fake-email-2@example.com" },
        { id: "test-uid-3", email: "fake-email-3@example.com" },
        { id: "test-uid-4", email: "fake-email-4@example.com" },
      ];
      userService.getAllUsers.mockResolvedValue(users);

      const response = await request(app).get("/api/user");

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(response.body.users).toEqual(users);
    });

    it("should return 500 if the service throws an error", async () => {
      userService.getAllUsers.mockRejectedValue(new Error("Service error"));

      const response = await request(app).get("/api/user");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Service error");
    });
  });

  describe("GET /api/user/:id", () => {
    it("should return user data and status 200", async () => {
      const userData = { id: "1", email: "test@example.com" };
      userService.getUser.mockResolvedValue(userData);

      const response = await request(app).get("/api/user/1");

      expect(userService.getUser).toHaveBeenCalledWith("1");
      expect(response.status).toBe(200);
      expect(response.body.userData).toEqual(userData);
    });

    it("should return 500 if the service throws an error", async () => {
      userService.getUser.mockRejectedValue(new Error("Service error"));

      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Service error");
    });
  });

  describe("PUT /api/user", () => {
    it("should update user and return 200", async () => {
      userService.updateUser.mockResolvedValue({ success: true });

      const response = await request(app)
        .put("/api/user/1")
        .send({ uid: "test-id", userData: { email: "updated@example.com" } });

      expect(userService.updateUser).toHaveBeenCalledWith("1", { uid: "test-id", userData: { email: "updated@example.com" } });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User updated successfully");
    });

    it("should return 500 if the service throws an error", async () => {
      userService.updateUser.mockRejectedValue(new Error("Service error"));

      const response = await request(app).put("/api/user/1").send({ email: "updated@example.com" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Service error");
    });
  });

  describe("DELETE /api/user/:id", () => {
    it("should delete user and return 200", async () => {
      userService.deleteUser.mockResolvedValue({ success: true });

      const response = await request(app).delete("/api/user/1");

      expect(userService.deleteUser).toHaveBeenCalledWith("1");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User deleted successfully");
    });

    it("should return 500 if the service throws an error", async () => {
      userService.deleteUser.mockRejectedValue(new Error("Service error"));

      const response = await request(app).delete("/api/user/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Service error");
    });
  });
});
