import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Temporarily commented out until Agent model is migrated
// Async thunk for fetching agents from Django backend
// export const fetchAgents = createAsyncThunk(
//   'agents/fetchAgents',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await fetch('http://localhost:8000/agents/');
//       
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Failed to fetch agents');
//       }
//
//       return await response.json();
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// Async thunk for fetching agent instances for a specific organization
export const fetchAgentInstancesForOrganization = createAsyncThunk(
  'agents/fetchAgentInstancesForOrganization',
  async (organizationId, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/agent-instances/list/');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch agent instances');
      }

      const allInstances = await response.json();
      // Filter instances for the specific organization
      const organizationInstances = allInstances.filter(instance => instance.organization === organizationId);
      
      return organizationInstances;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating agent instances
export const createAgentInstance = createAsyncThunk(
  'agents/createAgentInstance',
  async (agentData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/agent-instances/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create agent instance');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for linking data source to agent instance
export const linkDataSourceToAgent = createAsyncThunk(
  'agents/linkDataSourceToAgent',
  async ({ instanceId, datasourceId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/agent-instances/${instanceId}/datasources/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ datasource_id: datasourceId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link data source');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating articles
export const createArticles = createAsyncThunk(
  'agents/createArticles',
  async ({ instanceId, articles = [] }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/agent-instances/${instanceId}/articles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_instance_id: instanceId,
          articles: articles
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create articles');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching articles for a given agent instance
export const fetchArticlesForAgent = createAsyncThunk(
  'agents/fetchArticlesForAgent',
  async (instanceId, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/narratives/agent/${instanceId}/`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch articles');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  agentInstances: [],
  organizationAgentInstances: [], // New state for organization-specific instances
  loading: false,
  error: null,
  creatingInstance: false,
  linkingDataSource: false,
  creatingArticles: false,
  loadingOrganizationInstances: false,
  loadingArticles: false,
  articlesByAgent: {}
};

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addAgentInstance: (state, action) => {
      state.agentInstances.push(action.payload);
    },
         updateAgentArticles: (state, action) => {
       // This action is handled in the agentCreationSlice
       // Keeping it here for compatibility
     }
  },
  extraReducers: (builder) => {
    builder
      // Create agent instance
      .addCase(createAgentInstance.pending, (state) => {
        state.creatingInstance = true;
        state.error = null;
      })
      .addCase(createAgentInstance.fulfilled, (state, action) => {
        state.creatingInstance = false;
        state.agentInstances.push(action.payload);
      })
      .addCase(createAgentInstance.rejected, (state, action) => {
        state.creatingInstance = false;
        state.error = action.payload;
      })
      // Link data source
      .addCase(linkDataSourceToAgent.pending, (state) => {
        state.linkingDataSource = true;
        state.error = null;
      })
      .addCase(linkDataSourceToAgent.fulfilled, (state, action) => {
        state.linkingDataSource = false;
        // Update the agent instance with the linked data source
        const instanceIndex = state.agentInstances.findIndex(
          instance => instance.id === action.payload.instance_id
        );
        if (instanceIndex !== -1) {
          state.agentInstances[instanceIndex].datasource = action.payload.datasource_id;
          state.agentInstances[instanceIndex].mapping_config = action.payload.mapping_config;
        }
      })
      .addCase(linkDataSourceToAgent.rejected, (state, action) => {
        state.linkingDataSource = false;
        state.error = action.payload;
      })
      // Create articles
      .addCase(createArticles.pending, (state) => {
        state.creatingArticles = true;
        state.error = null;
      })
      .addCase(createArticles.fulfilled, (state, action) => {
        state.creatingArticles = false;
        const { agent_instance_id, articles } = action.payload || {};
        if (agent_instance_id && Array.isArray(articles)) {
          state.articlesByAgent[agent_instance_id] = articles;
        }
      })
      .addCase(createArticles.rejected, (state, action) => {
        state.creatingArticles = false;
        state.error = action.payload;
      })
      // Fetch organization agent instances
      .addCase(fetchAgentInstancesForOrganization.pending, (state) => {
        state.loadingOrganizationInstances = true;
        state.error = null;
      })
      .addCase(fetchAgentInstancesForOrganization.fulfilled, (state, action) => {
        state.loadingOrganizationInstances = false;
        state.organizationAgentInstances = action.payload;
      })
      .addCase(fetchAgentInstancesForOrganization.rejected, (state, action) => {
        state.loadingOrganizationInstances = false;
        state.error = action.payload;
      })
      // Fetch articles for agent
      .addCase(fetchArticlesForAgent.pending, (state) => {
        state.loadingArticles = true;
        state.error = null;
      })
      .addCase(fetchArticlesForAgent.fulfilled, (state, action) => {
        state.loadingArticles = false;
        const { agent_instance_id, articles } = action.payload || {};
        if (agent_instance_id && Array.isArray(articles)) {
          state.articlesByAgent[agent_instance_id] = articles;
        }
      })
      .addCase(fetchArticlesForAgent.rejected, (state, action) => {
        state.loadingArticles = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, addAgentInstance, updateAgentArticles } = agentsSlice.actions;
export default agentsSlice.reducer;
