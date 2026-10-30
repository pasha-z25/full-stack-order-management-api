export const BCRYPT_SALT_ROUNDS = 8;

export const INVALID_LOGIN_MESSAGE = '⚠️ Invalid email or password';

// Cost matches BCRYPT_SALT_ROUNDS. Compared only when the email is unknown,
// so that case takes about as long as a real password check.
export const DUMMY_PASSWORD_HASH =
  '$2b$08$lBUfehureiIcFRhDke7H0OqCFjZXp.P7T71oajQptWukF6q2Pz6y6';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 6;

export const MAX_PASSWORD_LENGTH = 72;

export const CUSTOM_DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const USER_AVATAR_SOURCE =
  'https://api.dicebear.com/9.x/avataaars/svg?size=256&mouth=default,smile,tongue,serious,twinkle';
