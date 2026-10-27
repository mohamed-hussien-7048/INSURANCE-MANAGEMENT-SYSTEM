import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { customerApi, type Customer, type CustomerInput } from '../services/customer-api'
import { useCustomers } from '../hooks/useCustomers'

vi.mock('../services/customer-api', () => ({
  customerApi: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

const customer: Customer = {
  id: '101',
  firstName: 'Mohamed',
  lastName: 'Hussein',
  fullName: 'Mohamed Hussein',
  email: 'mohamed@example.com',
  phoneNumber: '01000000000',
  dateOfBirth: '2002-03-16',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: null,
}

const updatedCustomer: Customer = {
  ...customer,
  firstName: 'Ahmed',
  fullName: 'Ahmed Hussein',
}

const validInput: CustomerInput = {
  firstName: 'Ahmed',
  lastName: 'Hussein',
  email: 'ahmed@example.com',
  phoneNumber: '01000000000',
  dateOfBirth: '2000-01-01',
}

const mockedApi = vi.mocked(customerApi)

beforeEach(() => {
  vi.resetAllMocks()
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

describe('useCustomers', () => {
  it('loads customers successfully', async () => {
    mockedApi.getAll.mockResolvedValue([customer])

    const { result } = renderHook(() => useCustomers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.customers).toEqual([customer])
    expect(result.current.filteredCustomers).toEqual([customer])
    expect(result.current.error).toBe('')
    expect(mockedApi.getAll).toHaveBeenCalledTimes(1)
  })

  it('reports an error when loading customers fails', async () => {
    mockedApi.getAll.mockRejectedValue(new Error('Network unavailable'))

    const { result } = renderHook(() => useCustomers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Network unavailable')
    expect(result.current.customers).toEqual([])
  })

  it('filters customers by name without changing the original list', async () => {
    mockedApi.getAll.mockResolvedValue([customer, updatedCustomer])

    const { result } = renderHook(() => useCustomers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setSearch('ahmed')
    })

    expect(result.current.filteredCustomers).toEqual([updatedCustomer])
    expect(result.current.customers).toEqual([customer, updatedCustomer])
  })

  it('normalizes input before creating a customer and reloads the list', async () => {
    mockedApi.getAll
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([customer])

    mockedApi.create.mockResolvedValue(customer)

    const { result } = renderHook(() => useCustomers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const input: CustomerInput = {
      firstName: '  Mohamed  ',
      lastName: ' Hussein ',
      email: '  mohamed@example.com  ',
      phoneNumber: '   ',
      dateOfBirth: '',
    }

    await act(async () => {
      await result.current.handleSubmit(input)
    })

    expect(mockedApi.create).toHaveBeenCalledWith({
      firstName: 'Mohamed',
      lastName: 'Hussein',
      email: 'mohamed@example.com',
      phoneNumber: null,
      dateOfBirth: null,
    })

    expect(mockedApi.getAll).toHaveBeenCalledTimes(2)
    expect(result.current.customers).toEqual([customer])
    expect(result.current.saving).toBe(false)
    expect(result.current.editingId).toBeNull()
  })

  it('updates the selected customer with normalized input', async () => {
    mockedApi.getAll
      .mockResolvedValueOnce([customer])
      .mockResolvedValueOnce([updatedCustomer])

    mockedApi.update.mockResolvedValue(updatedCustomer)

    const { result } = renderHook(() => useCustomers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.startEditing(customer)
    })

    await act(async () => {
      await result.current.handleSubmit({
        ...validInput,
        firstName: '  Ahmed  ',
      })
    })

    expect(mockedApi.update).toHaveBeenCalledWith('101', {
      ...validInput,
      firstName: 'Ahmed',
    })

    expect(result.current.customers).toEqual([updatedCustomer])
    expect(result.current.editingId).toBeNull()
    expect(result.current.saving).toBe(false)
  })

  it('deletes a customer after confirmation and updates the list', async () => {
    mockedApi.getAll.mockResolvedValue([customer])
    mockedApi.delete.mockResolvedValue(undefined)

    const { result } = renderHook(() => useCustomers())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.handleDelete(customer)
    })

    expect(window.confirm).toHaveBeenCalledTimes(1)
    expect(mockedApi.delete).toHaveBeenCalledWith('101')
    expect(result.current.customers).toEqual([])
  })
})
