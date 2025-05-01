import { AppDataSource } from '@/db';
import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

export const getRepository = <T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Repository<T> => {
  return AppDataSource.getRepository(entity);
};
