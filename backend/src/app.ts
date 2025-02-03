import dotenv from "dotenv";

const env = process.env.NODE_ENV || "dev";
const envPath = env === "test" || env === "dev" ? ".env.test" : ".env";
dotenv.config({ path: envPath });

import express from "express";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { APIRouter } from "./routes/API/APIRouter";
import { AuthService } from "./services/Auth/AuthService";
import { UserService } from "./services/User/UserService";
import { FirebaseService } from "./services/Firebase/FirebaseService";

export interface AppDependencies {
  firebaseService: FirebaseService;
}

process.env.NODE_NO_WARNINGS = "1";

const createApp = (appDependencies: AppDependencies) => {
  const { firebaseService } = appDependencies;

  const authService = new AuthService(firebaseService);
  const userService = new UserService(firebaseService);

  const app = express();

  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: "https://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
  );
  app.use(helmet());

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  const apiRouter = new APIRouter(authService, userService);
  app.use("/api", apiRouter.getRouter());

  return app;
};

export default createApp;
