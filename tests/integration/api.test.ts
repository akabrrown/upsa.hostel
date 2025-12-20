// Integration tests for API endpoints
import { createApp } from '../test-utils'
import { createMockUser, createMockStudent } from '../setup'

// Test app setup
const app = createApp()

describe('API Integration Tests', () => {
  describe('Authentication API', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('POST /api/auth/login - successful login', async () => {
      const mockUser = createMockUser()
      
      const response = await app.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: mockUser.email,
          password: 'password123',
          role: mockUser.role,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.user.email).toBe(mockUser.email)
      expect(data.user.role).toBe(mockUser.role)
      expect(data.session).toBeDefined()
    })

    it('POST /api/auth/login - invalid credentials', async () => {
      const response = await app.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'wrong@example.com',
          password: 'wrongpassword',
          role: 'student',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Invalid credentials')
    })

    it('POST /api/auth/login - missing required fields', async () => {
      const response = await app.request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          // missing password and role
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid input')
    })

    it('POST /api/auth/signup - successful signup', async () => {
      const mockStudent = createMockStudent()
      
      const response = await app.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: mockStudent.first_name,
          lastName: mockStudent.last_name,
          indexNumber: mockStudent.index_number,
          dateOfBirth: mockStudent.date_of_birth,
          phone: mockStudent.phone,
          email: 'newstudent@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Student account created successfully')
      expect(data.user.email).toBe('newstudent@example.com')
    })

    it('POST /api/auth/signup - duplicate email', async () => {
      const response = await app.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'Student',
          indexNumber: '2023/1234',
          dateOfBirth: '2000-01-01',
          phone: '+233123456789',
          email: 'existing@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(409)
      const data = await response.json()
      expect(data.error).toBe('User with this email already exists')
    })
  })

  describe('Student API', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('GET /api/students/reservations - fetch reservations', async () => {
      const mockUser = createMockUser()
      
      const response = await app.request(`/api/students/reservations?userId=${mockUser.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer test-token`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.reservations).toBeDefined()
      expect(Array.isArray(data.reservations)).toBe(true)
    })

    it('POST /api/students/reservations - create reservation', async () => {
      const reservationData = {
        hostelId: 'test-hostel-id',
        floorId: 'test-floor-id',
        roomTypeId: 'test-room-type-id',
        academicYear: '2023/2024',
        semester: 'First Semester',
        specialRequests: 'Test request',
      }

      const response = await app.request('/api/students/reservations', {
        method: 'POST',
        body: JSON.stringify(reservationData),
        headers: {
          'Authorization': `Bearer test-token`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Reservation created successfully')
      expect(data.reservation.hostelId).toBe(reservationData.hostelId)
    })

    it('GET /api/students/bookings - fetch bookings', async () => {
      const mockUser = createMockUser()
      
      const response = await app.request(`/api/students/bookings?userId=${mockUser.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer test-token`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.bookings).toBeDefined()
      expect(Array.isArray(data.bookings)).toBe(true)
    })

    it('POST /api/students/bookings - create booking', async () => {
      const bookingData = {
        hostelId: 'test-hostel-id',
        floorId: 'test-floor-id',
        roomId: 'test-room-id',
        bedId: 'test-bed-id',
        academicYear: '2023/2024',
        semester: 'First Semester',
      }

      const response = await app.request('/api/students/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
        headers: {
          'Authorization': `Bearer test-token`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Room booked successfully')
      expect(data.booking.bedId).toBe(bookingData.bedId)
    })
  })

  describe('Admin API', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('GET /api/admin/students - fetch students with pagination', async () => {
      const response = await app.request('/api/admin/students?page=1&limit=10', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer admin-token`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.students).toBeDefined()
      expect(data.pagination).toBeDefined()
      expect(data.pagination.page).toBe(1)
      expect(data.pagination.limit).toBe(10)
    })

    it('POST /api/admin/students - update student status', async () => {
      const response = await app.request('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify({
          action: 'update_status',
          studentId: 'test-student-id',
          data: { status: 'allocated' }
        }),
        headers: {
          'Authorization': `Bearer admin-token`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Student status updated successfully')
    })

    it('POST /api/admin/students - allocate room', async () => {
      const allocationData = {
        hostelId: 'test-hostel-id',
        floorId: 'test-floor-id',
        roomId: 'test-room-id',
        bedId: 'test-bed-id',
        academicYear: '2023/2024',
        semester: 'First Semester',
      }

      const response = await app.request('/api/admin/students', {
        method: 'POST',
        body: JSON.stringify({
          action: 'allocate_room',
          studentId: 'test-student-id',
          data: allocationData
        }),
        headers: {
          'Authorization': `Bearer admin-token`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Room allocated successfully')
    })
  })

  describe('Porter API', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('POST /api/porter/checkin - check in student', async () => {
      const checkInData = {
        indexNumber: '2023/1234',
        notes: 'Student checked in successfully',
        action: 'checkin'
      }

      const response = await app.request('/api/porter/checkin', {
        method: 'POST',
        body: JSON.stringify(checkInData),
        headers: {
          'Authorization': `Bearer porter-token`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Student checked in successfully')
      expect(data.checkIn.indexNumber).toBe(checkInData.indexNumber)
    })

    it('POST /api/porter/checkin - check out student', async () => {
      const checkOutData = {
        indexNumber: '2023/1234',
        notes: 'Student checked out successfully',
        action: 'checkout'
      }

      const response = await app.request('/api/porter/checkin', {
        method: 'POST',
        body: JSON.stringify(checkOutData),
        headers: {
          'Authorization': `Bearer porter-token`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Student checked out successfully')
      expect(data.checkOut.indexNumber).toBe(checkOutData.indexNumber)
    })

    it('GET /api/porter/checkin - fetch records', async () => {
      const response = await app.request('/api/porter/checkin?date=2024-01-01', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer porter-token`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.records).toBeDefined()
      expect(Array.isArray(data.records)).toBe(true)
    })
  })

  describe('Director API', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('GET /api/director/analytics - fetch analytics data', async () => {
      const response = await app.request('/api/director/analytics?period=year', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer director-token`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.overview).toBeDefined()
      expect(data.monthlyData).toBeDefined()
      expect(data.hostelPerformance).toBeDefined()
      expect(data.paymentTrends).toBeDefined()
    })

    it('GET /api/director/analytics - with custom date range', async () => {
      const response = await app.request(
        '/api/director/analytics?startDate=2024-01-01&endDate=2024-12-31',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer director-token`,
          },
        }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.dateRange).toBeDefined()
      expect(data.dateRange.start).toBe('2024-01-01')
      expect(data.dateRange.end).toBe('2024-12-31')
    })
  })

  describe('Payments API', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('POST /api/payments - process payment', async () => {
      const paymentData = {
        amount: 1500,
        paymentMethod: 'mobile_money',
        provider: 'mtn',
        transactionId: 'TXN123456789',
        semester: 'First Semester',
        academicYear: '2023/2024',
        phoneNumber: '+233123456789',
      }

      const response = await app.request('/api/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
        headers: {
          'Authorization': `Bearer test-token`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Payment processed successfully')
      expect(data.payment.amount).toBe(paymentData.amount)
      expect(data.payment.status).toBe('completed')
    })

    it('GET /api/payments - fetch payment history', async () => {
      const mockUser = createMockUser()
      
      const response = await app.request(`/api/payments?userId=${mockUser.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer test-token`,
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.payments).toBeDefined()
      expect(data.pagination).toBeDefined()
    })

    it('PUT /api/payments - refund payment', async () => {
      const response = await app.request('/api/payments?id=test-payment-id', {
        method: 'PUT',
        body: JSON.stringify({
          action: 'refund',
          reason: 'Customer requested refund'
        }),
        headers: {
          'Authorization': `Bearer test-token`,
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.message).toBe('Payment refunded successfully')
    })
  })

  describe('Error Handling', () => {
    it('returns 401 for unauthorized requests', async () => {
      const response = await app.request('/api/admin/students', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      })

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.error).toBe('Unauthorized')
    })

    it('returns 429 for rate limited requests', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array(10).fill(null).map(() =>
        app.request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            role: 'student',
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )

      const responses = await Promise.all(requests)
      const rateLimitedResponse = responses.find(res => res.status === 429)
      
      expect(rateLimitedResponse).toBeDefined()
      const data = await rateLimitedResponse.json()
      expect(data.error).toBe('Too many login attempts')
    })

    it('returns 500 for server errors', async () => {
      // Mock a server error
      jest.mocked(require('@/lib/supabase').supabase.from).mockReturnValue({
        insert: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      })

      const response = await app.request('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'Student',
          indexNumber: '2023/1234',
          dateOfBirth: '2000-01-01',
          phone: '+233123456789',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })
  })
})
