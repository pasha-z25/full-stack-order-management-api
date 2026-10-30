import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

import { moneyColumn } from '../money';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', nullable: false })
  title!: string;

  @Column(moneyColumn())
  price!: number;

  @Column({ type: 'text', nullable: false })
  description!: string;

  @Index()
  @Column({ type: 'varchar', nullable: false })
  category!: string;

  @Column({ type: 'varchar', nullable: false })
  image!: string;

  @Column({ type: 'jsonb', nullable: false })
  rating!: { rate: number; count: number };

  @Column({ type: 'integer', nullable: false })
  stock!: number;
}
