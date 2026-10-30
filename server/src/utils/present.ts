import type { Order, User } from '@db/entities';
import type { SafeUser } from '@db/entities/User';

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    address: user.address,
    balance: user.balance,
  };
}

export function toPublicOrder(order: Order) {
  return {
    id: order.id,
    user: toSafeUser(order.user),
    items: (order.items ?? []).map(({ id, product, quantity }) => ({
      id,
      product,
      quantity,
    })),
    totalPrice: order.totalPrice,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
