import { describe, expect, it } from 'vitest'
import { assertNotification, NotificationDeliveryError } from './notification'

describe('notification', () => {
  it('accepts a structured notification without changing its content', () => {
    const notification = { title: '  Alert  ', body: '  Body  ' }

    assertNotification(notification)

    expect(notification).toEqual({ title: '  Alert  ', body: '  Body  ' })
  })

  it.each([
    undefined,
    null,
    'Alert',
    {},
    { title: 1 },
    { title: '' },
    { title: '   ' },
    { title: 'Alert', body: 1 },
  ])('rejects invalid notification %#', (notification) => {
    expect(() => assertNotification(notification)).toThrow(TypeError)
  })

  it('exposes aggregate delivery details', () => {
    const cause = new Error('network failure')
    const error = new NotificationDeliveryError([
      { target: 'test://one', cause },
      { target: 'test://two', cause: 'rejected' },
    ], 1)

    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('NotificationDeliveryError')
    expect(error.message).toBe('Failed to deliver notification to 2 of 3 targets')
    expect(error.failures).toEqual([
      { target: 'test://one', cause },
      { target: 'test://two', cause: 'rejected' },
    ])
    expect(error.successCount).toBe(1)
    expect(error.failureCount).toBe(2)
  })
})
