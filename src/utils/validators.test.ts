import {
  validateEmail,
  validatePassword,
  validateIndexNumber,
  validatePhone,
  validateDate,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePattern
} from './validators'

describe('Utility Validators', () => {
  describe('validateEmail', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co.uk')).toBe(true)
      expect(validateEmail('user+tag@example.org')).toBe(true)
    })

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('test.example.com')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(validateEmail('')).toBe(false)
      expect(validateEmail(null as any)).toBe(false)
      expect(validateEmail(undefined as any)).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      expect(validatePassword('SecurePass123!')).toBe(true)
      expect(validatePassword('MyP@ssw0rd2024')).toBe(true)
    })

    it('should reject weak passwords', () => {
      expect(validatePassword('password')).toBe(false)
      expect(validatePassword('12345678')).toBe(false)
      expect(validatePassword('short')).toBe(false)
      expect(validatePassword('NoSpecialChar1')).toBe(false)
      expect(validatePassword('NoNumber!')).toBe(false)
    })

    it('should enforce minimum length', () => {
      expect(validatePassword('Abc1!')).toBe(false) // 6 chars
      expect(validatePassword('Abc12!')).toBe(true) // 7 chars
    })
  })

  describe('validateIndexNumber', () => {
    it('should validate 8-digit index numbers', () => {
      expect(validateIndexNumber('12345678')).toBe(true)
      expect(validateIndexNumber('87654321')).toBe(true)
    })

    it('should reject invalid index numbers', () => {
      expect(validateIndexNumber('1234567')).toBe(false) // 7 digits
      expect(validateIndexNumber('123456789')).toBe(false) // 9 digits
      expect(validateIndexNumber('1234567a')).toBe(false) // contains letter
      expect(validateIndexNumber('abcdefgh')).toBe(false) // all letters
    })

    it('should handle edge cases', () => {
      expect(validateIndexNumber('')).toBe(false)
      expect(validateIndexNumber(null as any)).toBe(false)
      expect(validateIndexNumber(undefined as any)).toBe(false)
    })
  })

  describe('validatePhone', () => {
    it('should validate phone numbers with country code', () => {
      expect(validatePhone('+233123456789')).toBe(true)
      expect(validatePhone('+1 (555) 123-4567')).toBe(true)
      expect(validatePhone('+44 20 7123 4567')).toBe(true)
    })

    it('should validate local phone numbers', () => {
      expect(validatePhone('0301234567')).toBe(true)
      expect(validatePhone('02071234567')).toBe(true)
    })

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('123')).toBe(false) // too short
      expect(validatePhone('abcdefgh')).toBe(false) // all letters
      expect(validatePhone('')).toBe(false)
    })
  })

  describe('validateDate', () => {
    it('should validate valid dates', () => {
      expect(validateDate('2024-12-15')).toBe(true)
      expect(validateDate('15/12/2024')).toBe(true)
      expect(validateDate('12/15/2024')).toBe(true)
    })

    it('should reject invalid dates', () => {
      expect(validateDate('2024-13-01')).toBe(false) // invalid month
      expect(validateDate('2024-02-30')).toBe(false) // invalid day
      expect(validateDate('invalid-date')).toBe(false)
      expect(validateDate('')).toBe(false)
    })
  })

  describe('validateRequired', () => {
    it('should pass for non-empty values', () => {
      expect(validateRequired('test')).toBe(true)
      expect(validateRequired(0)).toBe(true)
      expect(validateRequired(false)).toBe(true)
      expect(validateRequired([])).toBe(true)
    })

    it('should fail for empty values', () => {
      expect(validateRequired('')).toBe(false)
      expect(validateRequired(null)).toBe(false)
      expect(validateRequired(undefined)).toBe(false)
    })
  })

  describe('validateMinLength', () => {
    it('should pass values with sufficient length', () => {
      expect(validateMinLength('test', 3)).toBe(true)
      expect(validateMinLength([1, 2, 3], 2)).toBe(true)
    })

    it('should fail values with insufficient length', () => {
      expect(validateMinLength('test', 5)).toBe(false)
      expect(validateMinLength([1], 2)).toBe(false)
    })
  })

  describe('validateMaxLength', () => {
    it('should pass values within limit', () => {
      expect(validateMaxLength('test', 5)).toBe(true)
      expect(validateMaxLength([1, 2], 3)).toBe(true)
    })

    it('should fail values exceeding limit', () => {
      expect(validateMaxLength('test', 3)).toBe(false)
      expect(validateMaxLength([1, 2, 3, 4], 3)).toBe(false)
    })
  })

  describe('validatePattern', () => {
    it('should validate against regex patterns', () => {
      const alphaPattern = /^[a-zA-Z]+$/
      expect(validatePattern('test', alphaPattern)).toBe(true)
      expect(validatePattern('test123', alphaPattern)).toBe(false)
    })

    it('should handle custom patterns', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(validatePattern('test@example.com', emailPattern)).toBe(true)
      expect(validatePattern('invalid-email', emailPattern)).toBe(false)
    })
  })

  describe('complex validation scenarios', () => {
    it('should validate student data combination', () => {
      const studentData = {
        email: 'student@upsamail.edu.gh',
        indexNumber: '12345678',
        phone: '+233123456789',
        password: 'SecurePass123!'
      }

      expect(validateEmail(studentData.email)).toBe(true)
      expect(validateIndexNumber(studentData.indexNumber)).toBe(true)
      expect(validatePhone(studentData.phone)).toBe(true)
      expect(validatePassword(studentData.password)).toBe(true)
    })

    it('should catch invalid student data', () => {
      const invalidStudentData = {
        email: 'invalid-email',
        indexNumber: '123',
        phone: 'abc',
        password: 'weak'
      }

      expect(validateEmail(invalidStudentData.email)).toBe(false)
      expect(validateIndexNumber(invalidStudentData.indexNumber)).toBe(false)
      expect(validatePhone(invalidStudentData.phone)).toBe(false)
      expect(validatePassword(invalidStudentData.password)).toBe(false)
    })
  })
})
