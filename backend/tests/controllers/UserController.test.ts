import request from "supertest";
import createApp, { AppDependencies } from "../../src/app";
import {
  UserCreateError,
  UserDeleteError,
  UserExistsError,
  UserGetAllError,
  UserGetError,
  UserNotFoundError,
  UserService,
  UsersNotFoundError,
  UserUpdateError,
} from "../../src/services/UserService";
import { FirebaseService } from "../../src/services/FirebaseService";
import { AuthenticateSession } from "../../src/middleware/AuthenticateSession";

jest.mock("../../src/services/FirebaseService");
jest.mock("../../src/services/UserService");
jest.mock("../../src/middleware/AuthenticateSession");

const createError = (ErrorClass: any, message: string) => {
  return Object.assign(new ErrorClass(message), {
    message,
    name: ErrorClass.name,
    stack: new Error().stack,
  });
};

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
      req.user = { uid: "1" };
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

      const response = await request(app)
        .post("/api/user")
        .send({ email: "test@example.com", password: "password123" });

      expect(userService.createUser).toHaveBeenCalledWith({ email: "test@example.com", password: "password123" });
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User created successfully");
    });

    it("should return 400 for invalid data", async () => {
      userService.createUser.mockRejectedValue(createError(UserCreateError, "Invalid user data"));

      const response = await request(app).post("/api/user").send({ email: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid user data");
    });

    it("should return 401 for unauthorized requests", async () => {
      userService.createUser.mockRejectedValue(createError(UserCreateError, "Unauthorized request"));

      const response = await request(app)
        .post("/api/user")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized request");
    });

    it("should return 403 for permission denied", async () => {
      userService.createUser.mockRejectedValue(createError(UserCreateError, "Permission denied"));

      const response = await request(app)
        .post("/api/user")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Permission denied");
    });

    it("should return 409 if user already exists", async () => {
      userService.createUser.mockRejectedValue(createError(UserExistsError, "User already exists"));

      const response = await request(app)
        .post("/api/user")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("User already exists");
    });

    it("should return 500 for unexpected errors", async () => {
      userService.createUser.mockRejectedValue(createError(Error, "Unexpected error"));

      const response = await request(app).post("/api/user").send({ email: "test@example.com" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Unexpected error");
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

    it("should return 401 for unauthorized request", async () => {
      userService.getAllUsers.mockRejectedValue(createError(UserGetAllError, "Unauthorized request"));

      const response = await request(app).get("/api/user");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized request");
    });

    it("should return 403 for permission denied", async () => {
      userService.getAllUsers.mockRejectedValue(createError(UserGetAllError, "Permission denied"));

      const response = await request(app).get("/api/user");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Permission denied");
    });

    it("should return 404 if no users found", async () => {
      userService.getAllUsers.mockRejectedValue(createError(UsersNotFoundError, "Users not found"));

      const response = await request(app).get("/api/user");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Users not found");
    });

    it("should return 500 for unexpected errors", async () => {
      userService.getAllUsers.mockRejectedValue(new Error("Unexpected error"));

      const response = await request(app).get("/api/user");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Unexpected error");
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

    it("should return 401 if user ID is missing", async () => {
      (AuthenticateSession.verifyToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = {};
        next();
      });

      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("User ID missing");
    });

    it("should return 403 for permission denied", async () => {
      userService.getUser.mockRejectedValue(createError(UserGetError, "Permission denied"));

      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Permission denied");
    });

    it("should return 404 if user not found", async () => {
      userService.getUser.mockRejectedValue(createError(UserNotFoundError, "User not found"));

      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found");
    });

    it("should return 500 for unexpected errors", async () => {
      userService.getUser.mockRejectedValue(new Error("Unexpected error"));

      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Unexpected error");
    });
  });

  describe("PUT /api/user", () => {
    it("should update user and return 200", async () => {
      userService.updateUser.mockResolvedValue({ success: true });
      const updateData = { email: "updated@example.com" };

      const response = await request(app).put("/api/user/1").send(updateData);

      expect(userService.updateUser).toHaveBeenCalledWith("1", updateData);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User updated successfully");
    });

    it("should return 400 for invalid data", async () => {
      userService.updateUser.mockRejectedValue(createError(UserUpdateError, "Invalid user data"));

      const response = await request(app).put("/api/user/1").send({ email: "invalid" });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid user data");
    });

    it("should return 401 if user ID is missing", async () => {
      (AuthenticateSession.verifyToken as jest.Mock).mockImplementation((req, res, next) => {
        req.user = {};
        next();
      });

      const response = await request(app).put("/api/user/1").send({ email: "updated@example.com" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("User ID missing");
    });

    it("should return 403 for permission denied", async () => {
      userService.updateUser.mockRejectedValue(createError(UserUpdateError, "Permission denied"));

      const response = await request(app).put("/api/user/1").send({ email: "updated@example.com" });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Permission denied");
    });

    it("should return 404 if user not found", async () => {
      userService.updateUser.mockRejectedValue(createError(UserNotFoundError, "User not found"));

      const response = await request(app).put("/api/user/1").send({ email: "updated@example.com" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found");
    });

    it("should return 500 for unexpected errors", async () => {
      userService.updateUser.mockRejectedValue(new Error("Unexpected error"));

      const response = await request(app).put("/api/user/1").send({ email: "test@example.com" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Unexpected error");
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

    it("should return 400 for invalid request", async () => {
      userService.deleteUser.mockRejectedValue(createError(UserDeleteError, "Invalid user data"));

      const response = await request(app).delete("/api/user/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Invalid user data");
    });

    it("should return 401 for unauthorized request", async () => {
      userService.deleteUser.mockRejectedValue(createError(UserDeleteError, "Unauthorized request"));

      const response = await request(app).delete("/api/user/1");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Unauthorized request");
    });

    it("should return 403 for permission denied", async () => {
      userService.deleteUser.mockRejectedValue(createError(UserDeleteError, "Permission denied"));

      const response = await request(app).delete("/api/user/1");

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Permission denied");
    });

    it("should return 404 if user not found", async () => {
      userService.deleteUser.mockRejectedValue(createError(UserNotFoundError, "User not found"));

      const response = await request(app).delete("/api/user/1");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("User not found");
    });

    it("should return 500 for unexpected errors", async () => {
      userService.deleteUser.mockRejectedValue(new Error("Unexpected error"));

      const response = await request(app).delete("/api/user/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Unexpected error");
    });
  });
});
