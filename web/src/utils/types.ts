export type AnyObj = {
  [key: string]: unknown;
};

export enum Lang {
  EN = 'en',
  UA = 'ua',
  RU = 'ru',
}

export interface IPageProps {
  params: Promise<{
    lng: Lang;
    id?: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface IViewProps {
  lang: Lang;
  id?: string | number;
}

export interface ApiOptionsType extends RequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit;
}

export interface ApiClient {
  (path: string, options?: ApiOptionsType): Promise<unknown>;
  get: (endpoint: string, config?: ApiOptionsType) => Promise<unknown>;
  post: (endpoint: string, body: BodyInit, config?: ApiOptionsType) => Promise<unknown>;
  delete: (endpoint: string, config?: ApiOptionsType) => Promise<unknown>;
  patch: (endpoint: string, body: BodyInit, config?: ApiOptionsType) => Promise<unknown>;
}

export interface ApiEndpoints {
  authLogin: string;
  allUsers: string;
  oneUser: (id: string | number) => string;
  allOrders: string;
  oneOrder: (id: string | number) => string;
  allProducts: string;
  oneProduct: (id: string | number) => string;
}

export enum OrderStatus {
  PENDING = 'pending',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELED = 'canceled',
}

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  password?: string;
  phone?: string | null;
  address?: string | null;
  balance: number;
  registered: Date | string;
};

export type Product = {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
  stock: number;
};

export type OrderItem = {
  id: string;
  product: Product;
  quantity: number;
  order: Order;
};

export type Order = {
  id: string;
  user: User;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
};
