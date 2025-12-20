// Test utilities for integration testing
import { createServer } from 'http'
import { parse } from 'url'
import { jest } from '@jest/globals'
// import { createApp } from './app-setup'

// Create test server
export const createTestServer = (port = 3001) => {
  const server = createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    // const app = createApp()
    // app(req, res)
    res.writeHead(404)
    res.end('Not Found')
  })

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`Test server running on port ${port}`)
      resolve(server)
    })
  })
}

// Make HTTP request utility
export const makeRequest = async (url: string, options: any = {}) => {
  const response = await fetch(`http://localhost:3001${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json()
  return {
    status: response.status,
    statusText: response.statusText,
    data,
    headers: response.headers,
  }
}

// Clean up test server
export const cleanupTestServer = async (server: any) => {
  return new Promise<void>((resolve) => {
    server.close(() => {
      console.log('Test server closed')
      resolve()
    })
  })
}

// Mock data generators
export const generateMockData = {
  users: () => [
    {
      id: 'user-1',
      email: 'student1@example.com',
      role: 'student',
      first_name: 'John',
      last_name: 'Doe',
      created_at: new Date().toISOString(),
    },
    {
      id: 'user-2',
      email: 'admin@example.com',
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      created_at: new Date().toISOString(),
    },
  ],

  students: () => [
    {
      id: 'student-1',
      user_id: 'user-1',
      index_number: '2023/1001',
      first_name: 'John',
      last_name: 'Doe',
      date_of_birth: '2000-01-01',
      phone: '+233123456789',
      accommodation_status: 'allocated',
      created_at: new Date().toISOString(),
    },
    {
      id: 'student-2',
      user_id: 'user-2',
      index_number: '2023/1002',
      first_name: 'Jane',
      last_name: 'Smith',
      date_of_birth: '2001-02-15',
      phone: '+233987654321',
      accommodation_status: 'pending',
      created_at: new Date().toISOString(),
    },
  ],

  hostels: () => [
    {
      id: 'hostel-1',
      name: 'Male Hostel A',
      code: 'MH-A',
      capacity: 200,
      location: 'Main Campus',
      created_at: new Date().toISOString(),
    },
    {
      id: 'hostel-2',
      name: 'Female Hostel B',
      code: 'FH-B',
      capacity: 150,
      location: 'Main Campus',
      created_at: new Date().toISOString(),
    },
  ],

  rooms: () => [
    {
      id: 'room-1',
      hostel_id: 'hostel-1',
      floor_id: 'floor-1',
      room_number: '101',
      room_type_id: 'type-1',
      capacity: 4,
      created_at: new Date().toISOString(),
    },
    {
      id: 'room-2',
      hostel_id: 'hostel-1',
      floor_id: 'floor-1',
      room_number: '102',
      room_type_id: 'type-1',
      capacity: 4,
      created_at: new Date().toISOString(),
    },
  ],

  beds: () => [
    {
      id: 'bed-1',
      room_id: 'room-1',
      bed_number: 'A1',
      is_occupied: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'bed-2',
      room_id: 'room-1',
      bed_number: 'A2',
      is_occupied: true,
      created_at: new Date().toISOString(),
    },
  ],

  bookings: () => [
    {
      id: 'booking-1',
      student_id: 'student-1',
      hostel_id: 'hostel-1',
      floor_id: 'floor-1',
      room_id: 'room-1',
      bed_id: 'bed-1',
      academic_year: '2023/2024',
      semester: 'First Semester',
      status: 'active',
      booked_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
  ],

  payments: () => [
    {
      id: 'payment-1',
      student_id: 'student-1',
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
    },
  ],

  notifications: () => [
    {
      id: 'notif-1',
      user_id: 'user-1',
      type: 'info',
      title: 'Welcome',
      message: 'Welcome to UPSA Hostel Management',
      channels: ['email', 'in_app'],
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ],
}

// Test environment setup
export const setupTestEnvironment = () => {
  // Set test environment variables
  ;(process.env as any).NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api'
  
  // Mock console methods to avoid noise in tests
  global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  }
}

// Cleanup test environment
export const cleanupTestEnvironment = () => {
  // Restore environment
  ;(process.env as any).NODE_ENV = 'development'
  delete process.env.NEXT_PUBLIC_API_URL
  
  // Restore console
  global.console = console
}

// Performance testing utilities
export const measurePerformance = async (testName: string, testFn: () => Promise<void>) => {
  const start = performance.now()
  await testFn()
  const end = performance.now()
  
  console.log(`${testName} took ${(end - start).toFixed(2)}ms`)
  
  return end - start
}

// Load testing utilities
export const performLoadTest = async (
  endpoint: string,
  concurrentRequests: number = 10,
  totalRequests: number = 100
) => {
  const results = []
  
  for (let i = 0; i < totalRequests; i += concurrentRequests) {
    const batch = Math.min(concurrentRequests, totalRequests - i)
    const promises = Array(batch).fill(null).map((_, index) =>
      makeRequest(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token',
        },
      })
    )
    
    const start = performance.now()
    const responses = await Promise.all(promises)
    const end = performance.now()
    
    results.push({
      batch: i / concurrentRequests + 1,
      requestCount: batch,
      duration: end - start,
      successRate: responses.filter(r => r.status < 400).length / responses.length,
      averageResponseTime: responses.reduce((sum, r) => sum + (r.status === 200 ? 1 : 0), 0) / responses.length,
    })
  }
  
  return results
}
