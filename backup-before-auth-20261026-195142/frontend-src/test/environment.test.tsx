import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function TestStatus() {
  return <div role="status">Testing environment ready</div>
}

describe('Frontend test environment', () => {
  it('renders a React component and checks its content', () => {
    render(<TestStatus />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Testing environment ready',
    )
  })
})
