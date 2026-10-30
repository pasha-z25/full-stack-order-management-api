const MIN_JWT_SECRET_LENGTH = 32;

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret || secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(
      'JWT_SECRET must be set to a random string of at least 32 characters'
    );
  }

  return secret;
}
