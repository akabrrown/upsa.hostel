# API Documentation - UPSA Hostel Management System

## Overview
This document provides comprehensive API documentation for the UPSA Hostel Management System. All API endpoints follow RESTful conventions and implement proper security measures.

## Base URL
```
Production: https://your-app.netlify.app/api
Development: http://localhost:3000/api
```

## Authentication
All API endpoints (except authentication endpoints) require a valid session token.

### Headers
```http
Authorization: Bearer <session_token>
X-CSRF-Token: <csrf_token>
Content-Type: application/json
```

### Session Management
- Sessions are stored in secure HTTP-only cookies
- Tokens expire after 24 hours of inactivity
- CSRF protection is enabled for state-changing operations

## Response Format
All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "errors": ["Error messages"],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Rate Limiting
- **Authentication**: 5 attempts per 15 minutes
- **General API**: 100 requests per 15 minutes
- **File Uploads**: 10 uploads per hour
- **Search**: 50 searches per 15 minutes

## Endpoints

### Authentication

#### POST /api/auth/login
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@upsamail.edu.gh",
  "password": "SecurePass123!",
  "role": "student|admin|porter|director"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@upsamail.edu.gh",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student"
    },
    "csrfToken": "csrf_token"
  }
}
```

#### POST /api/auth/signup
Register new user account.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "indexNumber": "12345678",
  "email": "john.doe@upsamail.edu.gh",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "programOfStudy": "Computer Science",
  "level": "100"
}
```

#### POST /api/auth/logout
End user session.

**Headers:**
```http
Authorization: Bearer <session_token>
X-CSRF-Token: <csrf_token>
```

#### GET /api/auth/session
Get current session information.

**Headers:**
```http
Authorization: Bearer <session_token>
```

#### POST /api/auth/password-reset
Request password reset email.

**Request Body:**
```json
{
  "email": "user@upsamail.edu.gh"
}
```

#### POST /api/auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "NewSecurePass123!"
}
```

### Students Management

#### GET /api/students
Get list of students (Admin only).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search term
- `program` (string): Filter by program of study
- `level` (string): Filter by academic level

**Headers:**
```http
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "student_id",
        "indexNumber": "12345678",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@upsamail.edu.gh",
        "programOfStudy": "Computer Science",
        "level": "200",
        "roomAllocation": "Hostel A - Room 101",
        "paymentStatus": "paid",
        "isActive": true
      }
    ],
    "pagination": { ... }
  }
}
```

#### POST /api/students
Create new student (Admin only).

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "indexNumber": "87654321",
  "email": "jane.smith@upsamail.edu.gh",
  "programOfStudy": "Business Administration",
  "level": "100",
  "phone": "+233123456789"
}
```

#### GET /api/students/:id
Get student details by ID.

#### PUT /api/students/:id
Update student information (Admin only).

#### DELETE /api/students/:id
Delete student (Admin only).

### Rooms Management

#### GET /api/rooms
Get list of available rooms.

**Query Parameters:**
- `hostel` (string): Filter by hostel
- `floor` (string): Filter by floor
- `roomType` (string): Filter by room type
- `available` (boolean): Filter by availability

**Response:**
```json
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "room_id",
        "hostelId": "hostel_id",
        "floor": "1",
        "roomNumber": "101",
        "capacity": 2,
        "roomType": "double",
        "pricePerSemester": 1500.00,
        "amenities": ["WiFi", "AC", "Study Desk"],
        "isAvailable": true,
        "currentOccupants": 1
      }
    ]
  }
}
```

#### POST /api/rooms
Create new room (Admin only).

#### GET /api/rooms/:id
Get room details.

#### PUT /api/rooms/:id
Update room information (Admin only).

#### DELETE /api/rooms/:id
Delete room (Admin only).

### Room Allocation

#### GET /api/allocations
Get room allocations.

#### POST /api/allocations
Allocate room to student (Admin only).

**Request Body:**
```json
{
  "studentId": "student_id",
  "roomId": "room_id",
  "semester": "first",
  "academicYear": "2023/2024"
}
```

#### DELETE /api/allocations/:id
Remove room allocation (Admin only).

### Payments

#### GET /api/payments
Get payment records.

**Query Parameters:**
- `studentId` (string): Filter by student
- `semester` (string): Filter by semester
- `academicYear` (string): Filter by academic year
- `status` (string): Filter by payment status

**Response:**
```json
{
  "success": true,
  "data": {
    "payments": [
      {
        "id": "payment_id",
        "studentId": "student_id",
        "amount": 1500.00,
        "paymentMethod": "bank_transfer",
        "semester": "first",
        "academicYear": "2023/2024",
        "paymentDate": "2023-09-15T10:30:00Z",
        "receiptNumber": "REC123456",
        "status": "completed",
        "notes": "First semester fees"
      }
    ]
  }
}
```

#### POST /api/payments
Create new payment record (Admin only).

#### GET /api/payments/:id
Get payment details.

