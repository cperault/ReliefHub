import { Request, Response } from "express";
import { UserService } from "../../services/User/UserService";
import { Logger } from "../../utils/Logger";
import { ProfileType, ProfileUser } from "../../types";
import { InvalidUserDataError, UserServiceError } from "../../services/User/user-types";

export class UserController {
  private userService: UserService;
  private logger: Logger = Logger.getInstance();

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: Partial<ProfileUser> = req.body;

      if (!userData || !userData.type || !userData.email) {
        throw new InvalidUserDataError("Profile setup requires type and email");
      }

      if (userData.type !== ProfileType.VOLUNTEER && userData.type !== ProfileType.AFFECTED) {
        throw new InvalidUserDataError("Profile type must be either volunteer or affected");
      }

      if (userData.type === ProfileType.VOLUNTEER && !userData.address) {
        throw new InvalidUserDataError("Volunteer profile requires an address");
      }

      const user = await this.userService.createUser(userData);

      res.status(201).json({ message: "User profile created successfully", user });
    } catch (error: unknown) {
      this.logger.error("Error while creating a profile user:", error);

      if (error instanceof UserServiceError) {
        res.status(error.status).json({
          message: error.message,
          code: error.code,
        });
      } else {
        res.status(500).json({
          message: "Internal server error",
          code: "UNKNOWN_ERROR",
        });
      }
    }
  };

  public getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const users: ProfileUser[] = await this.userService.getAllUsers();

      res.status(200).json({ users });
    } catch (error: unknown) {
      this.logger.error("Error while getting all users:", error);

      if (error instanceof UserServiceError) {
        res.status(error.status).json({
          message: error.message,
          code: error.code,
        });
      } else {
        res.status(500).json({
          message: "Internal server error",
          code: "UNKNOWN_ERROR",
        });
      }
    }
  };

  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { uid } = req.body as { uid: string };

      if (!uid || uid.trim() === "") {
        throw new InvalidUserDataError("User ID is required");
      }

      const user: ProfileUser = await this.userService.getUser(uid);

      res.status(200).json({ user });
    } catch (error: unknown) {
      this.logger.error("Error while getting a user by ID:", error);

      if (error instanceof UserServiceError) {
        res.status(error.status).json({
          message: error.message,
          code: error.code,
        });
      } else {
        res.status(500).json({
          message: "Internal server error",
          code: "UNKNOWN_ERROR",
        });
      }
    }
  };

  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const updateData: Partial<ProfileUser> = req.body;

      if (!updateData || Object.keys(updateData).length === 0) {
        throw new InvalidUserDataError("Update data is required");
      }

      const uid = updateData.uid;

      if (!uid || uid.trim() === "") {
        throw new InvalidUserDataError("User ID is required");
      }

      // prevent updating critical fields
      delete updateData.uid;
      delete updateData.type;

      const updatedUser = await this.userService.updateUser(uid, updateData);

      res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error: unknown) {
      this.logger.error("Error while updating a user:", error);

      if (error instanceof UserServiceError) {
        res.status(error.status).json({
          message: error.message,
          code: error.code,
        });
      } else {
        res.status(500).json({
          message: "Internal server error",
          code: "UNKNOWN_ERROR",
        });
      }
    }
  };

  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { uid } = req.body as { uid: string };

      if (!uid || uid.trim() === "") {
        throw new InvalidUserDataError("User ID is required");
      }

      await this.userService.deleteUser(uid);

      res.status(204).end();
    } catch (error: unknown) {
      this.logger.error("Error while deleting a user:", error);

      if (error instanceof UserServiceError) {
        res.status(error.status).json({
          message: error.message,
          code: error.code,
        });
      } else {
        res.status(500).json({
          message: "Internal server error",
          code: "UNKNOWN_ERROR",
        });
      }
    }
  };
}
