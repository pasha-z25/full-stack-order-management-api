import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column({
    type: 'decimal',
    default: 100,
    precision: 10,
    scale: 2,
    nullable: false,
    transformer: {
      to(value: number): number {
        return value;
      },
      from(value: string): number {
        return parseFloat(value);
      },
    },
  })
  balance!: number;

  @Column({ type: 'timestamp', nullable: false })
  registered!: Date | string;
}
