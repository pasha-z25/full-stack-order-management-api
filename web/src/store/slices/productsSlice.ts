import type { Product } from '@utils/types';

import { createAsyncThunk, createSlice, isPending, isRejected } from '@reduxjs/toolkit';

import type { BasicApiState } from '../types';

export interface ProductsState extends BasicApiState {
  allProducts: Product[] | null;
  selectedProduct: Product | null;
}

const initialState: ProductsState = {
  allProducts: null,
  selectedProduct: null,
  error: null,
  loading: false,
};

export const getProducts = createAsyncThunk(
  'products/getProducts',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_, { extra: { client, apiEndpoints } }: { extra: any }) => {
    return await client.get(apiEndpoints.allProducts);
  }
);

export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (
    payload: string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.get(apiEndpoints.oneProduct(payload));
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (
    payload: string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.delete(apiEndpoints.oneProduct(payload));
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async (
    payload: Partial<Product>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.patch(apiEndpoints.oneProduct(payload.id), JSON.stringify(payload));
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getProducts.fulfilled, (state, action) => {
        state.allProducts = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.selectedProduct = action.payload;
        state.error = null;
        state.loading = false;
      })
      // .addCase(addProduct.fulfilled, (state, action) => {
      //   console.log('!!! Action addProduct', action);
      //   state.error = null;
      //   state.loading = false;
      // })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        console.log('!!! Action deleteProduct', action);
        state.error = null;
        state.loading = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        console.log('!!! Action updateProduct', action);
        // state.selectedProduct = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addMatcher(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (action): action is any => isPending(action) && action.type.startsWith('products/'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (action): action is any => isRejected(action) && action.type.startsWith('products/'),
        (state, action) => {
          state.error = action.error.message;
          state.loading = false;
        }
      );
  },
});

export default productsSlice.reducer;

export const getAllProducts = (state: { products: ProductsState }) => state.products.allProducts;

export const getSelectedProduct = (state: { products: ProductsState }) =>
  state.products.selectedProduct;

export const getProductsStatus = (state: { products: ProductsState }) => ({
  loading: state.products.loading,
  error: state.products.error,
});
