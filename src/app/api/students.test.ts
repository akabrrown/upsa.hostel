import { createMocks } from 'node-mocks-http'
import { NextRequest } from 'next/server'

describe('GET /api/students', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return students list for admin', async () => {
    const mockStudents = [
      {
        id: 1,
        indexNumber: '12345678',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@upsamail.edu.gh',
        programOfStudy: 'Computer Science',
        level: '200',
        roomAllocation: 'Hostel A - Room 101',
        paymentStatus: 'paid'
      },
      {
        id: 2,
        indexNumber: '87654321',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@upsamail.edu.gh',
        programOfStudy: 'Business Administration',
        level: '300',
        roomAllocation: 'Hostel B - Room 205',
        paymentStatus: 'pending'
      }
    ]

    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database query
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockResolvedValue({
        rows: mockStudents
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.students).toHaveLength(2)
    expect(data.students[0].indexNumber).toBe('12345678')
  })

  it('should deny access for non-admin users', async () => {
    // Mock authentication for student
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'student',
        email: 'student@upsamail.edu.gh'
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer student-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Access denied')
  })

  it('should handle pagination', async () => {
    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database query with pagination
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockResolvedValue({
        rows: [
          { id: 1, indexNumber: '12345678', firstName: 'John', lastName: 'Doe' },
          { id: 2, indexNumber: '87654321', firstName: 'Jane', lastName: 'Smith' }
        ]
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students?page=1&limit=10', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.pagination).toBeDefined()
    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(10)
  })

  it('should handle search functionality', async () => {
    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database query with search
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockResolvedValue({
        rows: [
          { id: 1, indexNumber: '12345678', firstName: 'John', lastName: 'Doe' }
        ]
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students?search=John', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.students).toHaveLength(1)
    expect(data.students[0].firstName).toBe('John')
  })

  it('should handle authentication errors', async () => {
    // Mock authentication failure
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue(null)
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Unauthorized')
  })

  it('should handle database errors', async () => {
    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database error
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockRejectedValue(new Error('Database connection failed'))
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Internal server error')
  })
})

describe('POST /api/students', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create new student for admin', async () => {
    const newStudent = {
      indexNumber: '11223344',
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@upsamail.edu.gh',
      programOfStudy: 'Information Technology',
      level: '100'
    }

    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database query
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockResolvedValue({
        rows: [{
          id: 3,
          ...newStudent,
          createdAt: new Date().toISOString()
        }]
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students', {
      method: 'POST',
      body: JSON.stringify(newStudent),
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.student.indexNumber).toBe('11223344')
    expect(data.student.firstName).toBe('Alice')
  })

  it('should validate required fields', async () => {
    const invalidStudent = {
      indexNumber: '',
      firstName: '',
      lastName: '',
      email: 'invalid-email',
      programOfStudy: '',
      level: ''
    }

    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students', {
      method: 'POST',
      body: JSON.stringify(invalidStudent),
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.errors).toBeDefined()
    expect(data.errors.indexNumber).toBeDefined()
    expect(data.errors.firstName).toBeDefined()
    expect(data.errors.email).toBeDefined()
  })

  it('should check for duplicate index number', async () => {
    const duplicateStudent = {
      indexNumber: '12345678', // Already exists
      firstName: 'Bob',
      lastName: 'Wilson',
      email: 'bob.wilson@upsamail.edu.gh',
      programOfStudy: 'Computer Science',
      level: '100'
    }

    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database query for duplicate check
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockResolvedValue({
        rows: [{ id: 1, indexNumber: '12345678' }] // Duplicate found
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students', {
      method: 'POST',
      body: JSON.stringify(duplicateStudent),
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Index number already exists')
  })

  it('should handle malformed JSON', async () => {
    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Invalid request body')
  })
})

describe('PUT /api/students/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should update student information', async () => {
    const updatedStudent = {
      firstName: 'John Updated',
      lastName: 'Doe Updated',
      email: 'john.updated@upsamail.edu.gh',
      programOfStudy: 'Computer Science',
      level: '300'
    }

    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database query
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockResolvedValue({
        rows: [{
          id: 1,
          indexNumber: '12345678',
          ...updatedStudent,
          updatedAt: new Date().toISOString()
        }]
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students/1', {
      method: 'PUT',
      body: JSON.stringify(updatedStudent),
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.student.firstName).toBe('John Updated')
    expect(data.student.lastName).toBe('Doe Updated')
  })

  it('should return 404 for non-existent student', async () => {
    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database query returning empty result
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockResolvedValue({ rows: [] })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students/999', {
      method: 'PUT',
      body: JSON.stringify({
        firstName: 'Updated',
        lastName: 'Name'
      }),
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Student not found')
  })
})

describe('DELETE /api/students/:id', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should delete student', async () => {
    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database query
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockResolvedValue({
        rows: [{ id: 1, indexNumber: '12345678' }]
      })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students/1', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toBe('Student deleted successfully')
  })

  it('should return 404 for non-existent student', async () => {
    // Mock authentication
    jest.mock('@/lib/auth', () => ({
      authenticate: jest.fn().mockResolvedValue({
        id: 1,
        role: 'admin',
        email: 'admin@upsamail.edu.gh'
      })
    }))

    // Mock database query returning empty result
    jest.mock('@/lib/database', () => ({
      query: jest.fn().mockResolvedValue({ rows: [] })
    }))

    const mockRequest = new NextRequest('http://localhost:3000/api/students/999', {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
    })

    const response = await handler(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Student not found')
  })
})
