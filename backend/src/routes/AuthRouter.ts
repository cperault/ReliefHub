import { BaseRouter } from "./BaseRouter";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";

export class AuthRouter extends BaseRouter {
  private authController: AuthController;

  constructor(authService: AuthService, userService: UserService) {
    super();
    this.authController = new AuthController(authService, userService);
  }

  protected initializeRoutes(): void {
    this.router.post("/login", this.authController.login.bind(this.authController));
    this.router.post("/register", this.authController.register.bind(this.authController));
    this.router.post("/logout", this.authController.logout.bind(this.authController));
    this.router.post("/reset-password", this.authController.resetPassword.bind(this.authController));
    this.router.get("/validate-session", this.authController.validateSession.bind(this.authController));
  }
}
