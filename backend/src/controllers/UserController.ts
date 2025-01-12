import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { DecodedIdToken } from "firebase-admin/auth";

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
      res.status(500).json({ error: (error as Error).message });
    }
  }

  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({ users });
    } catch (error: unknown) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  public async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const uid = (req.user as DecodedIdToken)?.id;

      if (!uid) {
        res.status(401).json({ error: "User ID missing" });
        return;
      }

      const userData = await this.userService.getUser(uid);

      res.status(200).json({ userData });
    } catch (error: unknown) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  public async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const uid = (req.user as DecodedIdToken)?.id;

      if (!uid) {
        res.status(401).json({ error: "User ID missing" });
      }

      const data = req.body;
      await this.userService.updateUser(uid, data);

      res.status(200).json({ message: "User updated successfully" });
    } catch (error: unknown) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      await this.userService.deleteUser(id);
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error: unknown) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
