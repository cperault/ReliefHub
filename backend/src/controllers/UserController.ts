import { Request, Response } from "express";
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
} from "../services/UserService";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      await this.userService.createUser(data);
      res.status(201).json({ message: "User created successfully" });
    } catch (error: unknown) {
      if (error instanceof UserExistsError) {
        res.status(409).json({ error: error.message });
      } else if (error instanceof UserCreateError) {
        if (error.message === "Unauthorized request") {
          res.status(401).json({ error: error.message });
        } else if (error.message === "Permission denied") {
          res.status(403).json({ error: error.message });
        } else if (error.message === "Invalid user data") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({ users });
    } catch (error: unknown) {
      if (error instanceof UsersNotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof UserGetAllError) {
        if (error.message === "Unauthorized request") {
          res.status(401).json({ error: error.message });
        } else if (error.message === "Permission denied") {
          res.status(403).json({ error: error.message });
        } else if (error.message === "Invalid user data") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const uid = req?.user?.uid;

      if (!uid) {
        res.status(401).json({ error: "User ID missing" });
        return;
      }

      const userData = await this.userService.getUser(uid);

      res.status(200).json({ userData });
    } catch (error: unknown) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof UserGetError) {
        if (error.message === "Unauthorized request") {
          res.status(401).json({ error: error.message });
        } else if (error.message === "Permission denied") {
          res.status(403).json({ error: error.message });
        } else if (error.message === "Invalid user data") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const uid = req?.user?.uid;

      if (!uid) {
        res.status(401).json({ error: "User ID missing" });
        return;
      }

      const data = req.body;

      await this.userService.updateUser(uid, data);

      res.status(200).json({ message: "User updated successfully" });
    } catch (error: unknown) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof UserUpdateError) {
        if (error.message === "Unauthorized request") {
          res.status(401).json({ error: error.message });
        } else if (error.message === "Permission denied") {
          res.status(403).json({ error: error.message });
        } else if (error.message === "Invalid user data") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const uid = req?.user?.uid;

      if (!uid) {
        res.status(401).json({ error: "User ID missing" });
        return;
      }

      await this.userService.deleteUser(uid);

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: unknown) {
      if (error instanceof UserNotFoundError) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof UserDeleteError) {
        if (error.message === "Unauthorized request") {
          res.status(401).json({ error: error.message });
        } else if (error.message === "Permission denied") {
          res.status(403).json({ error: error.message });
        } else if (error.message === "Invalid user data") {
          res.status(400).json({ error: error.message });
        } else {
          res.status(400).json({ error: error.message });
        }
      } else {
        res.status(500).json({ error: (error as Error).message });
      }
    }
  }
}
