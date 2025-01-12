import { NextFunction, Request, Response } from "express";
import { FirebaseService } from "../services/FirebaseService";
import { DecodedIdToken } from "firebase-admin/auth";

declare module "express-serve-static-core" {
  interface Request {
    user?: DecodedIdToken;
  }
}

export interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export class AuthenticateSession {
  private static firebaseService: FirebaseService;

  public static initializeFirebaseService(firebaseService: FirebaseService): void {
    AuthenticateSession.firebaseService = firebaseService;
  }

  public static verifyToken(req: Request, res: Response, next: NextFunction): void {
    try {
      const sessionToken = req.cookies.sessionToken;

      if (!sessionToken) {
        res.status(401).json({ error: "Authentication token missing" });
        return;
      }

      AuthenticateSession.firebaseService
        .verifySessionCookie(sessionToken)
        .then((decodedToken: DecodedIdToken) => {
          req.user = decodedToken;
          next();
        })
        .catch(() => {
          res.status(401).json({ error: "Invalid or expired token" });
        });
    } catch (error: unknown) {
      res.status(401).json({ error: "Authentication failed" });
      return;
    }
  }
}
