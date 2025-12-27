# Component Documentation - UPSA Hostel Management System

## Overview
This document provides comprehensive documentation for all reusable components in the UPSA Hostel Management System. Components are organized by category and include usage examples, props, and styling information.

## Table of Contents
- [UI Components](#ui-components)
- [Form Components](#form-components)
- [Chart Components](#chart-components)
- [Security Components](#security-components)
- [Responsive Components](#responsive-components)
- [Animation Components](#animation-components)

## UI Components

### Button
A versatile button component with multiple variants and sizes.

**Location:** `src/components/ui/Button.tsx`

**Props:**
```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  as?: React.ElementType
}
```

**Usage:**
```tsx
import { Button } from '@/components/ui/Button'

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>

// With sizes
<Button size="large">Large Button</Button>

// With icons
<Button startIcon={<PlusIcon />}>Add Item</Button>

// Loading state
<Button loading>Processing...</Button>

// Disabled state
<Button disabled>Disabled</Button>
```

### Card
A flexible card component for displaying content.

**Location:** `src/components/ui/Card.tsx`

**Props:**
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'small' | 'medium' | 'large'
  shadow?: 'none' | 'small' | 'medium' | 'large'
  rounded?: 'none' | 'small' | 'medium' | 'large'
  hover?: boolean
}
```

**Usage:**
```tsx
import { Card } from '@/components/ui/Card'

<Card padding="medium" shadow="medium" hover>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### Badge
A small badge component for status indicators.

**Location:** `src/components/ui/Badge.tsx`

**Props:**
```typescript
interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'small' | 'medium' | 'large'
  className?: string
}
```

**Usage:**
```tsx
import { Badge } from '@/components/ui/Badge'

<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Inactive</Badge>
```

### Modal
A customizable modal component for dialogs and overlays.

**Location:** `src/components/ui/Modal.tsx`

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large' | 'full'
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  className?: string
}
```

**Usage:**
```tsx
import { Modal } from '@/components/ui/Modal'

<Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit User">
  <p>Modal content here</p>
</Modal>
```

### Table
A comprehensive table component with sorting, filtering, and pagination.

**Location:** `src/components/ui/Table.tsx`

**Props:**
```typescript
interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: PaginationConfig
  sortable?: boolean
  filterable?: boolean
  className?: string
  onRowClick?: (row: T) => void
}

interface TableColumn<T> {
  key: keyof T
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
}
```

**Usage:**
```tsx
import { Table } from '@/components/ui/Table'

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email' },
  { key: 'status', title: 'Status', render: (value) => (
    <Badge variant={value === 'active' ? 'success' : 'error'}>{value}</Badge>
  )}
]

<Table data={users} columns={columns} pagination />
```

## Form Components

### FormikField
A Formik-integrated field component for consistent form inputs.

**Location:** `src/components/forms/FormikField.tsx`

**Props:**
```typescript
interface FormikFieldProps {
  name: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  helperText?: string
  className?: string
}
```

**Usage:**
```tsx
import { FormikField } from '@/components/forms/FormikField'

<FormikField name="email" type="email" label="Email Address" required />
<FormikField name="password" type="password" label="Password" />
```

### ReservationForm
A multi-step reservation form with validation.

**Location:** `src/components/forms/ReservationForm.tsx`

**Props:**
```typescript
interface ReservationFormProps {
  onSubmit: (data: ReservationData) => void
  initialData?: Partial<ReservationData>
  className?: string
}
```

**Usage:**
```tsx
import { ReservationForm } from '@/components/forms/ReservationForm'

<ReservationForm onSubmit={handleReservationSubmit} />
```

## Chart Components

### Charts
A collection of D3.js-based chart components with GSAP animations.

**Location:** `src/components/charts/Charts.tsx`

**Available Charts:**
- `OccupancyChart` - Bar chart for occupancy rates
- `PaymentTrendsChart` - Line chart for payment trends
- `StudentDemographicsChart` - Pie chart for demographics
- `RoomAllocationChart` - Donut chart for room allocation

**Usage:**
```tsx
import { 
  OccupancyChart, 
  PaymentTrendsChart, 
  StudentDemographicsChart 
} from '@/components/charts/Charts'

<OccupancyChart data={occupancyData} />
<PaymentTrendsChart data={paymentData} />
<StudentDemographicsChart data={demographicsData} />
```

## Security Components

### AccessibleButton
An accessible button component with proper ARIA attributes.

**Location:** `src/components/ui/accessibility.tsx`

**Props:**
```typescript
interface AccessibleButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  ariaLabel?: string
  ariaDescribedBy?: string
  className?: string
}
```

**Usage:**
```tsx
import { AccessibleButton } from '@/components/ui/accessibility'

<AccessibleButton 
  onClick={handleClick}
  ariaLabel="Submit form"
  ariaDescribedBy="form-help"
>
  Submit
</AccessibleButton>
```

### AccessibleModal
An accessible modal with focus management.

**Location:** `src/components/ui/accessibility.tsx`

**Usage:**
```tsx
import { AccessibleModal } from '@/components/ui/accessibility'

<AccessibleModal 
  isOpen={isOpen} 
  onClose={handleClose} 
  title="User Profile"
>
  <p>Modal content</p>
</AccessibleModal>
```

## Responsive Components

### ResponsiveContainer
A responsive container wrapper.

**Location:** `src/components/ui/responsive.tsx`

**Usage:**
```tsx
import { ResponsiveContainer } from '@/components/ui/responsive'

<ResponsiveContainer>
  <p>Content that adapts to screen size</p>
</ResponsiveContainer>
```

### ResponsiveGrid
A responsive grid layout component.

**Location:** `src/components/ui/responsive.tsx`

**Props:**
```typescript
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: { mobile: number; tablet: number; desktop: number }
  gap?: number
  className?: string
}
```

**Usage:**
```tsx
import { ResponsiveGrid } from '@/components/ui/responsive'

