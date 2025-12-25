import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
    
    const variants = {
      primary: 'bg-goldenYellow text-deepNavyBlue hover:bg-yellow-400 focus:ring-goldenYellow',
      secondary: 'bg-deepNavyBlue text-white hover:bg-blue-900 focus:ring-deepNavyBlue',
      outline: 'border-2 border-goldenYellow text-goldenYellow hover:bg-goldenYellow hover:text-deepNavyBlue focus:ring-goldenYellow',
      ghost: 'text-goldenYellow hover:bg-yellow-50 focus:ring-goldenYellow',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-responsive-xs',
      md: 'px-4 py-2 sm:px-6 sm:py-3 text-responsive-base',
      lg: 'px-6 py-3 sm:px-8 sm:py-4 text-responsive-lg',
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
