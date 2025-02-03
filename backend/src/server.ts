import { Logger } from "./utils/Logger";
import createApp, { AppDependencies } from "./app";
import https from "https";
import fs from "fs";
import path from "path";
import { FirebaseService } from "./services/Firebase/FirebaseService";

const logger = Logger.getInstance();
const PORT = parseInt(process.env.BPORT || "4000", 10);

const keyPath = path.join(__dirname, "../certs/localhost-key.pem");
const certPath = path.join(__dirname, "../certs/localhost.pem");

const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const firebaseService = new FirebaseService();
const appDependencies: AppDependencies = { firebaseService };
const app = createApp(appDependencies);

const httpsServer = https.createServer(sslOptions, app);

httpsServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
