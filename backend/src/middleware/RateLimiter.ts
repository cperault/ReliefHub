import rateLimit, { RateLimitRequestHandler, Options } from "express-rate-limit";

const RATE_LIMITS = {
  AUTH: {
    DEV: 100,
    PROD: 5,
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  },
  PROFILE: {
    DEFAULT: 30,
    WINDOW_MS: 15 * 60 * 1000,
  },
  API: {
    DEFAULT: 100,
    WINDOW_MS: 15 * 60 * 1000,
  },
  ADMIN: {
    DEFAULT: 50,
    ELEVATED: 300,
    WINDOW_MS: 15 * 60 * 1000,
  },
} as const;

class TooManyRequestsError extends Error {
  status: number;
  code: string;

  constructor() {
    super("Too many requests, please try again later.");
    this.name = "TooManyRequestsError";
    this.status = 429;
    this.code = "TOO_MANY_REQUESTS";
  }
}

const createLimiter = (options: Partial<Options>): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: RATE_LIMITS.API.WINDOW_MS,
    max: RATE_LIMITS.API.DEFAULT,
    handler: (req, res) => {
      const error = new TooManyRequestsError();
      res.status(error.status).json({
        error: error.name,
        message: error.message,
        code: error.code,
      });
    },
    ...options,
  });
};

export const RateLimiter: Record<string, RateLimitRequestHandler> = {
  auth: createLimiter({
    windowMs: RATE_LIMITS.AUTH.WINDOW_MS,
    max: () => {
      return process.env.NODE_ENV === "dev" ? RATE_LIMITS.AUTH.DEV : RATE_LIMITS.AUTH.PROD;
    },
  }),

  profile: createLimiter({
    windowMs: RATE_LIMITS.PROFILE.WINDOW_MS,
    max: RATE_LIMITS.PROFILE.DEFAULT,
  }),

  api: createLimiter({
    windowMs: RATE_LIMITS.API.WINDOW_MS,
    max: RATE_LIMITS.API.DEFAULT,
  }),

  admin: createLimiter({
    windowMs: RATE_LIMITS.ADMIN.WINDOW_MS,
    max: RATE_LIMITS.ADMIN.DEFAULT,
  }),

  test: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Test route rate limit exceeded. Please try again later." },
  }),
};
