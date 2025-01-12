import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";
import { AuthRouter } from "./AuthRouter";
import { BaseRouter } from "./BaseRouter";
import { UserRouter } from "./UserRouter";

export class APIRouter extends BaseRouter {
  private authService: AuthService;
  private userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    super();
    this.authService = authService;
    this.userService = userService;
  }

  protected initializeRoutes(): void {
    this.router.use("/auth", new AuthRouter(this.authService).getRouter());
    this.router.use("/user", new UserRouter(this.userService).getRouter());
  }
}
