import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import collectionReducer from './slices/collection';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    collection: collectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 