import { AuthService } from "../services/AuthService";
import { FirebaseService } from "../services/FirebaseService";
import { UserService } from "../services/UserService";
import { AuthRouter } from "./AuthRouter";
import { BaseRouter } from "./BaseRouter";
import { UserRouter } from "./UserRouter";

export class APIRouter extends BaseRouter {
  private authService: AuthService;
  private userService: UserService;
  private firebaseService: FirebaseService;

  constructor(authService: AuthService, userService: UserService, firebaseService: FirebaseService) {
    super();
    this.firebaseService = firebaseService;
    this.authService = authService || new AuthService(this.firebaseService);
    this.userService = userService || new UserService(this.firebaseService);
  }

  protected initializeRoutes(): void {
    this.router.use("/auth", new AuthRouter(this.firebaseService, this.authService).getRouter());
    this.router.use("/user", new UserRouter(this.firebaseService, this.userService).getRouter());
  }
}
