import { AuthService } from "../../services/Auth/AuthService";
import { UserService } from "../../services/User/UserService";
import { AuthRouter } from "../Auth/AuthRouter";
import { BaseRouter } from "../BaseRouter";
import { UserRouter } from "../User/UserRouter";

export class APIRouter extends BaseRouter {
  private authService: AuthService;
  private userService: UserService;

  constructor(authService: AuthService, userService: UserService) {
    super();
    this.authService = authService;
    this.userService = userService;
  }

  protected initializeRoutes(): void {
    this.router.use("/auth", new AuthRouter(this.authService, this.userService).getRouter());
    this.router.use("/user", new UserRouter(this.userService).getRouter());
  }
}
