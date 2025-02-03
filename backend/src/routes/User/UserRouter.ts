import { BaseRouter } from "../BaseRouter";
import { UserController } from "../../controllers/User/UserController";
import { UserService } from "../../services/User/UserService";
import { RateLimiter } from "../../middleware/RateLimiter";

export class UserRouter extends BaseRouter {
  private userController: UserController;

  constructor(userService: UserService) {
    super();
    this.userController = new UserController(userService);
  }

  protected initializeRoutes = (): void => {
    this.router.use(RateLimiter.api);

    // Profile setup for authenticated users
    this.router.post("/register", this.userController.createUser);

    // Admin-only routes -- Firestore rules enforce this
    this.router.get("/list", this.userController.getAllUsers);

    // User profile management
    this.router.get("/profile", this.userController.getUserById);
    this.router.put("/profile", this.userController.updateUser);
    this.router.delete("/profile", this.userController.deleteUser);
  };
}
