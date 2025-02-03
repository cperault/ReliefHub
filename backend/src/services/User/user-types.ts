export type UserErrorType =
  | typeof UserServiceError
  | typeof UserNotFoundError
  | typeof UserExistsError
  | typeof InvalidUserDataError;

export class UserServiceError extends Error {
  constructor(message: string, public code: string = "UNKNOWN_ERROR", public status: number = 500) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserNotFoundError extends UserServiceError {
  constructor(message = "User not found") {
    super(message, "USER_NOT_FOUND", 404);
  }
}

export class UserExistsError extends UserServiceError {
  constructor(message = "User already exists") {
    super(message, "USER_EXISTS", 409);
  }
}

export class InvalidUserDataError extends UserServiceError {
  constructor(message: string) {
    super(message, "INVALID_DATA", 400);
  }
}
