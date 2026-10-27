
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { CustomerForm } from '../components/customers/CustomerForm'
import type { CustomerInput } from '../services/customer-api'

const emptyForm: CustomerInput = {
  firstName: '',
  lastName: '',
  email: null,
  phoneNumber: null,
  dateOfBirth: null,
}

function renderForm(
  overrides: Partial<Parameters<typeof CustomerForm>[0]> = {},
) {
  const props = {
    form: emptyForm,
    editingId: null,
    saving: false,
    onFieldChange: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onReset: vi.fn(),
    ...overrides,
  }

  return {
    ...render(<CustomerForm {...props} />),
    props,
  }
}

afterEach(() => {
  cleanup()
})

describe('CustomerForm', () => {
  it('renders the customer fields', () => {
    renderForm()

    expect(
      screen.getByPlaceholderText('name@example.com'),
    ).toBeInTheDocument()

    expect(document.querySelectorAll('input[required]')).toHaveLength(2)
    expect(document.querySelector('input[type="tel"]')).toBeInTheDocument()
    expect(document.querySelector('input[type="date"]')).toBeInTheDocument()
  })







it('calls onFieldChange when a field changes', async () => {
  const user = userEvent.setup()
  const { props } = renderForm()

  const firstNameInput = document.querySelectorAll('input')[0]

  expect(firstNameInput).toBeDefined()

  if (!firstNameInput) {
    throw new Error('First name input was not found')
  }

  await user.type(firstNameInput, 'Mohamed')

  expect(props.onFieldChange).toHaveBeenCalledTimes(7)
  expect(props.onFieldChange).toHaveBeenNthCalledWith(
    1,
    'firstName',
    'M',
  )
  expect(props.onFieldChange).toHaveBeenNthCalledWith(
    7,
    'firstName',
    'd',
  )
})







  it('submits the current form data', async () => {
    const user = userEvent.setup()

    const form: CustomerInput = {
      firstName: 'Mohamed',
      lastName: 'Hussein',
      email: 'mohamed@example.com',
      phoneNumber: '01000000000',
      dateOfBirth: '2002-03-16',
    }

    const { props } = renderForm({ form })

    await user.click(
      screen.getByRole('button', { name: 'إضافة العميل' }),
    )

    await waitFor(() => {
      expect(props.onSubmit).toHaveBeenCalledWith(form)
    })
  })

  it('disables submit while saving', () => {
    renderForm({ saving: true })

    expect(
      screen.getByRole('button', { name: 'جارٍ الحفظ...' }),
    ).toBeDisabled()
  })

  it('shows the edit cancel button and calls onReset', async () => {
    const user = userEvent.setup()
    const { props } = renderForm({ editingId: '101' })

    await user.click(
      screen.getByRole('button', { name: 'إلغاء التعديل' }),
    )

    expect(props.onReset).toHaveBeenCalledTimes(1)
  })

  it('calls onReset when the clear button is clicked', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()

    await user.click(
      screen.getByRole('button', { name: 'مسح الحقول' }),
    )

    expect(props.onReset).toHaveBeenCalledTimes(1)
  })

  it('does not submit when required fields are empty', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()

    await user.click(
      screen.getByRole('button', { name: 'إضافة العميل' }),
    )

    expect(props.onSubmit).not.toHaveBeenCalled()
  })
})