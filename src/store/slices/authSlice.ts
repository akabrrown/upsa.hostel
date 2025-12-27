import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

interface User {
  id: string
  email: string
  role: 'student' | 'admin' | 'porter' | 'director'
  
  // Normalized Frontend Fields (camelCase)
  firstName?: string
  lastName?: string
  indexNumber?: string
  dateOfBirth?: string
  phoneNumber?: string
  gender?: string
  programOfStudy?: string
  yearOfStudy?: number
  academicYear?: string
  profileImageUrl?: string
  emergencyContact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  
  // Original Database Fields (snake_case)
  first_name?: string
  last_name?: string
  student_id?: string
  index_number?: string
  date_of_birth?: string
  phone_number?: string
  program?: string
  year_of_study?: number
  academic_year?: string
  profile_image_url?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relationship?: string
  
  // Status & Related
  accommodationStatus?: 'none' | 'pending' | 'allocated'
  accommodation_status?: string
  paymentStatus?: string
  payment_status?: string
  
  // Extended Data
  profile?: any
  accommodation?: any
  bookings?: any[]
  reservations?: any[]
  
  // Metadata
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

const normalizeUser = (data: any): User => {
  if (!data) return data
  
  // Normalize based on what might be present (merged from profiles or users table)
  // We use multiple checks to handle different sources (API, Direct DB, etc.)
  const normalized = {
    ...data,
    // Basic Info
    firstName: data.firstName || data.first_name || data.firstName || '',
    lastName: data.lastName || data.last_name || data.lastName || '',
    
    // Identifiers
    indexNumber: data.indexNumber || data.index_number || data.student_id || '',
    
    // Vital Stats (The ones reported as missing)
    dateOfBirth: data.dateOfBirth || data.date_of_birth || '',
    phoneNumber: data.phoneNumber || data.phone_number || data.phone || '',
    gender: data.gender || '',
    
    // Academic Info
    programOfStudy: data.programOfStudy || data.program || data.program_of_study || '',
    yearOfStudy: data.yearOfStudy !== undefined ? data.yearOfStudy : (data.year_of_study !== undefined ? data.year_of_study : null),
    academicYear: data.academicYear || data.academic_year || '',
    
    // UI related
    // UI related
    profileImageUrl: data.profileImageUrl || data.profile_image_url || '',
    accommodationStatus: data.accommodationStatus || data.accommodation_status || 'none',
    paymentStatus: data.paymentStatus || data.payment_status || 'none',
    
    // Status & Related Data
    accommodation: data.accommodation || null,
    bookings: data.bookings || [],
    reservations: data.reservations || [],
    payments: data.payments || [],
    
    // Nested Objects
    emergencyContact: {
      name: data.emergencyContact?.name || data.emergency_contact_name || data.emergencyContactName || '',
      phone: data.emergencyContact?.phone || data.emergency_contact_phone || data.emergencyContactPhone || '',
      relationship: data.emergencyContact?.relationship || data.emergency_contact_relationship || data.emergencyContactRelationship || ''
    }
  }

  // Ensure snake_case aliases also exist for backward compatibility or backend use
  return {
    ...normalized,
    first_name: normalized.firstName,
    last_name: normalized.lastName,
    index_number: normalized.indexNumber,
    date_of_birth: normalized.dateOfBirth,
    phone_number: normalized.phoneNumber,
    program: normalized.programOfStudy,
    year_of_study: normalized.yearOfStudy,
    academic_year: normalized.academicYear,
  }
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  loading: boolean
  profileFetched: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  loading: false,
  profileFetched: false,
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
      state.user = normalizeUser(action.payload.user)
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
      state.profileFetched = false
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        const profileData = action.payload.profile
        const userData = action.payload.user
        
        // Compute accommodation status
        const accommodationStatus = profileData.accommodation?.is_active 
          ? 'allocated' 
          : (profileData.bookings?.some((b: any) => b.status === 'pending') || 
             profileData.reservations?.some((r: any) => r.status === 'pending'))
            ? 'pending'
            : 'none'
        
        // Compute payment status - check for confirmed payments or active requests
        const payments = profileData.payments || []
        const bookings = profileData.bookings || []
        const reservations = profileData.reservations || []
        const hasAccommodation = !!profileData.accommodation
        
        const hasConfirmedPayment = payments.some((p: any) => p.status === 'Confirmed')
        const hasActiveRequest = bookings.length > 0 || reservations.length > 0
        
        const paymentStatus = hasConfirmedPayment 
          ? 'paid' 
          : (hasActiveRequest || hasAccommodation || payments.length > 0) 
            ? 'pending' 
            : 'none'
        
        // Merge and normalize
        const mergedData = {
          ...userData,
          ...profileData,
          index_number: profileData.index_number || profileData.users?.index_number,
          profile: profileData,
          accommodation: profileData.accommodation,
          bookings: profileData.bookings,
          reservations: profileData.reservations,
          payments: profileData.payments,
          accommodationStatus,
          paymentStatus
        }
        
        state.user = normalizeUser(mergedData)
        state.isAuthenticated = true
        state.profileFetched = true
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.loading = false
        state.profileFetched = true
      })
  },
})

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions
export default authSlice.reducer
