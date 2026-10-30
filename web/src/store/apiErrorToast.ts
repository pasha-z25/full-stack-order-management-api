import { isRejected, type Middleware } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';

const toastedPrefixes = ['auth/', 'orders/'];

export const apiErrorToast: Middleware = () => (next) => (action) => {
  const result = next(action);

  if (
    typeof window !== 'undefined' &&
    isRejected(action) &&
    toastedPrefixes.some((prefix) => action.type.startsWith(prefix)) &&
    action.error.message
  ) {
    toast.error(action.error.message);
  }

  return result;
};
