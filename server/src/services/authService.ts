import type { Repository } from 'typeorm';

import { User } from '@db/entities';
import { getRepository } from '@db/repository';
import {
  BCRYPT_SALT_ROUNDS,
  DUMMY_PASSWORD_HASH,
  INVALID_LOGIN_MESSAGE,
  USER_AVATAR_SOURCE,
} from '@utils/constants';
import {
  isUniqueViolation,
  normalizeEmail,
  parseRegistration,
} from '@utils/helpers';
import { getJwtSecret } from '@utils/jwtSecret';
import { toSafeUser } from '@utils/present';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';

import { ConflictError, UnauthorizedError } from '@/errors/httpError';
import type { AuthSession } from '@/types/auth';
import type { MyJwtPayload } from '@/types/jwt';

export class AuthService {
  private userRepository: Repository<User> = getRepository(User);

  async login(email: string, userPassword: string): Promise<AuthSession> {
    const user = await this.userRepository.findOneBy({
      email: normalizeEmail(email),
    });
    const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
    const isPasswordValid = await bcrypt.compare(userPassword, passwordHash);

    if (!user || !isPasswordValid) {
      throw new UnauthorizedError(INVALID_LOGIN_MESSAGE);
    }

    return this.issueSession(user);
  }

  async register(input: unknown): Promise<AuthSession> {
    const { name, email, password, phone, address } = parseRegistration(input);

    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new ConflictError(`⚠️ User with email ${email} already exists`);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = this.userRepository.create({
      name,
      email,
      password: passwordHash,
      phone,
      address,
      avatar: `${USER_AVATAR_SOURCE}&seed=${randomUUID()}`,
      balance: 100,
      registered: new Date(),
    });

    try {
      const savedUser = await this.userRepository.save(user);
      return this.issueSession(savedUser);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictError(`⚠️ User with email ${email} already exists`);
      }
      throw error;
    }
  }

  private issueSession(user: User): AuthSession {
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    return { user: toSafeUser(user), accessToken: token };
  }

  verifyToken(token: string): MyJwtPayload {
    const jwtSecret = getJwtSecret();

    try {
      const decoded = jwt.verify(token, jwtSecret) as MyJwtPayload;
      return decoded;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}

export default new AuthService();
