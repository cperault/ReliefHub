import { BaseRouter } from "../BaseRouter";
import { AuthController } from "../../controllers/Auth/AuthController";
import { AuthService } from "../../services/Auth/AuthService";
import { UserService } from "../../services/User/UserService";
import { RateLimiter } from "../../middleware/RateLimiter";

export class AuthRouter extends BaseRouter {
  private authController: AuthController;

  constructor(authService: AuthService, userService: UserService) {
    super();
    this.authController = new AuthController(authService, userService);
  }

  protected initializeRoutes(): void {
    this.router.post("/login", RateLimiter.auth, this.authController.login.bind(this.authController));
    this.router.post("/register", RateLimiter.auth, this.authController.register.bind(this.authController));
    this.router.post("/reset-password", RateLimiter.auth, this.authController.resetPassword.bind(this.authController));
    this.router.post("/logout", this.authController.logout.bind(this.authController));
    this.router.get("/validate-session", this.authController.validateSession.bind(this.authController));
  }
}
