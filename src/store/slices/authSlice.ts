import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  role: 'student' | 'admin' | 'porter' | 'director'
  firstName?: string
  lastName?: string
  profile?: any
  accommodation?: any
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  loading: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  loading: false,
}

// Async thunks
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()
      
      if (response.ok) {
        return data.data
      } else {
        return rejectWithValue(data.error || 'Failed to fetch profile')
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch profile')
    }
  }
)

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      state.isLoading = false
    },
    loginFailure: (state) => {
      state.isLoading = false
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.isLoading = false
      state.loading = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.isAuthenticated = true
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer
