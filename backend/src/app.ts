import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { APIRouter } from "./routes/APIRouter";
import { AuthService } from "./services/AuthService";
import { UserService } from "./services/UserService";
import { FirebaseService } from "./services/FirebaseService";
import { AuthenticateSession } from "./middleware/AuthenticateSession";
import { APIError } from "./middleware/APIError";

export interface AppDependencies {
  firebaseService: FirebaseService;
}

process.env.NODE_NO_WARNINGS = "1";

const createApp = (appDependencies: AppDependencies) => {
  const { firebaseService } = appDependencies;

  const authService = new AuthService(firebaseService);
  const userService = new UserService(firebaseService);

  AuthenticateSession.initializeFirebaseService(firebaseService); // for middleware of non /api/auth routes

  const app = express();

  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: "https://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    })
  );
  app.use(helmet());

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  const apiRouter = new APIRouter(authService, userService);
  app.use("/api", apiRouter.getRouter());

  app.use(APIError.notFoundHandler);
  app.use(APIError.errorHandler);

  return app;
};

export default createApp;
