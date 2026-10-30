import type { SafeUser } from '@db/entities/User';
import type { Repository } from 'typeorm';

import { User } from '@db/entities';
import { getRepository } from '@db/repository';
import { toSafeUser } from '@utils/present';

export class UserService {
  private userRepository: Repository<User> = getRepository(User);

  async getAllUsers(): Promise<SafeUser[]> {
    const users = await this.userRepository.find();
    return users.map(toSafeUser);
  }

  async getUserById(userId: string): Promise<SafeUser | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    return user ? toSafeUser(user) : null;
  }
}

export default new UserService();
