import { BaseRouter } from "./BaseRouter";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";

export class AuthRouter extends BaseRouter {
  private authController: AuthController;

  constructor(authService: AuthService) {
    super();
    this.authController = new AuthController(authService);
  }

  protected initializeRoutes(): void {
    this.router.post("/login", this.authController.login.bind(this.authController));
    this.router.post("/register", this.authController.register.bind(this.authController));
    this.router.post("/logout", this.authController.logout.bind(this.authController));
    this.router.post("/reset-password", this.authController.resetPassword.bind(this.authController));
    this.router.get("/validate-session", this.authController.validateSession.bind(this.authController));
  }
}
