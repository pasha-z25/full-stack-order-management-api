import { EntityTarget, ObjectLiteral, Repository } from 'typeorm';

import { AppDataSource } from '@/db';

export const getRepository = <T extends ObjectLiteral>(
  entity: EntityTarget<T>
): Repository<T> => {
  return AppDataSource.getRepository(entity);
};
