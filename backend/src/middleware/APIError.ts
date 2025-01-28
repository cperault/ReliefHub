import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/Logger";
import {
  UserNotFoundError,
  UsersNotFoundError,
  UserExistsError,
  UserCreateError,
  UserUpdateError,
  UserDeleteError,
  UserGetError,
  UserGetAllError,
} from "../services/UserService";

export class APIError extends Error {
  private static logger: Logger = Logger.getInstance();

  constructor(public message: string, public status: number = 500, public code?: string, public data?: any) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static handleControllerError(res: Response, error: unknown): void {
    let apiError: APIError;

    if (error instanceof UserNotFoundError || error instanceof UsersNotFoundError) {
      apiError = new NotFoundError(error.message);
    } else if (error instanceof UserExistsError) {
      apiError = new ConflictError(error.message);
    } else if (
      error instanceof UserCreateError ||
      error instanceof UserUpdateError ||
      error instanceof UserDeleteError ||
      error instanceof UserGetError ||
      error instanceof UserGetAllError
    ) {
      if (error.message === "Unauthorized request") {
        apiError = new AuthenticationError(error.message);
      } else if (error.message === "Permission denied") {
        apiError = new ForbiddenError(error.message);
      } else if (error.message === "Invalid user data") {
        apiError = new BadRequestError(error.message);
      } else {
        apiError = new BadRequestError(error.message);
      }
    } else if (error instanceof APIError) {
      apiError = error;
    } else {
      apiError = new InternalServerError(
        process.env.NODE_ENV === "dev" ? (error as Error).message : "An unexpected error occurred"
      );
    }

    this.logger.error(`${apiError.status} - ${apiError.message}`, {
      error: apiError,
      code: apiError.code,
      data: apiError.data,
    });

    res.status(apiError.status).json({
      error: apiError.name,
      message: apiError.message,
      code: apiError.code,
      ...(apiError.data && { data: apiError.data }),
    });
  }

  static errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
    if (err instanceof APIError) {
      this.logger.error(`${err.status} - ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`, {
        error: err,
        code: err.code,
        data: err.data,
        stack: err.stack,
        body: req.body,
        params: req.params,
        query: req.query,
      });

      const response = {
        error: err.name,
        message: err.message,
        code: err.code,
        ...(err instanceof FormValidationError && { validationErrors: err.data }),
        ...(err.data && !(err instanceof FormValidationError) && { data: err.data }),
        ...(process.env.NODE_ENV === "dev" && { stack: err.stack }),
      };

      res.status(err.status).json(response);
      return;
    }

    // Handle Firebase Auth errors
    if (err?.name === "FirebaseAuthError") {
      const status = (err as { code?: string })?.code?.includes("auth/") ? 401 : 500;
      this.logger.error(`${status} - Firebase Auth Error - ${req.method} ${req.originalUrl} - ${req.ip}`, {
        error: err,
        stack: err.stack,
      });

      res.status(status).json({
        error: "AuthenticationError",
        message: err.message,
        code: (err as { code?: string })?.code,
        ...(process.env.NODE_ENV === "dev" && { stack: err.stack }),
      });
      return;
    }

    // Handle all other unhandled errors
    this.logger.error(`500 - Unhandled Error - ${req.method} ${req.originalUrl} - ${req.ip}`, {
      error: err,
      stack: err.stack,
    });

    res.status(500).json({
      error: "InternalServerError",
      message: "An unexpected error occurred",
      code: "INTERNAL_SERVER_ERROR",
      ...(process.env.NODE_ENV === "dev" && { stack: err.stack }),
    });
  }

  static notFoundHandler(req: Request, res: Response, next: NextFunction): void {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    this.logger.error(`404 - ${error.message} - ${req.method} - ${req.ip}`);

    res.status(404).json({
      error: error.name,
      message: error.message,
    });
  }
}

// Authentication/Authorization Errors
export class AuthenticationError extends APIError {
  constructor(message = "Authentication failed", code = "AUTHENTICATION_FAILED") {
    super(message, 401, code);
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized - Insufficient permissions", code = "UNAUTHORIZED") {
    super(message, 403, code);
  }
}

export class ForbiddenError extends APIError {
  constructor(message = "Forbidden - Access denied", code = "FORBIDDEN") {
    super(message, 403, code);
  }
}

// Request/Input Errors
export class BadRequestError extends APIError {
  constructor(message = "Bad Request - Invalid parameters", code = "BAD_REQUEST") {
    super(message, 400, code);
  }
}

export class FormValidationError extends APIError {
  constructor(errors: Record<string, string>, message = "Form validation failed") {
    super(message, 422, "FORM_VALIDATION_ERROR", errors);
  }
}

export class ValidationError extends APIError {
  constructor(message = "Validation failed", code = "VALIDATION_ERROR") {
    super(message, 422, code);
  }
}

// Resource Errors
export class NotFoundError extends APIError {
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, code);
  }
}

export class ConflictError extends APIError {
  constructor(message = "Resource conflict", code = "CONFLICT") {
    super(message, 409, code);
  }
}

// Server/Infrastructure Errors
export class InternalServerError extends APIError {
  constructor(message = "Internal server error", code = "INTERNAL_SERVER_ERROR") {
    super(message, 500, code);
  }
}

export class DatabaseError extends APIError {
  constructor(message = "Database operation failed", code = "DATABASE_ERROR") {
    super(message, 500, code);
  }
}

export class ThirdPartyServiceError extends APIError {
  constructor(message = "Third party service error", code = "EXTERNAL_SERVICE_ERROR") {
    super(message, 502, code);
  }
}

// Rate Limiting
export class TooManyRequestsError extends APIError {
  constructor(message = "Too many requests", code = "RATE_LIMIT_EXCEEDED") {
    super(message, 429, code);
  }
}
