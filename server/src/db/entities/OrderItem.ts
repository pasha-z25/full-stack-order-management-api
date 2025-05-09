import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Order } from './Order';
import { Product } from './Product';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Product, { eager: true })
  product!: Product;

  @Column({ type: 'integer', nullable: false })
  quantity!: number;

  @ManyToOne(() => Order, (order: Order) => order.items)
  order!: Order;
}
