import { configureStore } from '@reduxjs/toolkit';
import { apiEndpoints } from '@utils/constants';
import { client } from '@utils/helpers';

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { combineReducers } from 'redux';
import {
  createMigrate,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
  type PersistedState,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { apiErrorToast } from './apiErrorToast';

import authReducer from './slices/authSlice';
import langReducer from './slices/langSlice';
// import ordersReducer from './slices/ordersSlice';
import productsReducer from './slices/productsSlice';
// import usersReducer from './slices/usersSlice';

const stripPersistedToken = (state: PersistedState): PersistedState => {
  if (!state || !('auth' in state)) return state;
  const stored = state as PersistedState & { auth?: { token?: string } };
  if (!stored.auth) return state;
  const { token: _token, ...auth } = stored.auth;
  return { ...stored, auth } as PersistedState;
};

const migrations = {
  1: stripPersistedToken,
};

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['auth'],
  migrate: createMigrate(migrations),
};

const rootReducer = combineReducers({
  auth: authReducer,
  lang: langReducer,
  // orders: ordersReducer,
  products: productsReducer,
  // users: usersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
      thunk: {
        extraArgument: {
          client,
          apiEndpoints,
        },
      },
    }).concat(apiErrorToast),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const persistor = persistStore(store);
