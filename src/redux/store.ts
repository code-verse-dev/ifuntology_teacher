import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authSlice } from "./services/apiSlices/authSlice";
import { productSlice } from "./services/apiSlices/productSlice";
import userReducer from "./services/Slices/userSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { categorySlice } from "./services/apiSlices/categorySlice";

const rootReducer = combineReducers({
  user: userReducer,
  [authSlice.reducerPath]: authSlice.reducer,
  [productSlice.reducerPath]: productSlice.reducer,
  [categorySlice.reducerPath]: categorySlice.reducer,
});

const persistConfig = {
  key: "ifuntology_teacher",
  storage,
  blacklist: [
    authSlice.reducerPath,
    productSlice.reducerPath,
    categorySlice.reducerPath,
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(authSlice.middleware)
      .concat(productSlice.middleware)
      .concat(categorySlice.middleware),
});

setupListeners(store.dispatch);
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
