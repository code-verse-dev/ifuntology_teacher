import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authSlice } from "./services/apiSlices/authSlice";
import { productSlice } from "./services/apiSlices/productSlice";
import userReducer from "./services/Slices/userSlice";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import { categorySlice } from "./services/apiSlices/categorySlice";
import { cartSlice } from "./services/apiSlices/cartSlice";
import { paymentSlice } from "./services/apiSlices/paymentSlice";
import { couponSlice } from "./services/apiSlices/couponSlice";
import { orderSlice } from "./services/apiSlices/orderSlice";
import { availabilitySlice } from "./services/apiSlices/availabilitySlice";
import { sessionSlice } from "./services/apiSlices/sessionSlice";

const rootReducer = combineReducers({
  user: userReducer,
  [authSlice.reducerPath]: authSlice.reducer,
  [productSlice.reducerPath]: productSlice.reducer,
  [categorySlice.reducerPath]: categorySlice.reducer,
  [cartSlice.reducerPath]: cartSlice.reducer,
  [paymentSlice.reducerPath]: paymentSlice.reducer,
  [couponSlice.reducerPath]: couponSlice.reducer,
  [orderSlice.reducerPath]: orderSlice.reducer,
  [availabilitySlice.reducerPath]: availabilitySlice.reducer,
  [sessionSlice.reducerPath]: sessionSlice.reducer,
});

const persistConfig = {
  key: "ifuntology_teacher",
  storage,
  blacklist: [
    authSlice.reducerPath,
    productSlice.reducerPath,
    categorySlice.reducerPath,
    cartSlice.reducerPath,
    paymentSlice.reducerPath,
    couponSlice.reducerPath,
    orderSlice.reducerPath,
    availabilitySlice.reducerPath,
    sessionSlice.reducerPath,
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
      .concat(categorySlice.middleware)
      .concat(cartSlice.middleware)
      .concat(paymentSlice.middleware)
      .concat(couponSlice.middleware)
      .concat(orderSlice.middleware)
      .concat(availabilitySlice.middleware)
      .concat(sessionSlice.middleware)
      ,
});

setupListeners(store.dispatch);
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
