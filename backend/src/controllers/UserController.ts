import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { APIError, BadRequestError } from "../middleware/APIError";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      if (!data) {
        throw new BadRequestError("User data is required");
      }

      await this.userService.createUser(data);
      res.status(201).json({ message: "User created successfully" });
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  }

  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({ users });
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const uid = req?.user?.uid;

      if (!uid) {
        throw new BadRequestError("User ID missing");
      }

      const userData = await this.userService.getUser(uid);

      res.status(200).json({ userData });
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const uid = req?.user?.uid;

      if (!uid) {
        throw new BadRequestError("User ID missing");
      }

      const data = req.body;

      if (!data) {
        throw new BadRequestError("Update data is required");
      }

      await this.userService.updateUser(uid, data);

      res.status(200).json({ message: "User updated successfully" });
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const uid = req?.user?.uid;

      if (!uid) {
        throw new BadRequestError("User ID missing");
      }

      await this.userService.deleteUser(uid);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: unknown) {
      APIError.handleControllerError(res, error);
    }
  }
}
