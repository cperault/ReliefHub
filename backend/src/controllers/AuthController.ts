import { Request, Response } from "express";
import { AuthResult, AuthService, TokenVerificationResult } from "../services/AuthService";
import jwt from "jsonwebtoken";

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  private handleAuthResponse = async (res: Response, result: AuthResult, successStatusCode: number): Promise<void> => {
    if (result.token) {
      const tokenVerificationResult: TokenVerificationResult | null = await this.authService.verifyToken(result.token);

      if (tokenVerificationResult) {
        const { uid, email } = tokenVerificationResult;

        const sessionToken = jwt.sign(
          {
            uid: uid,
            email: email,
          },
          process.env.JWT_SECRET_KEY as string,
          { expiresIn: "1h" }
        );

        res.cookie("sessionToken", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 3600000,
        });

        res.status(successStatusCode).json({ message: "Registration successful" });
      } else {
        res.status(400).json({ error: "Invalid token" });
      }
    } else {
      res.status(400).json({ error: result.error });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.authenticateUser(email, password);

      await this.handleAuthResponse(res, result, 200);
    } catch (error: unknown) {
      res.status(500).json({ error: (error as Error).message });
    }
  };

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.registerUser(email, password);

      await this.handleAuthResponse(res, result, 201);
    } catch (error: unknown) {
      res.status(500).json({ error: (error as Error).message });
    }
  };
}
