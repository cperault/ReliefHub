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
import { Logger } from "./utils/Logger";
import { UserService } from "./services/UserService";

interface Error {
  status?: number;
  message?: string;
}

interface Request extends express.Request {}
interface Response extends express.Response {}
interface NextFunction extends express.NextFunction {}

const createApp = (authService?: AuthService, userService?: UserService) => {
  const app = express();
  const logger = new Logger();

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
  app.use(morgan("dev"));

  const apiRouter = new APIRouter(authService, userService);
  app.use("/api", apiRouter.getRouter());

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
      error: "Not Found",
      message: `The path ${req.originalUrl} does not exist on this server.`,
    });
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(500).json({
      error: "Internal Server Error",
      message: "Something went wrong on the server.",
    });
  });

  return app;
};

export default createApp;
