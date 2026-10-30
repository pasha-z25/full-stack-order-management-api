import type { ApiEndpoints } from './types';

export const DOCKER_API_URL = process.env.API_URL || 'http://backend_server:8888/api';

export const BROWSER_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8888/api';

export const AUTH_TOKEN_COOKIE = 'token';

export const authRoutes = ['login', 'register'];

export const protectedRoutes = ['users', 'orders'];

export const protectedApiPrefixes = ['/orders', '/users'];

export const apiEndpoints: ApiEndpoints = {
  authLogin: '/auth/login',
  authRegister: '/auth/register',
  allOrders: '/orders',
  orderLine: (orderId: string, productId: string) => `/orders/${orderId}/product/${productId}`,
  allProducts: '/products',
  oneProduct: (id: string | number) => `/products/${id}`,
  allUsers: '/users',
  oneUser: (id: string | number) => `/users/${id}`,
};
