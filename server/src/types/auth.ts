import type { SafeUser } from '@db/entities/User';

export interface RegistrationInput {
  name: string;
  email: string;
  password: string;
  phone: string | null;
  address: string | null;
}

export interface AuthSession {
  user: SafeUser;
  accessToken: string;
}
