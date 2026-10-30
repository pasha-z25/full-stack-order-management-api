import type { User } from '@utils/types';

import { createAsyncThunk, createSlice, isPending, isRejected } from '@reduxjs/toolkit';
import { AUTH_TOKEN_COOKIE } from '@utils/constants';
import Cookies from 'js-cookie';

import type { BasicApiState } from '../types';

interface LoginPayload {
  email: string;
  password: string;
}

// type ExtraParamType = {
//   client: ApiClient;
//   apiEndpoints: ApiEndpoints;
// };

// export const login = createAsyncThunk('auth/login', async (payload: LoginPayload, thunkAPI) => {
//   const { client, apiEndpoints } = thunkAPI.extra as ExtraParamType;
//   return await client.post(apiEndpoints.authLogin, JSON.stringify(payload));
// });

export const login = createAsyncThunk(
  'auth/login',
  async (
    payload: LoginPayload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.post(apiEndpoints.authLogin, JSON.stringify(payload));
  }
);

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export const register = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password, phone, address }: RegisterPayload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.post(
      apiEndpoints.authRegister,
      JSON.stringify({
        name,
        email,
        password,
        phone: phone?.trim() || null,
        address: address?.trim() || null,
      })
    );
  }
);

export interface AuthState extends BasicApiState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.error = null;
      state.loading = false;
      Cookies.remove(AUTH_TOKEN_COOKIE);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
        Cookies.set(AUTH_TOKEN_COOKIE, action.payload.accessToken);
      })
      .addCase(register.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
        state.error = null;
        Cookies.set(AUTH_TOKEN_COOKIE, action.payload.accessToken);
      })
      .addMatcher(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (action): action is any => isPending(action) && action.type.startsWith('auth/'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (action): action is any => isRejected(action) && action.type.startsWith('auth/'),
        (state, action) => {
          state.error = action.error.message;
          state.user = null;
          state.loading = false;
          Cookies.remove(AUTH_TOKEN_COOKIE);
        }
      );
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;

export const getAuthorizedUser = (state: { auth: AuthState }) => state.auth.user;

export const getAuthState = (state: { auth: AuthState }) => state.auth;
