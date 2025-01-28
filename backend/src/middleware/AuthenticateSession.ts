import { NextFunction, Request, Response } from "express";
import { FirebaseService } from "../services/FirebaseService";
import { DecodedIdToken } from "firebase-admin/auth";
import { AuthenticationError } from "./APIError";

declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedIdToken;
  }
}

export class AuthenticateSession {
  private static firebaseService: FirebaseService;

  public static initializeFirebaseService(firebaseService: FirebaseService): void {
    AuthenticateSession.firebaseService = firebaseService;
  }

  public static verifySession(req: Request, res: Response, next: NextFunction): void {
    try {
      const sessionToken = req.cookies.sessionToken;

      if (!sessionToken) {
        throw new AuthenticationError("Authentication token missing");
      }

      AuthenticateSession.firebaseService
        .verifySessionCookie(sessionToken)
        .then((decodedToken: DecodedIdToken) => {
          req.user = decodedToken;
          next();
        })
        .catch(() => {
          throw new AuthenticationError("Invalid or expired token");
        });
    } catch (error: unknown) {
      throw new AuthenticationError("Authentication failed");
    }
  }
}
