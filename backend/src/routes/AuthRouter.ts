import { BaseRouter } from "./BaseRouter";
import { AuthController } from "../controllers/AuthController";
import { AuthService } from "../services/AuthService";
import { FirebaseService } from "../services/FirebaseService";

export class AuthRouter extends BaseRouter {
  private authController: AuthController;

  constructor(firebaseService: FirebaseService, authService?: AuthService) {
    super();
    const service = authService || new AuthService(firebaseService);
    this.authController = new AuthController(service);
  }

  protected initializeRoutes(): void {
    this.router.post("/login", this.authController.login.bind(this.authController));
    this.router.post("/register", this.authController.register.bind(this.authController));
    this.router.post("/logout", this.authController.logout.bind(this.authController));
    this.router.post("/reset-password", this.authController.resetPassword.bind(this.authController));
    this.router.get("/validate-session", this.authController.validateSession.bind(this.authController));
  }
}
