import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '@/pages/landing/ui/LandingPage'

describe('App', () => {
  test('renders', () => {
    render(<App />)
    expect(screen.getByText('Learn React')).toBeDefined()
  })
})
