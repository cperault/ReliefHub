import { BaseRouter } from "./BaseRouter";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";

export class AuthRouter extends BaseRouter {
  private authController: AuthController;

  constructor(authService?: AuthService) {
    super();
    const service = authService || new AuthService();
    this.authController = new AuthController(service);
  }

  protected initializeRoutes(): void {
    this.router.post("/login", this.authController.login.bind(this.authController));
    this.router.post("/register", this.authController.register.bind(this.authController));
  }
}
