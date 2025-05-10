import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { OrderItem } from './OrderItem';
import { User } from './User';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('userId_index')
  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items!: OrderItem[];

  @Column({ type: 'decimal', nullable: false })
  totalPrice!: number;

  @Column({
    type: 'varchar',
    nullable: false,
    default: 'pending',
    enum: ['pending', 'shipped', 'delivered', 'canceled'],
  })
  status!: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
