import { configureStore } from '@reduxjs/toolkit';
import agentCreationReducer from './slices/agentCreationSlice';
import agentsReducer from './slices/agentsSlice';
import dataSourcesReducer from './slices/dataSourcesSlice';
import organizationsReducer from './slices/organizationsSlice';

export const store = configureStore({
  reducer: {
    agentCreation: agentCreationReducer,
    agents: agentsReducer,
    dataSources: dataSourcesReducer,
    organizations: organizationsReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST']
      }
    })
});
