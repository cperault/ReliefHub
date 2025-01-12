import { BaseRouter } from "./BaseRouter";
import { UserController } from "../controllers/UserController";
import { AuthenticateSession } from "../middleware/AuthenticateSession";
import { UserService } from "../services/UserService";
import { FirebaseService } from "../services/FirebaseService";

export class UserRouter extends BaseRouter {
  private userController: UserController;

  constructor(firebaseService: FirebaseService, userService?: UserService) {
    super();
    const service = userService || new UserService(firebaseService);
    this.userController = new UserController(service);
  }

  protected initializeRoutes(): void {
    this.router.get("/", AuthenticateSession.verifyToken, this.userController.getAllUsers.bind(this.userController));
    this.router.get("/:id", AuthenticateSession.verifyToken, this.userController.getUserById.bind(this.userController));
    this.router.post("/", this.userController.createUser.bind(this.userController));
    this.router.put("/:id", AuthenticateSession.verifyToken, this.userController.updateUser.bind(this.userController));
    this.router.delete("/:id", AuthenticateSession.verifyToken, this.userController.deleteUser.bind(this.userController));
  }
}
