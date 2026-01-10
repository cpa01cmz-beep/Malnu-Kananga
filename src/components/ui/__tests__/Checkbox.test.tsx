import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '../Checkbox'

describe('Checkbox Component', () => {
  describe('Rendering', () => {
    it('renders checkbox input', () => {
      render(<Checkbox data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toBeInTheDocument()
      expect(checkbox.tagName).toBe('INPUT')
      expect(checkbox).toHaveAttribute('type', 'checkbox')
    })

    it('renders label text', () => {
      render(<Checkbox label="Accept terms" />)
      expect(screen.getByText('Accept terms')).toBeInTheDocument()
    })

    it('renders description', () => {
      render(<Checkbox label="Email" description="Receive email notifications" />)
      expect(screen.getByText('Receive email notifications')).toBeInTheDocument()
    })

    it('does not render label when not provided', () => {
      render(<Checkbox data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox').closest('label')).toBeNull()
    })
  })

  describe('Controlled Behavior', () => {
    it('calls onChange when clicked', async () => {
      const handleChange = vi.fn()
      render(<Checkbox onChange={handleChange} data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement

      await userEvent.click(checkbox)
      expect(handleChange).toHaveBeenCalledTimes(1)
    })

    it('reflects checked prop', () => {
      const { rerender } = render(<Checkbox checked={false} data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).not.toBeChecked()

      rerender(<Checkbox checked={true} data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toBeChecked()
    })

    it('supports defaultChecked', () => {
      render(<Checkbox defaultChecked={true} data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toBeChecked()
    })
  })

  describe('Indeterminate State', () => {
    it('sets indeterminate property on input', () => {
      render(<Checkbox indeterminate={true} data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox') as HTMLInputElement
      expect(checkbox.indeterminate).toBe(true)
    })

    it('sets aria-checked to mixed when indeterminate', () => {
      render(<Checkbox indeterminate={true} data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-checked', 'mixed')
    })

    it('clears indeterminate when false', () => {
      const { rerender } = render(<Checkbox indeterminate={true} data-testid="checkbox" />)
      let checkbox = screen.getByTestId('checkbox') as HTMLInputElement
      expect(checkbox.indeterminate).toBe(true)

      rerender(<Checkbox indeterminate={false} data-testid="checkbox" />)
      checkbox = screen.getByTestId('checkbox') as HTMLInputElement
      expect(checkbox.indeterminate).toBe(false)
    })
  })

  describe('Disabled State', () => {
    it('disables input when disabled prop is true', () => {
      render(<Checkbox disabled={true} data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toBeDisabled()
    })

    it('does not call onChange when disabled', async () => {
      const handleChange = vi.fn()
      render(<Checkbox disabled={true} onChange={handleChange} data-testid="checkbox" />)

      await userEvent.click(screen.getByTestId('checkbox'))
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('applies disabled cursor style to label', () => {
      render(<Checkbox label="Disabled" disabled={true} />)
      const label = screen.getByText('Disabled').closest('label')
      expect(label).toHaveClass('cursor-not-allowed')
    })
  })

  describe('Size Variants', () => {
    it('applies small size classes', () => {
      render(<Checkbox checkboxSize="sm" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('w-4', 'h-4')
    })

    it('applies medium size classes by default', () => {
      render(<Checkbox data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('w-5', 'h-5')
    })

    it('applies large size classes', () => {
      render(<Checkbox checkboxSize="lg" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('w-6', 'h-6')
    })
  })

  describe('Color Variants', () => {
    it('applies primary color by default', () => {
      render(<Checkbox data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('text-primary-600', 'focus:ring-primary-300')
    })

    it('applies blue color', () => {
      render(<Checkbox color="blue" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('text-blue-600', 'focus:ring-blue-300')
    })

    it('applies green color', () => {
      render(<Checkbox color="green" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('text-green-600', 'focus:ring-green-300')
    })

    it('applies red color', () => {
      render(<Checkbox color="red" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('text-red-600', 'focus:ring-red-300')
    })

    it('applies purple color', () => {
      render(<Checkbox color="purple" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('text-purple-600', 'focus:ring-purple-300')
    })

    it('applies orange color', () => {
      render(<Checkbox color="orange" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('text-orange-600', 'focus:ring-orange-300')
    })
  })

  describe('Label Position', () => {
    it('positions label on right by default', () => {
      const { container } = render(<Checkbox label="Label" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      const label = container.querySelector('label')

      expect(label?.firstChild).toBe(checkbox)
      expect(label?.lastChild).toHaveTextContent('Label')
    })

    it('positions label on left when specified', () => {
      const { container } = render(<Checkbox label="Label" labelPosition="left" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      const label = container.querySelector('label')

      expect(label?.firstChild).toHaveTextContent('Label')
      expect(label?.lastChild).toBe(checkbox)
    })
  })

  describe('Accessibility', () => {
    it('has unique id when not provided', () => {
      render(<Checkbox data-testid="checkbox1" />)
      render(<Checkbox data-testid="checkbox2" />)

      const checkbox1 = screen.getByTestId('checkbox1')
      const checkbox2 = screen.getByTestId('checkbox2')

      expect(checkbox1.id).toBeTruthy()
      expect(checkbox2.id).toBeTruthy()
      expect(checkbox1.id).not.toBe(checkbox2.id)
    })

    it('uses provided id', () => {
      render(<Checkbox id="custom-id" data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toHaveAttribute('id', 'custom-id')
    })

    it('associates label with checkbox via htmlFor', () => {
      render(<Checkbox label="Test Label" data-testid="checkbox" />)
      const label = screen.getByText('Test Label').closest('label')
      const checkbox = screen.getByTestId('checkbox')

      expect(label?.htmlFor).toBe(checkbox.id)
    })

    it('supports aria-label', () => {
      render(<Checkbox aria-label="Custom label" data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-label', 'Custom label')
    })

    it('supports aria-labelledby', () => {
      render(<Checkbox aria-labelledby="label-id" data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-labelledby', 'label-id')
    })

    it('supports aria-describedby', () => {
      render(<Checkbox aria-describedby="desc-id" data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-describedby', 'desc-id')
    })

    it('sets aria-checked correctly when checked', () => {
      render(<Checkbox checked={true} data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-checked', 'true')
    })

    it('sets aria-checked correctly when unchecked', () => {
      render(<Checkbox checked={false} data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-checked', 'false')
    })

    it('sets aria-checked to mixed when indeterminate', () => {
      render(<Checkbox indeterminate={true} data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-checked', 'mixed')
    })

    it('is keyboard accessible', async () => {
      const handleChange = vi.fn()
      render(<Checkbox onChange={handleChange} data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')

      checkbox.focus()
      expect(checkbox).toHaveFocus()

      await userEvent.keyboard(' ')
      expect(handleChange).toHaveBeenCalled()
    })

    it('supports custom className', () => {
      render(<Checkbox className="custom-class" data-testid="checkbox" />)
      expect(screen.getByTestId('checkbox')).toHaveClass('custom-class')
    })

    it('passes through additional props', () => {
      render(<Checkbox data-testid="checkbox" data-value="custom" />)
      expect(screen.getByTestId('checkbox')).toHaveAttribute('data-value', 'custom')
    })
  })

  describe('Focus Management', () => {
    it('calls onFocus when focused', async () => {
      const handleFocus = vi.fn()
      render(<Checkbox onFocus={handleFocus} data-testid="checkbox" />)

      await userEvent.tab()
      expect(handleFocus).toHaveBeenCalled()
    })

    it('calls onBlur when blurred', async () => {
      const handleBlur = vi.fn()
      render(
        <>
          <Checkbox onFocus={vi.fn()} onBlur={handleBlur} data-testid="checkbox1" />
          <Checkbox data-testid="checkbox2" />
        </>
      )

      const checkbox1 = screen.getByTestId('checkbox1')
      checkbox1.focus()

      await userEvent.tab()
      expect(handleBlur).toHaveBeenCalled()
    })
  })

  describe('Forward Ref', () => {
    it('forwards ref to input element', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Checkbox ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('ref allows direct DOM access', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<Checkbox ref={ref} />)

      expect(ref.current?.type).toBe('checkbox')
      expect(ref.current?.tagName).toBe('INPUT')
    })
  })

  describe('Dark Mode', () => {
    it('applies dark mode border classes', () => {
      render(<Checkbox data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('dark:border-neutral-600', 'dark:bg-neutral-900')
    })

    it('applies dark mode focus ring color', () => {
      render(<Checkbox color="blue" data-testid="checkbox" />)
      const checkbox = screen.getByTestId('checkbox')
      expect(checkbox).toHaveClass('dark:focus:ring-blue-700')
    })
  })
})
