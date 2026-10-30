import type { ColumnOptions, ValueTransformer } from 'typeorm';

export const moneyTransformer: ValueTransformer = {
  to(value: number): number {
    return value;
  },
  from(value: string): number {
    return parseFloat(value);
  },
};

export const moneyColumn = (options: ColumnOptions = {}): ColumnOptions => ({
  type: 'decimal',
  precision: 10,
  scale: 2,
  nullable: false,
  transformer: moneyTransformer,
  ...options,
});
