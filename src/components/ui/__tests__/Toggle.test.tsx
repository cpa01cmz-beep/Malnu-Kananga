import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Toggle } from '../Toggle'

describe('Toggle Component', () => {
  it('renders correctly', () => {
    render(<Toggle />)
    const input = screen.getByRole('switch')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'checkbox')
  })

  it('renders with label', () => {
    render(<Toggle label="Test Label" />)
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(<Toggle description="Test Description" />)
    expect(screen.getByText('Test Description')).toBeInTheDocument()
  })

  it('handles checked state', () => {
    const handleChange = vi.fn()
    render(<Toggle checked={false} onChange={handleChange} />)
    const input = screen.getByRole('switch')
    expect(input).not.toBeChecked()

    fireEvent.click(input)
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('is checked when checked prop is true', () => {
    render(<Toggle checked={true} />)
    const input = screen.getByRole('switch')
    expect(input).toBeChecked()
  })

  it('handles defaultChecked state', () => {
    render(<Toggle defaultChecked={true} />)
    const input = screen.getByRole('switch')
    expect(input).toBeChecked()
  })

  it('handles disabled state', () => {
    render(<Toggle disabled />)
    const input = screen.getByRole('switch')
    expect(input).toBeDisabled()

    const label = screen.getByRole('switch').closest('label')
    expect(label).toHaveClass('cursor-not-allowed')
  })

  it('applies size sm', () => {
    const { container } = render(<Toggle toggleSize="sm" />)
    const switchElement = container.querySelector('[class*="w-9"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('applies size md', () => {
    const { container } = render(<Toggle toggleSize="md" />)
    const switchElement = container.querySelector('[class*="w-11"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('applies size lg', () => {
    const { container } = render(<Toggle toggleSize="lg" />)
    const switchElement = container.querySelector('[class*="w-14"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('applies primary color', () => {
    const { container } = render(<Toggle color="primary" checked />)
    const switchElement = container.querySelector('[class*="peer-checked:bg-primary-600"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('applies blue color', () => {
    const { container } = render(<Toggle color="blue" checked />)
    const switchElement = container.querySelector('[class*="peer-checked:bg-blue-600"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('applies green color', () => {
    const { container } = render(<Toggle color="green" checked />)
    const switchElement = container.querySelector('[class*="peer-checked:bg-green-600"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('applies red color', () => {
    const { container } = render(<Toggle color="red" checked />)
    const switchElement = container.querySelector('[class*="peer-checked:bg-red-600"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('applies purple color', () => {
    const { container } = render(<Toggle color="purple" checked />)
    const switchElement = container.querySelector('[class*="peer-checked:bg-purple-600"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('applies orange color', () => {
    const { container } = render(<Toggle color="orange" checked />)
    const switchElement = container.querySelector('[class*="peer-checked:bg-orange-600"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('handles labelPosition left', () => {
    const { container } = render(<Toggle label="Test" labelPosition="left" />)
    const label = container.querySelector('label')
    expect(label).toBeInTheDocument()
  })

  it('handles labelPosition right', () => {
    const { container } = render(<Toggle label="Test" labelPosition="right" />)
    const label = container.querySelector('label')
    expect(label).toHaveClass('justify-between')
  })

  it('applies custom className', () => {
    const { container } = render(<Toggle className="custom-class" />)
    const label = container.querySelector('label')
    expect(label).toHaveClass('custom-class')
  })

  it('generates unique id when not provided', () => {
    render(<Toggle />)
    const input = screen.getByRole('switch')
    expect(input).toHaveAttribute('id')
  })

  it('uses provided id', () => {
    render(<Toggle id="test-id" />)
    const input = screen.getByRole('switch')
    expect(input).toHaveAttribute('id', 'test-id')
  })

  it('has proper ARIA attributes', () => {
    render(<Toggle aria-label="Toggle notifications" />)
    const input = screen.getByRole('switch', { name: 'Toggle notifications' })
    expect(input).toBeInTheDocument()
  })

  it('supports aria-labelledby', () => {
    render(<Toggle aria-labelledby="label-id" />)
    const input = screen.getByRole('switch')
    expect(input).toHaveAttribute('aria-labelledby', 'label-id')
  })

  it('supports aria-describedby', () => {
    render(<Toggle aria-describedby="description-id" />)
    const input = screen.getByRole('switch')
    expect(input).toHaveAttribute('aria-describedby', 'description-id')
  })

  it('has correct role attribute', () => {
    render(<Toggle />)
    const input = screen.getByRole('switch')
    expect(input).toHaveAttribute('role', 'switch')
  })

  it('has aria-checked attribute', () => {
    render(<Toggle checked={true} />)
    const input = screen.getByRole('switch')
    expect(input).toHaveAttribute('aria-checked', 'true')
  })

  it('handles focus event', () => {
    const handleFocus = vi.fn()
    render(<Toggle onFocus={handleFocus} />)
    const input = screen.getByRole('switch')
    input.focus()
    expect(handleFocus).toHaveBeenCalled()
  })

  it('handles blur event', () => {
    const handleBlur = vi.fn()
    render(<Toggle onBlur={handleBlur} />)
    const input = screen.getByRole('switch')
    input.focus()
    input.blur()
    expect(handleBlur).toHaveBeenCalled()
  })

  it('applies dark mode classes', () => {
    const { container } = render(<Toggle />)
    const switchElement = container.querySelector('[class*="dark:bg-neutral-700"]')
    expect(switchElement).toBeInTheDocument()
  })

  it('is keyboard accessible', () => {
    const handleChange = vi.fn()
    render(<Toggle onChange={handleChange} />)
    const label = screen.getByRole('switch').closest('label')
    label?.focus()
    fireEvent.keyDown(label || document.body, { key: 'Enter' })
  })

  it('supports ref forwarding', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Toggle ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })
})
