export type AuthErrorType =
  | typeof AuthServiceError
  | typeof AuthenticationError
  | typeof ValidationError
  | typeof ConflictError;

export class AuthServiceError extends Error {
  constructor(message: string, public code: string = "UNKNOWN_ERROR", public status: number = 500) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthenticationError extends AuthServiceError {
  constructor(message = "Authentication error") {
    super(message, "AUTHENTICATION_ERROR", 401);
  }
}

export class ValidationError extends AuthServiceError {
  constructor(message: string, public code: string = "VALIDATION_ERROR", public errors: Record<string, string> = {}) {
    super(message, code, 400);
  }
}

export class ConflictError extends AuthServiceError {
  constructor(message = "Conflict error") {
    super(message, "CONFLICT_ERROR", 409);
  }
}
