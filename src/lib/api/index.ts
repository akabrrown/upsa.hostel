// API integration utilities for frontend components
import { authRateLimiter, getClientId } from '@/lib/security/rateLimiting'

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// API client class
class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const config: RequestInit = {
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    return this.request<T>(endpoint + url.search, {
      method: 'GET',
    })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }

  // Set authentication header
  setAuthHeader(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`
  }

  // Clear authentication header
  clearAuthHeader(): void {
    delete this.defaultHeaders.Authorization
  }
}

// Create API client instance
const apiClient = new ApiClient()

// Authentication API
export const authApi = {
  // Student registration
  signup: async (userData: {
    firstName: string
    lastName: string
    indexNumber: string
    dateOfBirth: string
    phone: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    return apiClient.post('/auth/signup', userData)
  },

  // User login
  login: async (credentials: {
    email: string
    password: string
    role?: string
  }) => {
    return apiClient.post('/auth/login', credentials)
  },

  // Logout
  logout: async () => {
    return apiClient.post('/auth/logout')
  },

  // Refresh token
  refreshToken: async () => {
    return apiClient.post('/auth/refresh')
  },

  // Get current user
  getCurrentUser: async () => {
    return apiClient.get('/auth/me')
  },

  // Update profile
  updateProfile: async (profileData: any) => {
    return apiClient.put('/auth/profile', profileData)
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    return apiClient.put('/auth/change-password', passwordData)
  },
}

// Hostel API
export const hostelApi = {
  // Get all hostels
  getAll: async () => {
    return apiClient.get('/hostels')
  },

  // Get hostel by ID
  getById: async (id: string) => {
    return apiClient.get(`/hostels/${id}`)
  },

  // Get hostel floors
  getFloors: async (hostelId: string) => {
    return apiClient.get(`/hostels/${hostelId}/floors`)
  },

  // Get floor rooms
  getFloorRooms: async (hostelId: string, floorId: string) => {
    return apiClient.get(`/hostels/${hostelId}/floors/${floorId}/rooms`)
  },

  // Get room details
  getRoomDetails: async (hostelId: string, floorId: string, roomId: string) => {
    return apiClient.get(`/hostels/${hostelId}/floors/${floorId}/rooms/${roomId}`)
  },
}

// Room API
export const roomApi = {
  // Reserve room
  reserve: async (reservationData: {
    hostelId: string
    floorId: string
    roomTypeId: string
    academicYear: string
    semester: string
    specialRequests?: string
  }) => {
    return apiClient.post('/rooms/reserve', reservationData)
  },

  // Book room
  book: async (bookingData: {
    hostelId: string
    floorId: string
    roomId: string
    bedId: string
    academicYear: string
    semester: string
  }) => {
    return apiClient.post('/rooms/book', bookingData)
  },

  // Get student's room
  getStudentRoom: async () => {
    return apiClient.get('/rooms/student')
  },

  // Cancel reservation
  cancelReservation: async (reservationId: string) => {
    return apiClient.delete(`/rooms/reservations/${reservationId}`)
  },
}

// Payment API
export const paymentApi = {
  // Process payment
  processPayment: async (paymentData: {
    amount: number
    paymentMethod: 'mobile_money' | 'bank_transfer' | 'card'
    transactionId: string
    semester: string
    academicYear: string
    provider?: string
    phoneNumber?: string
    bankName?: string
    accountNumber?: string
  }) => {
    return apiClient.post('/payments/process', paymentData)
  },

  // Get payment history
  getHistory: async (params?: {
    page?: number
    limit?: number
    semester?: string
    academicYear?: string
  }) => {
    return apiClient.get('/payments/history', params)
  },

  // Get payment status
  getStatus: async (transactionId: string) => {
    return apiClient.get(`/payments/status/${transactionId}`)
  },

  // Verify payment
  verify: async (transactionId: string) => {
    return apiClient.post(`/payments/verify/${transactionId}`)
  },
}

// Admin User Management API
export const adminUserApi = {
  // Get all users
  getAll: async (params?: {
    role?: string
    status?: string
    search?: string
  }) => {
    return apiClient.get('/admin/accounts', params)
  },

  // Create new user
  create: async (userData: any) => {
    return apiClient.post('/admin/accounts', userData)
  },

  // Update user
  update: async (userId: string, userData: any) => {
    return apiClient.put(`/admin/accounts/${userId}`, userData)
  },

  // Delete user
  delete: async (userId: string) => {
    return apiClient.delete(`/admin/accounts/${userId}`)
  }
}

// Utility functions for error handling
export const handleApiError = (error: any, defaultMessage: string = 'An error occurred'): string => {
  if (error?.message) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return defaultMessage
}

// Rate limiting wrapper for API calls
export const withRateLimit = async <T>(
  id: string,
  apiCall: () => Promise<T>
): Promise<T> => {
  // Check rate limit
  const limitResult = authRateLimiter.isAllowed(id)

  if (!limitResult.allowed) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((limitResult.resetTime - Date.now()) / 1000)} seconds.`)
  }
  
  try {
    const result = await apiCall()
    return result
  } catch (error) {
    throw error
  }
}

// Export the API client for direct use if needed
export { apiClient }

// Set authentication token for API requests
export const setApiAuth = (token: string) => {
  apiClient.setAuthHeader(token)
}

export default apiClient
