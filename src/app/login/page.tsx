'use client'

import { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice'
import { authApi, setApiAuth, handleApiError } from '@/lib/api'
import { loginSchema } from '@/lib/security/validation'
import { RootState } from '@/store'
import Image from 'next/image'
import { Home, ArrowLeft } from 'lucide-react'

const LoginSchema = Yup.object().shape({
  identifier: Yup.string().required('Email or Index Number is required'),
  password: Yup.string().required('Password or Date of Birth is required'),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const dispatch = useDispatch()
  const router = useRouter()

  const formik = useFormik({
    initialValues: {
      identifier: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setIsLoading(true)
      setError('')
      dispatch(loginStart())

      try {
        // Determine if it's student or staff based on identifier format
        const isStudent = /^\d{8}$/.test(values.identifier)
        
        let response
        if (isStudent) {
          // Student authentication with index number + DOB
          response = await authApi.login({
            email: `${values.identifier}@upsamail.edu.gh`,
            password: values.password ? values.password.replace(/-/g, '') : '',
            role: 'student'
          }) as { error?: string; user?: any; session?: any }
        } else {
          // Staff authentication with email + password
          response = await authApi.login({
            email: values.identifier,
            password: values.password,
            // role: 'staff' // Allow backend to determine role for email logins
          }) as { error?: string; user?: any; session?: any }
        }

        if (response.error) {
          throw new Error(response.error)
        }

        const { user, session } = response

        // Store auth token
        setApiAuth(session.access_token)

        dispatch(loginSuccess({
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
          },
          token: session.access_token,
        }))

        // Redirect based on role
        const redirectMap = {
          student: '/student/dashboard',
          admin: '/admin/dashboard',
          porter: '/porter/dashboard',
          director: '/director/dashboard',
        }

        router.push(redirectMap[user.role as keyof typeof redirectMap])
      } catch (error: any) {
        const errorMessage = handleApiError(error, 'Login failed')
        setError(errorMessage)
        dispatch(loginFailure())
      } finally {
        setIsLoading(false)
      }
    },
  })

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
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
              Email or Index Number
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              value={formik.values.identifier}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="input-field"
              placeholder="Email address or 8-digit index number"
            />
            {formik.touched.identifier && formik.errors.identifier && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.identifier}</div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {/^\d{8}$/.test(formik.values.identifier) ? 'Date of Birth' : 'Password'}
            </label>
            <input
              id="password"
              name="password"
              type={/^\d{8}$/.test(formik.values.identifier) ? 'date' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="input-field"
              placeholder={/^\d{8}$/.test(formik.values.identifier) ? 'YYYY-MM-DD' : 'Enter your password'}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>Students:</strong> Enter your 8-digit index number and date of birth
            </p>
            <p>
              <strong>Staff:</strong> Enter your email address and password
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <Link href="/reset-password" className="text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  </div>
  )
}
