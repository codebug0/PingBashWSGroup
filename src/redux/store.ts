import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/stateSlice';
import messageSlice from './slices/messageSlice';

const store = configureStore({
  reducer: {
    state: counterReducer,
    msg: messageSlice
  }, middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;