import type { User } from '@utils/types';

import { createAsyncThunk, createSlice, isPending, isRejected } from '@reduxjs/toolkit';

import type { BasicApiState } from '../types';

export interface UsersState extends BasicApiState {
  allUsers: User[] | null;
  selectedUser: User | null;
}

const initialState: UsersState = {
  allUsers: null,
  selectedUser: null,
  error: null,
  loading: false,
};

export const getUsers = createAsyncThunk(
  'users/getUsers',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (_, { extra: { client, apiEndpoints } }: { extra: any }) => {
    return await client.get(apiEndpoints.allUsers);
  }
);

export const getUser = createAsyncThunk(
  'users/getUser',
  async (
    payload: string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.get(apiEndpoints.oneUser(payload));
  }
);

export const addUser = createAsyncThunk(
  'users/addUser',
  async (
    payload: BodyInit,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.post(apiEndpoints.allUsers, payload);
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (
    payload: Partial<User>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { extra: { client, apiEndpoints } }: { extra: any }
  ) => {
    return await client.patch(apiEndpoints.oneUser(payload.id), JSON.stringify(payload));
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(getUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addMatcher(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (action): action is any => isPending(action) && action.type.startsWith('users/'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (action): action is any => isRejected(action) && action.type.startsWith('users/'),
        (state, action) => {
          state.error = action.error.message;
          state.loading = false;
        }
      );
  },
});

export default usersSlice.reducer;

export const getAllUsers = (state: { users: UsersState }) => state.users.allUsers;

export const getSelectedUser = (state: { users: UsersState }) => state.users.selectedUser;

export const getUsersStatus = (state: { users: UsersState }) => ({
  loading: state.users.loading,
  error: state.users.error,
});