<ResponsiveGrid cols={{ mobile: 1, tablet: 2, desktop: 3 }} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</ResponsiveGrid>
```

### ResponsiveTable
A table that adapts to mobile screens.

**Location:** `src/components/ui/responsive.tsx`

**Usage:**
```tsx
import { ResponsiveTable } from '@/components/ui/responsive'

<ResponsiveTable 
  headers={tableHeaders} 
  data={tableData}
/>
```

### MobileNavigation
A mobile-friendly navigation component.

**Location:** `src/components/ui/responsive.tsx`

**Usage:**
```tsx
import { MobileNavigation } from '@/components/ui/responsive'

<MobileNavigation isOpen={isNavOpen} onToggle={toggleNav}>
  <nav>Navigation items</nav>
</MobileNavigation>
```

## Animation Components

### AnimatedButton
A button with GSAP animations.

**Location:** `src/components/ui/animations.tsx`

**Usage:**
```tsx
import { AnimatedButton } from '@/components/ui/animations'

<AnimatedButton animation="bounce">Click me</AnimatedButton>
```

### AnimatedCard
A card with entrance animations.

**Location:** `src/components/ui/animations.tsx`

**Usage:**
```tsx
import { AnimatedCard } from '@/components/ui/animations'

<AnimatedCard animation="fadeInUp">
  <p>Card content</p>
</AnimatedCard>
```

### LoadingSkeleton
A skeleton loading component.

**Location:** `src/components/ui/animations.tsx`

**Usage:**
```tsx
import { LoadingSkeleton } from '@/components/ui/animations'

<LoadingSkeleton lines={3} />
```

## Performance Components

### LazyImage
An image component with lazy loading.

**Location:** `src/components/ui/performance.tsx`

**Usage:**
```tsx
import { LazyImage } from '@/components/ui/performance'

<LazyImage 
  src="/image.jpg" 
  alt="Description"
  placeholder="/placeholder.jpg"
/>
```

### VirtualList
A virtual scrolling list for large datasets.

**Location:** `src/components/ui/performance.tsx`

**Usage:**
```tsx
import { VirtualList } from '@/components/ui/performance'

<VirtualList 
  items={largeDataset}
  itemHeight={50}
  renderItem={(item, index) => <div>{item.name}</div>}
/>
```

## Hooks

### useResponsive
Hook for responsive breakpoint detection.

**Location:** `src/components/ui/responsive.tsx`

**Usage:**
```tsx
import { useResponsive } from '@/components/ui/responsive'

const { isMobile, isTablet, isDesktop } = useResponsive()
```

### useDebounce
Hook for debouncing values.

**Location:** `src/components/ui/performance.tsx`

**Usage:**
```tsx
import { useDebounce } from '@/components/ui/performance'

const debouncedValue = useDebounce(searchTerm, 300)
```

### usePerformanceMonitor
Hook for performance monitoring.

**Location:** `src/components/ui/performance.tsx`

**Usage:**
```tsx
import { usePerformanceMonitor } from '@/components/ui/performance'

const metrics = usePerformanceMonitor()
```

## Styling

### Theme Configuration
All components use Tailwind CSS with a consistent theme:

```css
/* Primary Colors */
--color-primary: #3b82f6
--color-primary-hover: #2563eb
--color-primary-light: #dbeafe

/* Secondary Colors */
--color-secondary: #6b7280
--color-secondary-hover: #4b5563

/* Success Colors */
--color-success: #10b981
--color-success-light: #d1fae5

/* Warning Colors */
--color-warning: #f59e0b
--color-warning-light: #fef3c7

/* Error Colors */
--color-error: #ef4444
--color-error-light: #fee2e2
```

### Custom CSS Classes
Components support custom CSS classes for additional styling:

```tsx
<Button className="custom-button-class">Custom Button</Button>
<Card className="border-2 border-blue-500">Custom Card</Card>
```

## Best Practices

### Component Guidelines
1. **Consistent Props**: Use consistent prop naming across components
2. **Accessibility**: Ensure all components are accessible
3. **Performance**: Optimize for performance with lazy loading and virtualization
4. **Responsive**: Design components to work on all screen sizes
5. **Testing**: Include comprehensive tests for all components

### Usage Guidelines
1. **Import Statements**: Use absolute imports from @/components
2. **TypeScript**: Always use TypeScript interfaces for props
3. **Documentation**: Document all props with JSDoc comments
4. **Error Handling**: Implement proper error boundaries
5. **Loading States**: Include loading states for async operations

## Testing

### Component Tests
All components include comprehensive tests using Jest and React Testing Library:

```bash
# Run component tests
npm test -- --testPathPattern=components

# Run tests with coverage
npm test -- --coverage --testPathPattern=components
```

### Storybook
Components are documented with Storybook for visual testing:

```bash
# Run Storybook
npm run storybook
```

## Contributing

### Adding New Components
1. Create component in appropriate directory
2. Add TypeScript interfaces for props
3. Include comprehensive documentation
4. Write tests for the component
5. Add Storybook stories
6. Update this documentation

### Component Standards
- Use functional components with hooks
- Implement proper TypeScript types
- Include accessibility features
- Add proper error handling
- Support responsive design
- Include loading states where applicable

## Support

For component-related issues and questions:
- Documentation: Available in project repository
- Examples: Available in Storybook
- Issues: Create GitHub issue
- Contact: components@upsamail.edu.gh
