import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import recentListsReducer from './slices/recentlyVisitedListsSlice.js';

const store = configureStore({
    reducer: {
        auth: authReducer,
        recentLists: recentListsReducer
    },
});

export default store;
