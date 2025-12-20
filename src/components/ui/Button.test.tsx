import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
    expect(button).toHaveClass('bg-blue-600', 'text-white')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="secondary">Secondary</Button>)
    let button = screen.getByRole('button')
    
    expect(button).toHaveClass('bg-gray-600', 'text-white')
    
    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button')
    
    expect(button).toHaveClass('border-2', 'border-blue-600', 'text-blue-600')
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="small">Small</Button>)
    let button = screen.getByRole('button')
    
    expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
    
    rerender(<Button size="large">Large</Button>)
    button = screen.getByRole('button')
    
    expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    const handleClick = jest.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    )
    
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
    
    // Check for loading spinner
    const spinner = button.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    
    // Check for loading text
    expect(button).toHaveTextContent('Loading...')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('supports keyboard navigation', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button')
    
    // Test Enter key
    fireEvent.keyDown(button, { key: 'Enter' })
    expect(handleClick).toHaveBeenCalledTimes(1)
    
    // Reset mock
    handleClick.mockClear()
    
    // Test Space key
    fireEvent.keyDown(button, { key: ' ' })
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<Button aria-label="Custom label">Button</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })

  it('renders with start and end icons', () => {
    const StartIcon = () => <span data-testid="start-icon">Start</span>
    const EndIcon = () => <span data-testid="end-icon">End</span>
    
    render(
      <Button startIcon={<StartIcon />} endIcon={<EndIcon />}>
        With Icons
      </Button>
    )
    
    const button = screen.getByRole('button')
    const startIcon = screen.getByTestId('start-icon')
    const endIcon = screen.getByTestId('end-icon')
    
    expect(startIcon).toBeInTheDocument()
    expect(endIcon).toBeInTheDocument()
    expect(button).toHaveTextContent('With Icons')
  })

  it('handles focus events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(
      <Button onFocus={handleFocus} onBlur={handleBlur}>
        Focus Test
      </Button>
    )
    
    const button = screen.getByRole('button')
    
    fireEvent.focus(button)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(button)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('supports different button types', () => {
    render(<Button type="submit">Submit</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('renders as different element when as prop is provided', () => {
    render(<Button as="a" href="https://example.com">Link</Button>)
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  // Integration tests
  describe('Button Integration', () => {
    it('works in forms', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('works with disabled form', () => {
      const handleSubmit = jest.fn()
      
      render(
        <form disabled onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  // Performance tests
  describe('Button Performance', () => {
    it('renders efficiently', () => {
      const startTime = performance.now()
      
      render(<Button>Performance Test</Button>)
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within 50ms
      expect(renderTime).toBeLessThan(50)
    })

    it('handles rapid clicks without errors', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Rapid Click</Button>)
      
      const button = screen.getByRole('button')
      
      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button)
      }
      
      expect(handleClick).toHaveBeenCalledTimes(10)
    })
  })

  // Edge cases
  describe('Button Edge Cases', () => {
    it('handles empty children', () => {
      render(<Button></Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('')
    })

    it('handles null children gracefully', () => {
      render(<Button>{null}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('handles long text content', () => {
      const longText = 'A'.repeat(1000)
      render(<Button>{longText}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(longText)
    })
  })
})
