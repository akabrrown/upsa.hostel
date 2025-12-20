// Unit tests for authentication functionality
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMockUser } from '../setup'
import Login from '@/app/login/page'
import Signup from '@/app/signup/page'

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}))

describe('Authentication', () => {
  describe('Login Page', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders login form correctly', () => {
      render(<Login />)
      
      expect(screen.getByRole('heading', { name: /upsa hostel management/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      const user = userEvent.setup()
      render(<Login />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      // Submit empty form
      await user.click(submitButton)
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
        expect(screen.getByText(/role is required/i)).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
      })
    })

    it('submits form with valid data', async () => {
      const mockPush = jest.fn()
      jest.mocked(require('next/navigation').useRouter).mockReturnValue({
        push: mockPush,
      })

      const mockAuthApi = require('@/lib/api').authApi
      mockAuthApi.login = jest.fn().mockResolvedValue({
        user: createMockUser(),
        session: { access_token: 'test-token' }
      })

      const user = userEvent.setup()
      render(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const roleSelect = screen.getByLabelText(/role/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.selectOptions(roleSelect, ['Student'])
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockAuthApi.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          role: 'student',
        })
        expect(mockPush).toHaveBeenCalledWith('/student/dashboard')
      })
    })

    it('handles login error', async () => {
      const mockAuthApi = require('@/lib/api').authApi
      mockAuthApi.login = jest.fn().mockRejectedValue(new Error('Invalid credentials'))

      const user = userEvent.setup()
      render(<Login />)
      
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
      })
    })
  })

  describe('Signup Page', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('renders signup form correctly', () => {
      render(<Signup />)
      
      expect(screen.getByRole('heading', { name: /student registration/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/index number/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('validates all required fields', async () => {
      const user = userEvent.setup()
      render(<Signup />)
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument()
        expect(screen.getByText(/index number is required/i)).toBeInTheDocument()
        expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument()
        expect(screen.getByText(/phone number is required/i)).toBeInTheDocument()
        expect(screen.getByText(/email is required/i)).toBeInTheDocument()
        expect(screen.getByText(/password is required/i)).toBeInTheDocument()
        expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument()
      })
    })

    it('validates password confirmation', async () => {
      const user = userEvent.setup()
      render(<Signup />)
      
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/passwords must match/i)).toBeInTheDocument()
      })
    })

    it('validates index number format', async () => {
      const user = userEvent.setup()
      render(<Signup />)
      
      const indexNumberInput = screen.getByLabelText(/index number/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      await user.type(indexNumberInput, 'invalid-index')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/invalid index number format/i)).toBeInTheDocument()
      })
    })

    it('submits form with valid data', async () => {
      const mockPush = jest.fn()
      jest.mocked(require('next/navigation').useRouter).mockReturnValue({
        push: mockPush,
      })

      const mockAuthApi = require('@/lib/api').authApi
      mockAuthApi.signup = jest.fn().mockResolvedValue({
        message: 'Student account created successfully',
        user: createMockUser()
      })

      const user = userEvent.setup()
      render(<Signup />)
      
      const firstNameInput = screen.getByLabelText(/first name/i)
      const lastNameInput = screen.getByLabelText(/last name/i)
      const indexNumberInput = screen.getByLabelText(/index number/i)
      const dateOfBirthInput = screen.getByLabelText(/date of birth/i)
      const phoneInput = screen.getByLabelText(/phone/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      await user.type(firstNameInput, 'John')
      await user.type(lastNameInput, 'Doe')
      await user.type(indexNumberInput, '2023/1234')
      await user.type(dateOfBirthInput, '2000-01-01')
      await user.type(phoneInput, '+233123456789')
      await user.type(emailInput, 'john.doe@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockAuthApi.signup).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          indexNumber: '2023/1234',
          dateOfBirth: '2000-01-01',
          phone: '+233123456789',
          email: 'john.doe@example.com',
          password: 'password123',
          confirmPassword: 'password123',
        })
      })
    })

    it('shows success message after successful signup', async () => {
      const mockAuthApi = require('@/lib/api').authApi
      mockAuthApi.signup = jest.fn().mockResolvedValue({
        message: 'Student account created successfully'
      })

      const user = userEvent.setup()
      render(<Signup />)
      
      const submitButton = screen.getByRole('button', { name: /create account/i })
      
      // Fill form with valid data
      const firstNameInput = screen.getByLabelText(/first name/i)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
      
      await user.type(firstNameInput, 'John')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/registration successful/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument()
      })
    })
  })
})
