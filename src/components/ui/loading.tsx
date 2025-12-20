import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingSkeletonProps {
  className?: string
  children?: React.ReactNode
}

export const LoadingSkeleton = ({ className, children }: LoadingSkeletonProps) => {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200',
        className
      )}
    >
      {children}
    </div>
  )
}

interface LoadingCardProps {
  title?: boolean
  lines?: number
  className?: string
}

export const LoadingCard = ({ title = true, lines = 3, className }: LoadingCardProps) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border p-6', className)}>
      {title && (
        <LoadingSkeleton className="h-6 w-32 mb-4" />
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <LoadingSkeleton
            key={i}
            className={cn(
              'h-4',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export const LoadingTable = ({ rows = 5, columns = 4, className }: LoadingTableProps) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm border overflow-hidden', className)}>
      <div className="border-b">
        <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, i) => (
            <LoadingSkeleton key={i} className="h-4" />
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <LoadingSkeleton
                key={colIndex}
                className={cn(
                  'h-4',
                  colIndex === columns - 1 ? 'w-2/3' : 'w-full'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingPageProps {
  message?: string
  className?: string
}

export const LoadingPage = ({ message = 'Loading...', className }: LoadingPageProps) => {
  return (
    <div className={cn('min-h-screen bg-gray-50 flex items-center justify-center', className)}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
  className?: string
}

export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false, 
  className 
}: LoadingButtonProps) => {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  )
}
