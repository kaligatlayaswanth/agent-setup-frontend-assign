import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching data sources from Django backend
export const fetchDataSources = createAsyncThunk(
  'dataSources/fetchDataSources',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/data-sources/list/');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch data sources');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for creating data source (file upload)
export const createDataSource = createAsyncThunk(
  'dataSources/createDataSource',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:8000/data-sources/', {
        method: 'POST',
        body: formData, // FormData for file upload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create data source');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating data source
export const updateDataSource = createAsyncThunk(
  'dataSources/updateDataSource',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/data-sources/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update data source');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for deleting data source
export const deleteDataSource = createAsyncThunk(
  'dataSources/deleteDataSource',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/data-sources/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete data source');
      }

      return id; // Return the deleted ID
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for testing data source
export const testDataSource = createAsyncThunk(
  'dataSources/testDataSource',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/data-sources/${id}/test/`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to test data source');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for previewing data source
export const previewDataSource = createAsyncThunk(
  'dataSources/previewDataSource',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:8000/data-sources/${id}/preview/`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to preview data source');
      }

      return await response.json();
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
  deleting: false,
  testing: false,
  previewing: false
};

const dataSourcesSlice = createSlice({
  name: 'dataSources',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch data sources
      .addCase(fetchDataSources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDataSources.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDataSources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create data source
      .addCase(createDataSource.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createDataSource.fulfilled, (state, action) => {
        state.creating = false;
        state.items.push(action.payload);
      })
      .addCase(createDataSource.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })
      // Update data source
      .addCase(updateDataSource.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateDataSource.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(updateDataSource.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Delete data source
      .addCase(deleteDataSource.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteDataSource.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      .addCase(deleteDataSource.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })
      // Test data source
      .addCase(testDataSource.pending, (state) => {
        state.testing = true;
        state.error = null;
      })
      .addCase(testDataSource.fulfilled, (state) => {
        state.testing = false;
      })
      .addCase(testDataSource.rejected, (state, action) => {
        state.testing = false;
        state.error = action.payload;
      })
      // Preview data source
      .addCase(previewDataSource.pending, (state) => {
        state.previewing = true;
        state.error = null;
      })
      .addCase(previewDataSource.fulfilled, (state) => {
        state.previewing = false;
      })
      .addCase(previewDataSource.rejected, (state, action) => {
        state.previewing = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = dataSourcesSlice.actions;
export default dataSourcesSlice.reducer;
