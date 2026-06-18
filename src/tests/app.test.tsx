import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import App from '../App'

describe('App', () => {
  it('renders the two primary project entries', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /面向 CFD 工程人员和 Fluent 初学者/,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: '参数计算' }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: 'Fluent 功能导览' }).length,
    ).toBeGreaterThan(0)
  })
})
