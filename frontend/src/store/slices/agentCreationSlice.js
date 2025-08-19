import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOpen: false,
  currentStep: 1,
  selectedAgentInstance: null,
  selectedOrganization: null,
  connectedDataSources: [],
  completedAgents: [], // New state for completed agents
  loading: false,
  error: null,
  success: null
};

const agentCreationSlice = createSlice({
  name: 'agentCreation',
  initialState,
  reducers: {
    openDialog: (state) => {
      state.isOpen = true;
      state.currentStep = 1;
      state.selectedAgentInstance = null;
      state.selectedOrganization = null;
      state.connectedDataSources = [];
      state.error = null;
      state.success = null;
    },
    closeDialog: (state) => {
      state.isOpen = false;
      state.currentStep = 1;
      state.selectedAgentInstance = null;
      state.selectedOrganization = null;
      state.connectedDataSources = [];
      state.error = null;
      state.success = null;
    },
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    selectAgentInstance: (state, action) => {
      state.selectedAgentInstance = action.payload;
    },
    selectOrganization: (state, action) => {
      state.selectedOrganization = action.payload;
      // Reset agent instance when organization changes
      state.selectedAgentInstance = null;
    },
    connectDataSource: (state, action) => {
      // Only allow one data source to be connected
      state.connectedDataSources = [action.payload];
    },
    disconnectDataSource: (state, action) => {
      state.connectedDataSources = state.connectedDataSources.filter(
        ds => ds.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.success = null;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
      state.error = null;
    },
    resetDialog: (state) => {
      state.currentStep = 1;
      state.selectedAgentInstance = null;
      state.selectedOrganization = null;
      state.connectedDataSources = [];
      state.loading = false;
      state.error = null;
      state.success = null;
    },
    addCompletedAgent: (state, action) => {
      // Check if agent already exists to avoid duplicates
      const existingIndex = state.completedAgents.findIndex(
        agent => agent.id === action.payload.id
      );
      if (existingIndex !== -1) {
        // Update existing agent
        state.completedAgents[existingIndex] = action.payload;
      } else {
        // Add new agent
        state.completedAgents.push(action.payload);
      }
    },
    updateAgentArticles: (state, action) => {
      const { agentId, hasArticles } = action.payload;
      const agentIndex = state.completedAgents.findIndex(
        agent => agent.id === agentId
      );
      if (agentIndex !== -1) {
        state.completedAgents[agentIndex].hasArticles = hasArticles;
      }
    }
  }
});

export const {
  openDialog,
  closeDialog,
  setCurrentStep,
  selectAgentInstance,
  selectOrganization,
  connectDataSource,
  disconnectDataSource,
  setLoading,
  setError,
  setSuccess,
  resetDialog,
  addCompletedAgent,
  updateAgentArticles
} = agentCreationSlice.actions;

export default agentCreationSlice.reducer;
