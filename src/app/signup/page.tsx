'use client'

import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, handleApiError } from '@/lib/api'
import { commonSchemas } from '@/lib/validation'
import Image from 'next/image'
import { Home, ArrowLeft } from 'lucide-react'

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      indexNumber: '',
      dateOfBirth: '',
      phone: '',
      email: '',
    },
    validationSchema: commonSchemas.signup,
    onSubmit: async (values) => {
      setIsLoading(true)
      setError('')

      try {
        // Add UPSA prefix to index number for backend
        const fullIndexNumber = `UPSA${values.indexNumber}`
        
        const response = await authApi.signup({
          indexNumber: fullIndexNumber,
          dateOfBirth: values.dateOfBirth,
          phone: values.phone,
          email: values.email,
          // Use date of birth as password
          password: values.dateOfBirth,
          confirmPassword: values.dateOfBirth,
        }) as { error?: string; user?: any; session?: any }

        if (response.error) {
          throw new Error(response.error)
        }

        const { user, session } = response

        setSuccess(true)
      } catch (error: any) {
        const errorMessage = handleApiError(error, 'Signup failed')
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
  })

  // Auto-fill email when index number changes
  const handleIndexNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const indexNumber = e.target.value
    formik.setFieldValue('indexNumber', indexNumber)
    
    // Auto-fill email if index number is valid format (8 digits)
    if (/^\d{8}$/.test(indexNumber)) {
      const email = `${indexNumber}@upsamail.edu.gh`
      formik.setFieldValue('email', email)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg)'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-deepNavyBlue mb-2">
                Registration Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your account has been created successfully. Please check your email to verify your account.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="btn-primary"
              >
                Go to Login
              </button>
            </div>
        </div>
      </div>
    </div>
  )
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg)'}}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center space-x-2 text-white hover:text-blue-400 transition-colors duration-300 z-10 group"
      >
        <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20 backdrop-blur-sm transition-all">
          <ArrowLeft className="w-5 h-5" />
        </div>
        <div className="flex items-center space-x-1 font-medium">
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </div>
      </Link>

      <div className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image 
              src="https://educareguide.com/wp-content/uploads/2021/01/UPSA-Students-Portal-Login-300x115.jpg" 
              alt="UPSA Logo" 
              width={150}
              height={40}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-deepNavyBlue mb-2">
            Student Registration
          </h1>
          <p className="text-gray-600">Create your student account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="indexNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Index Number
            </label>
            <input
              id="indexNumber"
              name="indexNumber"
              type="text"
              value={formik.values.indexNumber}
              onChange={handleIndexNumberChange}
              onBlur={formik.handleBlur}
              className="input-field"
              placeholder="e.g. 12345678"
            />
            {formik.touched.indexNumber && formik.errors.indexNumber && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.indexNumber}</div>
            )}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth (will be used as password)
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              value={formik.values.dateOfBirth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="input-field"
            />
            {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.dateOfBirth}</div>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="input-field"
              placeholder="Phone number"
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.phone}</div>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address (auto-filled from index number)
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="input-field"
              placeholder="Will auto-fill when index number is entered"
              readOnly
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  )
}
