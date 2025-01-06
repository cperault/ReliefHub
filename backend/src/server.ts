import createApp from "./app";
import https from "https";
import { Logger } from "./utils/Logger";
import fs from "fs";
import path from "path";
import { AuthService } from "./services/AuthService";
import { UserService } from "./services/UserService";

const PORT = parseInt(process.env.BPORT || "4000", 10);
const logger = new Logger();

const keyPath = path.resolve(__dirname, "../certs/localhost-key.pem");
const certPath = path.resolve(__dirname, "../certs/localhost.pem");

const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const authService = new AuthService();
const userService = new UserService();

const app = createApp(authService, userService);

const httpsServer = https.createServer(sslOptions, app);

httpsServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
