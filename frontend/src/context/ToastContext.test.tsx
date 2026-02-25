import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ToastProvider, useToast } from './ToastContext'

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
)

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should start with no toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper })
    expect(result.current.toasts).toHaveLength(0)
  })

  it('should add a toast with correct fields', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.toast('Teste!', 'success')
    })

    expect(result.current.toasts).toHaveLength(1)
    expect(result.current.toasts[0].message).toBe('Teste!')
    expect(result.current.toasts[0].variant).toBe('success')
  })

  it('should default variant to success', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.toast('Mensagem padrão')
    })

    expect(result.current.toasts[0].variant).toBe('success')
  })

  it('should support all variants', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.toast('success', 'success')
      result.current.toast('error', 'error')
      result.current.toast('warning', 'warning')
      result.current.toast('info', 'info')
    })

    const variants = result.current.toasts.map(t => t.variant)
    expect(variants).toContain('success')
    expect(variants).toContain('error')
    expect(variants).toContain('warning')
    expect(variants).toContain('info')
  })

  it('should dismiss a toast by id', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => { result.current.toast('Para remover', 'info') })
    const id = result.current.toasts[0].id
    act(() => { result.current.dismiss(id) })

    expect(result.current.toasts).toHaveLength(0)
  })

  it('should auto-dismiss after duration', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => { result.current.toast('Auto dismiss', 'info', 2000) })
    expect(result.current.toasts).toHaveLength(1)

    act(() => { vi.advanceTimersByTime(2001) })
    expect(result.current.toasts).toHaveLength(0)
  })

  it('should accumulate multiple toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper })

    act(() => {
      result.current.toast('T1', 'success')
      result.current.toast('T2', 'error')
      result.current.toast('T3', 'warning')
    })

    expect(result.current.toasts).toHaveLength(3)
  })
})
