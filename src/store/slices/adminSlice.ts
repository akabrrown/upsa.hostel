import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  indexNumber: string
  programOfStudy: string
  yearOfStudy: number
  accommodation?: {
    hostel: {
      name: string
    }
    room: {
      roomNumber: string
    }
  }
  paymentStatus: 'paid' | 'pending' | 'overdue'
}

interface AdminState {
  students: Student[]
  loading: boolean
  error: string | null
}

const initialState: AdminState = {
  students: [],
  loading: false,
  error: null,
}

// Async thunks
export const fetchStudents = createAsyncThunk(
  'admin/fetchStudents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/students')
      const data = await response.json()
      
      if (response.ok) {
        return data.data || []
      } else {
        return rejectWithValue(data.error || 'Failed to fetch students')
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch students')
    }
  }
)

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchStudents
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false
        state.students = action.payload
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = adminSlice.actions
export default adminSlice.reducer
