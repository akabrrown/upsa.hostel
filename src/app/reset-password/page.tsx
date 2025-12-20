'use client'

import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, handleApiError } from '@/lib/api'
import Image from 'next/image'
import { Home, ArrowLeft } from 'lucide-react'

const ResetPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
})

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: ResetPasswordSchema,
    onSubmit: async (values) => {
      setIsLoading(true)
      setError('')
      
      try {
        // This would be your actual API call for password reset
        // await authApi.resetPassword(values.email)
        
        // For now, simulate success
        setSuccess(true)
      } catch (error: any) {
        const errorMessage = handleApiError(error, 'Password reset failed')
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
  })

  if (success) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(https://upsa.edu.gh/wp-content/uploads/2020/08/slide-7.jpg)'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-6">
              <div className="flex justify-center mb-4">
                <Image 
                  src="https://educareguide.com/wp-content/uploads/2021/01/UPSA-Students-Portal-Login-300x115.jpg" 
                  alt="UPSA Logo" 
                  width={150}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-deepNavyBlue mb-2">
                Password Reset Email Sent!
              </h2>
              <p className="text-gray-600 mb-6">
                We&apos;ve sent a password reset link to your email address. Please check your inbox and follow the instructions.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Back to Login
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
              Reset Password
            </h1>
            <p className="text-gray-600">Enter your email to receive password reset instructions</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Remember your password?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-500">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
