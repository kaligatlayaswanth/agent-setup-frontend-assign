import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching organizations from Django backend
export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchOrganizations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/organizations/list/');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch organizations');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating organization
export const createOrganization = createAsyncThunk(
  'organizations/createOrganization',
  async (organizationData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/organizations/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organizationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating organization
export const updateOrganization = createAsyncThunk(
  'organizations/updateOrganization',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/organizations/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update organization');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting organization
export const deleteOrganization = createAsyncThunk(
  'organizations/deleteOrganization',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/organizations/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete organization');
      }

      return id; // Return the deleted ID
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false
};

const organizationsSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch organizations
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create organization
      .addCase(createOrganization.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.creating = false;
        state.items.push(action.payload);
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Update organization
      .addCase(updateOrganization.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Delete organization
      .addCase(deleteOrganization.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = organizationsSlice.actions;
export default organizationsSlice.reducer;