#### PUT /api/payments/:id
Update payment record (Admin only).

### Announcements

#### GET /api/announcements
Get announcements.

**Query Parameters:**
- `category` (string): Filter by category
- `priority` (string): Filter by priority
- `targetAudience` (string): Filter by target audience
- `active` (boolean): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": {
    "announcements": [
      {
        "id": "announcement_id",
        "title": "Hostel Fee Payment Reminder",
        "content": "Please pay your hostel fees by the deadline...",
        "category": "payment",
        "priority": "high",
        "targetAudience": ["students"],
        "author": "admin_id",
        "createdAt": "2023-09-15T10:30:00Z",
        "expiresAt": "2023-10-15T23:59:59Z",
        "isActive": true
      }
    ]
  }
}
```

#### POST /api/announcements
Create new announcement (Admin/Porter/Director).

#### GET /api/announcements/:id
Get announcement details.

#### PUT /api/announcements/:id
Update announcement (Author only).

#### DELETE /api/announcements/:id
Delete announcement (Author/Admin only).

### Porter Management

#### GET /api/porters
Get list of porters (Admin only).

#### POST /api/porters
Create new porter account (Admin only).

#### GET /api/porters/check-ins
Get check-in records.

#### POST /api/porters/check-ins
Record student check-in (Porter only).

**Request Body:**
```json
{
  "studentId": "student_id",
  "checkInTime": "2023-09-15T18:30:00Z",
  "notes": "Student arrived on time"
}
```

#### POST /api/porters/check-outs
Record student check-out (Porter only).

**Request Body:**
```json
{
  "studentId": "student_id",
  "checkOutTime": "2023-09-16T07:00:00Z",
  "notes": "Student leaving for weekend"
}
```

### File Uploads

#### POST /api/upload
Upload file (document, image, etc.).

**Request Body (multipart/form-data):**
- `file`: File to upload
- `purpose`: File purpose (student_id, admission_letter, payment_proof, profile_photo)

**Headers:**
```http
Authorization: Bearer <session_token>
X-CSRF-Token: <csrf_token>
Content-Type: multipart/form-data
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "fileId": "file_id",
    "filename": "document.pdf",
    "url": "https://storage.url/file.pdf",
    "size": 1024000,
    "contentType": "application/pdf"
  }
}
```

### Search

#### GET /api/search
Search across multiple entities.

**Query Parameters:**
- `q` (string): Search query
- `type` (string): Search type (student, room, payment, announcement)
- `page` (number): Page number
- `limit` (number): Results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "student",
        "id": "student_id",
        "title": "John Doe",
        "description": "Computer Science - Level 200",
        "url": "/admin/students/student_id"
      }
    ],
    "pagination": { ... }
  }
}
```

### Reports

#### GET /api/reports/occupancy
Get occupancy report (Admin/Director).

**Query Parameters:**
- `startDate` (string): Report start date
- `endDate` (string): Report end date
- `hostel` (string): Filter by hostel
- `format` (string): Report format (pdf, excel, csv)

#### GET /api/reports/payments
Get payment report (Admin/Director).

#### GET /api/reports/demographics
Get student demographics report (Admin/Director).

#### GET /api/reports/activities
Get porter activities report (Admin/Director).

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    "field: Validation error message"
  ],
  "code": "ERROR_CODE"
}
```

## Security Considerations

### Input Validation
- All inputs are validated using Zod schemas
- SQL injection protection through ORM
- XSS protection through input sanitization

### Authentication & Authorization
- Session-based authentication
- Role-based access control
- CSRF protection for state changes
- Rate limiting to prevent abuse

### Data Protection
- HTTPS encryption in production
- Secure password hashing (bcrypt)
- Sensitive data not exposed in responses
- Audit logging for all actions

## SDK Examples

### JavaScript/TypeScript
```typescript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@upsamail.edu.gh',
    password: 'password',
    role: 'student'
  })
})

const { data } = await loginResponse.json()
const token = data.token

// Get students
const studentsResponse = await fetch('/api/students', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})

const studentsData = await studentsResponse.json()
```

### Python
```python
import requests

# Login
login_response = requests.post('http://localhost:3000/api/auth/login', json={
    'email': 'user@upsamail.edu.gh',
    'password': 'password',
    'role': 'student'
})

token = login_response.json()['data']['token']

# Get students
students_response = requests.get('http://localhost:3000/api/students', headers={
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
})

students_data = students_response.json()
```

## Testing

### Postman Collection
A Postman collection is available with all API endpoints for testing.

### Environment Variables
```json
{
  "baseUrl": "http://localhost:3000/api",
  "token": "",
  "csrfToken": ""
}
```

## Versioning
Current API version: v1

Version history:
- v1.0.0 - Initial release
- v1.1.0 - Added file upload endpoints
- v1.2.0 - Enhanced security features

## Support
For API support and issues:
- Email: api-support@upsamail.edu.gh
- Documentation: Available in project repository
- Issue Tracker: GitHub repository issues
