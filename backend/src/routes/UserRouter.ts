import { BaseRouter } from "./BaseRouter";
import { UserController } from "../controllers/UserController";
import { AuthenticateSession } from "../middleware/AuthenticateSession";
import { UserService } from "../services/UserService";

export class UserRouter extends BaseRouter {
  private userController: UserController;

  constructor(userService: UserService) {
    super();
    this.userController = new UserController(userService);
  }

  protected initializeRoutes(): void {
    this.router.get("/", AuthenticateSession.verifySession, this.userController.getAllUsers.bind(this.userController));
    this.router.get(
      "/:id",
      AuthenticateSession.verifySession,
      this.userController.getUserById.bind(this.userController)
    );
    this.router.post("/", this.userController.createUser.bind(this.userController));
    this.router.put(
      "/:id",
      AuthenticateSession.verifySession,
      this.userController.updateUser.bind(this.userController)
    );
    this.router.delete(
      "/:id",
      AuthenticateSession.verifySession,
      this.userController.deleteUser.bind(this.userController)
    );
  }
}
  