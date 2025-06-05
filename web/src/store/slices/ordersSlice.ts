import type { Order } from '@utils/types';

import { createAsyncThunk, createSlice, isPending, isRejected } from '@reduxjs/toolkit';

import type { BasicApiState } from '../types';

export interface OrdersState extends BasicApiState {
  allOrders: Order[] | null;
  selectedOrder: Order | null;
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

export const getOrder = createAsyncThunk(
  'orders/getOrder',
  async (
    payload: string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.get(apiEndpoints.oneOrder(payload));
  }
);

export const deleteOrder = createAsyncThunk(
  'orders/deleteOrder',
  async (
    payload: string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.delete(apiEndpoints.oneOrder(payload));
  }
);

export const updateOrder = createAsyncThunk(
  'orders/updateOrder',
  async (
    payload: Partial<Order>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.patch(apiEndpoints.oneOrder(payload.id), JSON.stringify(payload));
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
      .addCase(getOrder.fulfilled, (state, action) => {
        state.selectedOrder = action.payload;
        state.error = null;
        state.loading = false;
      })
      // .addCase(addOrder.fulfilled, (state, action) => {
      //   console.log('!!! Action addOrder', action);
      //   state.error = null;
      //   state.loading = false;
      // })
      .addCase(deleteOrder.fulfilled, (state, action) => {
        console.log('!!! Action deleteOrder', action);
        state.error = null;
        state.loading = false;
      })
      .addCase(updateOrder.fulfilled, (state, action) => {
        console.log('!!! Action updateOrder', action);
        // state.selectedOrder = action.payload;
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
