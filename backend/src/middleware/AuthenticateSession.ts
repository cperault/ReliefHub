import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload | string;
  }
}

export interface DecodedToken {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export class AuthenticateSession {
  public static verifyToken(req: Request, res: Response, next: NextFunction): void {
    try {
      const sessionToken = req.cookies.sessionToken;

      if (!sessionToken) {
        res.status(401).json({ error: "Authentication token missing" });
        return;
      }

      jwt.verify(sessionToken, process.env.JWT_SECRET_KEY as string, {}, (error: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
        if (error) {
          res.status(401).json({ error: "Invalid or expired token" });
          return;
        }

        req.user = decoded as DecodedToken;

        next();
      });
    } catch (error: unknown) {
      res.status(401).json({ error: "Authentication failed" });
      return;
    }
  }
}
