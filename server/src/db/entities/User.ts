import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { moneyColumn } from '../money';

export type SafeUser = Omit<User, 'password' | 'registered'>;

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  @Index()
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  password!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: false })
  avatar!: string;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @Column(moneyColumn({ default: 100 }))
  balance!: number;

  @Column({ type: 'timestamp', nullable: false })
  registered!: Date | string;
}
