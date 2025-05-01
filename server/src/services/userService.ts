import { User } from '@/db/entities';
import { getRepository } from '@/db/repository';
import { Repository } from 'typeorm';

export class UserService {
  private userRepository: Repository<User> = getRepository(User);

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserById(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
    });
  }
}
