// Jest setup file for testing configuration
import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'
import { jest } from '@jest/globals'
import { render } from '@testing-library/react'

// Configure React Testing Library
configure({ testIdAttribute: 'data-testid' })

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api'
process.env.SMTP_HOST = 'smtp.test.com'
process.env.SMTP_USER = 'test@example.com'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(),
          range: jest.fn(),
          limit: jest.fn(),
        })),
        insert: jest.fn(() => ({
          select: jest.fn(),
          single: jest.fn(),
        })),
        update: jest.fn(() => ({
          eq: jest.fn(),
          gt: jest.fn(),
          gte: jest.fn(),
          lt: jest.fn(),
          lte: jest.fn(),
          like: jest.fn(),
          ilike: jest.fn(),
          in: jest.fn(),
          is: jest.fn(),
          not: jest.fn(),
        })),
        delete: jest.fn(),
      })),
    })),
    },
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => '/test'),
}))

// Mock Redux
jest.mock('react-redux', () => ({
  useSelector: jest.fn(),
  useDispatch: jest.fn(() => jest.fn()),
}))

// Mock Formik
jest.mock('formik', () => ({
  useFormik: jest.fn(() => ({
    values: {},
    errors: {},
    touched: {},
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    handleSubmit: jest.fn(),
    setFieldValue: jest.fn(),
    setFieldTouched: jest.fn(),
    resetForm: jest.fn(),
  })),
}))

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
}

// Mock fetch
global.fetch = jest.fn() as any

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as any

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})) as any

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}
global.localStorage = localStorageMock as any

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  role: 'student',
  firstName: 'Test',
  lastName: 'User',
  ...overrides,
})

export const createMockStudent = (overrides = {}) => ({
  id: 'test-student-id',
  user_id: 'test-user-id',
  index_number: '2023/1234',
  first_name: 'Test',
  last_name: 'Student',
  date_of_birth: '2000-01-01',
  phone: '+233123456789',
  accommodation_status: 'pending',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createMockHostel = (overrides = {}) => ({
  id: 'test-hostel-id',
  name: 'Test Hostel',
  code: 'TH',
  capacity: 200,
  location: 'Test Location',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createMockRoom = (overrides = {}) => ({
  id: 'test-room-id',
  hostel_id: 'test-hostel-id',
  floor_id: 'test-floor-id',
  room_number: '101',
  room_type_id: 'test-room-type-id',
  capacity: 4,
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createMockBooking = (overrides = {}) => ({
  id: 'test-booking-id',
  student_id: 'test-student-id',
  hostel_id: 'test-hostel-id',
  floor_id: 'test-floor-id',
  room_id: 'test-room-id',
  bed_id: 'test-bed-id',
  academic_year: '2023/2024',
  semester: 'First Semester',
  status: 'active',
  booked_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  ...overrides,
})

export const createMockPayment = (overrides = {}) => ({
  id: 'test-payment-id',
  student_id: 'test-student-id',
  amount: 1500,
  payment_method: 'mobile_money',
  provider: 'mtn',
  transaction_id: 'TXN123456789',
  status: 'completed',
  semester: 'First Semester',
  academic_year: '2023/2024',
  processing_fee: 15,
  gateway_fee: 0,
  total_fees: 15,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
})

export const createMockNotification = (overrides = {}) => ({
  id: 'test-notification-id',
  user_id: 'test-user-id',
  type: 'info',
  title: 'Test Notification',
  message: 'This is a test notification',
  channels: ['in_app'],
  is_read: false,
  created_at: new Date().toISOString(),
  ...overrides,
})

// Render helper
export const renderWithProviders = (component: React.ReactElement, options: any = {}) => {
  const { initialStore = {}, ...rest } = options
  
  return {
    ...render(component, rest),
    store: {
      getState: () => initialStore,
      dispatch: jest.fn(),
      subscribe: jest.fn(),
    },
  }
}

// Async test utilities
export const waitFor = (condition: () => boolean, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const checkCondition = () => {
      if (condition()) {
        resolve()
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'))
      } else {
        setTimeout(checkCondition, 100)
      }
    }
    
    checkCondition()
  })
}

// Mock response helpers
export const createMockResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: 'OK',
  json: jest.fn(() => Promise.resolve(data)) as any,
  text: jest.fn(() => Promise.resolve(JSON.stringify(data))) as any,
})

export const createMockErrorResponse = (error: string, status = 400) => ({
  ok: false,
  status,
  statusText: 'Error',
  json: jest.fn(() => Promise.resolve({ error })) as any,
  text: jest.fn(() => Promise.resolve(JSON.stringify({ error }))) as any,
})
