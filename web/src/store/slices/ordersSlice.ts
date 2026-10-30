import type { Order } from '@utils/types';

import { createAsyncThunk, createSlice, isPending, isRejected } from '@reduxjs/toolkit';

import type { BasicApiState } from '../types';

export interface OrdersState extends BasicApiState {
  allOrders: Order[] | null;
  selectedOrder: Order | null;
}

interface AddOrderPayload {
  productId: string;
  quantity?: number;
}

interface OrderLinePayload {
  orderId: string;
  productId: string;
}

interface UpdateOrderLinePayload extends OrderLinePayload {
  quantity: number;
}

function rememberOrder(state: OrdersState, order: Order) {
  state.selectedOrder = order;
  if (!state.allOrders) {
    state.allOrders = [order];
    return;
  }

  const index = state.allOrders.findIndex((item) => item.id === order.id);
  if (index === -1) state.allOrders.push(order);
  else state.allOrders[index] = order;
}

const initialState: OrdersState = {
  allOrders: null,
  selectedOrder: null,
  error: null,
  loading: false,
};

export const getOrders = createAsyncThunk(
  'orders/getOrders',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_, { extra: { client, apiEndpoints } }: { extra: any }) => {
    return await client.get(apiEndpoints.allOrders);
  }
);

export const addOrder = createAsyncThunk(
  'orders/addOrder',
  async (
    { productId, quantity = 1 }: AddOrderPayload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.post(apiEndpoints.allOrders, JSON.stringify({ productId, quantity }));
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (
    { orderId, productId }: OrderLinePayload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.delete(apiEndpoints.orderLine(orderId, productId));
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (
    { orderId, productId, quantity }: UpdateOrderLinePayload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.patch(
      apiEndpoints.orderLine(orderId, productId),
      JSON.stringify({ quantity })
    );
  }
);

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getOrders.fulfilled, (state, action) => {
        state.allOrders = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(addOrder.fulfilled, (state, action) => {
        rememberOrder(state, action.payload as Order);
        state.error = null;
        state.loading = false;
      })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        const order = action.payload as Order | undefined;
        if (order) {
          rememberOrder(state, order);
        } else {
          const { orderId } = action.meta.arg;
          state.allOrders = state.allOrders?.filter((item) => item.id !== orderId) ?? null;
          if (state.selectedOrder?.id === orderId) state.selectedOrder = null;
        }
        state.error = null;
        state.loading = false;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        rememberOrder(state, action.payload as Order);
        state.error = null;
        state.loading = false;
      })
      .addMatcher(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (action): action is any => isPending(action) && action.type.startsWith('orders/'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (action): action is any => isRejected(action) && action.type.startsWith('orders/'),
        (state, action) => {
          state.error = action.error.message;
          state.loading = false;
        }
      );
  },
});

export default ordersSlice.reducer;

export const getAllOrders = (state: { orders: OrdersState }) => state.orders.allOrders;

export const getSelectedOrder = (state: { orders: OrdersState }) => state.orders.selectedOrder;

export const getOrdersStatus = (state: { orders: OrdersState }) => ({
  loading: state.orders.loading,
  error: state.orders.error,
});
