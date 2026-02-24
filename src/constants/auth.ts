/** Name of the httpOnly cookie storing the JWT token. */
export const AUTH_COOKIE_NAME = "token";

/** JWT token lifetime (e.g. '7d' for 7 days). */
export const JWT_EXPIRY = "7d";

/** Cookie max-age in seconds (7 days). */
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

/** Number of bcrypt salt rounds used for password hashing. */
export const BCRYPT_SALT_ROUNDS = 10;
