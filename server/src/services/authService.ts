import type { Repository } from 'typeorm';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import type { SafeUser } from '@/db/entities/User';
import type { MyJwtPayload } from '@/types/jwt';

import { User } from '@/db/entities';
import { getRepository } from '@/db/repository';
import { JWT_SECRET_KEY } from '@/utils/constants';

export class AuthService {
  private userRepository: Repository<User> = getRepository(User);

  async login(
    email: string,
    userPassword: string
  ): Promise<{ user: SafeUser; accessToken: string }> {
    try {
      const user = await this.userRepository.findOneBy({ email });
      if (!user) return Promise.reject({ message: 'User not found' });

      const isPasswordValid = await bcrypt.compare(userPassword, user.password);
      if (!isPasswordValid)
        return Promise.reject({ message: 'Invalid password' });

      const payload = {
        sub: user.id,
        email: user.email,
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser }: { password: string } & SafeUser = user;

      const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '1h' });

      return { user: safeUser, accessToken: token };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // async register() {}

  verifyToken(token: string): MyJwtPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET_KEY) as MyJwtPayload;
      return decoded;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}
