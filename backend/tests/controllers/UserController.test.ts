import request from "supertest";
import createApp, { AppDependencies } from "../../src/app";
import { UserService, UserNotFoundError, UsersNotFoundError } from "../../src/services/UserService";
import { FirebaseService } from "../../src/services/FirebaseService";
import { AuthenticateSession } from "../../src/middleware/AuthenticateSession";
import {
  APIError,
  AuthenticationError,
  BadRequestError,
  ConflictError,
  DatabaseError,
} from "../../src/middleware/APIError";

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
      const userData = { email: "test@example.com", password: "password123" };
      userService.createUser.mockResolvedValue({ id: "1", ...userData });

      const response = await request(app).post("/api/user").send(userData);

      expect(userService.createUser).toHaveBeenCalledWith(userData);
      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User created successfully");
    });

    it("should return 400 when user creation fails with validation error", async () => {
      userService.createUser.mockRejectedValue(new BadRequestError("Invalid user data format"));

      const response = await request(app).post("/api/user").send({
        email: "invalid-email",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("BadRequestError");
      expect(response.body.message).toBe("Invalid user data format");
    });

    it("should return 400 when request body is missing", async () => {
      userService.createUser.mockRejectedValue(new BadRequestError("User data is required"));
      const response = await request(app).post("/api/user").send(undefined);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("BadRequestError");
      expect(response.body.message).toBe("User data is required");
    });

    it("should return 400 when required fields are missing", async () => {
      userService.createUser.mockRejectedValue(new BadRequestError("Invalid user data"));
      const response = await request(app).post("/api/user").send({ email: "test@example.com" }); // missing password

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("BadRequestError");
      expect(response.body.message).toBe("Invalid user data");
    });

    it("should return 409 when user already exists", async () => {
      userService.createUser.mockRejectedValue(new ConflictError("User already exists"));

      const response = await request(app)
        .post("/api/user")
        .send({ email: "existing@example.com", password: "password123" });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe("ConflictError");
      expect(response.body.message).toBe("User already exists");
    });

    it("should return 500 on unexpected errors", async () => {
      userService.createUser.mockRejectedValue(new DatabaseError("Database error"));

      const response = await request(app)
        .post("/api/user")
        .send({ email: "test@example.com", password: "password123" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("DatabaseError");
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("GET /api/user", () => {
    beforeEach(() => {
      (AuthenticateSession.verifySession as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { uid: "1" };
        next();
      });
    });

    it("should return all users with status 200", async () => {
      const mockUser = { id: "1", email: "test@example.com" };

      userService.getUser.mockResolvedValue(mockUser);
      const mockUsers = [
        { id: "1", email: "user1@example.com" },
        { id: "2", email: "user2@example.com" },
      ];

      userService.getAllUsers.mockResolvedValue(mockUsers);

      const response = await request(app).get("/api/user");

      expect(response.status).toBe(200);
      expect(response.body.users).toEqual(mockUsers);
    });

    it("should return 404 when no users are found", async () => {
      userService.getAllUsers.mockRejectedValue(new UsersNotFoundError("No users found"));

      const error = new UsersNotFoundError("No users found");
      Object.defineProperty(error, "message", { value: "No users found" });
      userService.getAllUsers.mockRejectedValue(error);

      const response = await request(app).get("/api/user");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("NotFoundError");
      expect(response.body.message).toBe("No users found");
    });

    it("should return 500 on unexpected errors", async () => {
      userService.getAllUsers.mockRejectedValue(new DatabaseError("Database connection error"));

      const response = await request(app).get("/api/user");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("DatabaseError");
      expect(response.body.message).toBe("Database connection error");
    });
  });

  describe("GET /api/user/:id", () => {
    beforeEach(() => {
      (AuthenticateSession.verifySession as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { uid: "1" };
        next();
      });
    });

    it("should return user data with status 200", async () => {
      const mockUser = { id: "1", email: "test@example.com" };

      userService.getUser.mockResolvedValue(mockUser);

      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(200);
      expect(response.body.userData).toEqual(mockUser);
    });

    it("should return 401 when user is not authenticated", async () => {
      (AuthenticateSession.verifySession as jest.Mock).mockImplementation((req, res, next) => {
        const error = new AuthenticationError("Invalid or expired token");
        APIError.handleControllerError(res, error);
      });

      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("AuthenticationError");
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should return 404 when user is not found", async () => {
      const error = new UserNotFoundError("User not found");
      Object.defineProperty(error, "message", { value: "User not found" });
      userService.getUser.mockRejectedValue(error);

      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("NotFoundError");
      expect(response.body.message).toBe("User not found");
    });

    it("should return 500 on unexpected errors", async () => {
      userService.getUser.mockRejectedValue(new DatabaseError("Database error"));

      const response = await request(app).get("/api/user/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("DatabaseError");
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("PUT /api/user/:id", () => {
    beforeEach(() => {
      (AuthenticateSession.verifySession as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { uid: "1" };
        next();
      });
    });

    it("should update user and return 200", async () => {
      const updateData = { email: "updated@example.com" };
      userService.updateUser.mockResolvedValue({ success: true });

      const response = await request(app).put("/api/user/1").send(updateData);

      expect(userService.updateUser).toHaveBeenCalledWith("1", updateData);
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User updated successfully");
    });

    it("should return 400 when update fails with validation error", async () => {
      userService.updateUser.mockRejectedValue(new BadRequestError("Invalid user data"));

      const response = await request(app).put("/api/user/1").send({
        email: "invalid-email",
        someInvalidField: "value",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("BadRequestError");
      expect(response.body.message).toBe("Invalid user data");
    });

    it("should return 400 when update data is missing", async () => {
      userService.updateUser.mockRejectedValue(new BadRequestError("Update data is required"));

      const response = await request(app).put("/api/user/1").send();

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("BadRequestError");
      expect(response.body.message).toBe("Update data is required");
    });

    it("should return 401 when user is not authenticated", async () => {
      (AuthenticateSession.verifySession as jest.Mock).mockImplementation((req, res, next) => {
        const error = new AuthenticationError("Invalid or expired token");
        APIError.handleControllerError(res, error);
      });

      const response = await request(app).put("/api/user/1").send({ email: "test@example.com" });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("AuthenticationError");
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should return 404 when user is not found", async () => {
      const error = new UserNotFoundError("User not found");
      Object.defineProperty(error, "message", { value: "User not found" });
      userService.updateUser.mockRejectedValue(error);

      const response = await request(app).put("/api/user/1").send({ email: "test@example.com" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("NotFoundError");
      expect(response.body.message).toBe("User not found");
    });

    it("should return 500 on unexpected errors", async () => {
      userService.updateUser.mockRejectedValue(new DatabaseError("Database error"));

      const response = await request(app).put("/api/user/1").send({ email: "test@example.com" });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("DatabaseError");
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("DELETE /api/user/:id", () => {
    beforeEach(() => {
      (AuthenticateSession.verifySession as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { uid: "1" };
        next();
      });
    });

    it("should delete user and return 200", async () => {
      userService.deleteUser.mockResolvedValue({ success: true });

      const response = await request(app).delete("/api/user/1");

      expect(userService.deleteUser).toHaveBeenCalledWith("1");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("User deleted successfully");
    });

    it("should return 401 when user is not authenticated", async () => {
      (AuthenticateSession.verifySession as jest.Mock).mockImplementation((req, res, next) => {
        const error = new AuthenticationError("Invalid or expired token");
        APIError.handleControllerError(res, error);
      });

      const response = await request(app).delete("/api/user/1");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("AuthenticationError");
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should return 404 when user is not found", async () => {
      const error = new UserNotFoundError("User not found");
      Object.defineProperty(error, "message", { value: "User not found" });
      userService.deleteUser.mockRejectedValue(error);

      const response = await request(app).delete("/api/user/1");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("NotFoundError");
      expect(response.body.message).toBe("User not found");
    });

    it("should return 500 on unexpected errors", async () => {
      userService.deleteUser.mockRejectedValue(new DatabaseError("Database error"));

      const response = await request(app).delete("/api/user/1");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("DatabaseError");
      expect(response.body.message).toBe("Database error");
    });
  });
});
