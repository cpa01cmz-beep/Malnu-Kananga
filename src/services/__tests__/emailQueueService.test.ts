import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { emailQueueService } from '../emailQueueService'
import { logger } from '../../utils/logger'
import { STORAGE_KEYS, EMAIL_CONFIG } from '../../constants'
import type { EmailData } from '../../types/email.types'

// Mock dependencies
vi.mock('../../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock('../../utils/idGenerator', () => ({
  generateId: vi.fn(() => 'ntf_mock-id-123'),
  ID_CONFIG: {
    PREFIXES: {
      NOTIFICATION: 'ntf'
    }
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0
}

global.localStorage = localStorageMock

describe('EmailQueueService', () => {
  const mockEmailData: EmailData = {
    to: [{ email: 'test@example.com', name: 'Test User' }],
    subject: 'Test Email',
    html: '<p>Test content</p>',
    text: 'Test content'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('enqueue', () => {
    it('should add email to queue with proper structure', () => {
      const result = emailQueueService.enqueue(mockEmailData)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EMAIL_QUEUE,
        expect.stringContaining('"status":"pending"')
      )

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData).toHaveLength(1)
      expect(savedData[0]).toMatchObject({
        id: 'ntf_mock-id-123',
        emailData: mockEmailData,
        status: 'pending',
        attempts: 0
      })
      expect(result.id).toBe('ntf_mock-id-123')
    })

    it('should handle scheduled emails', () => {
      const scheduledTime = new Date(Date.now() + 60000) // 1 minute from now
      emailQueueService.enqueue(mockEmailData, scheduledTime)

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData[0].nextAttemptAt).toBe(scheduledTime.toISOString())
      expect(savedData[0].status).toBe('pending')
    })

    it('should append to existing queue', () => {
      const existingQueue = [
        {
          id: 'existing-id',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingQueue))

      emailQueueService.enqueue(mockEmailData)

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData).toHaveLength(2)
      expect(savedData[1].id).toBe('ntf_mock-id-123')
    })
  })

  describe('dequeue', () => {
    it('should return and remove first pending email', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        },
        {
          id: '2',
          emailData: { ...mockEmailData, to: [{ email: 'test2@example.com', name: 'Test 2' }] },
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 500).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      const result = emailQueueService.dequeue()

      expect(result).toMatchObject({
        id: '1',
        emailData: mockEmailData,
        status: 'pending'
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EMAIL_QUEUE,
        expect.stringContaining('"id":"2"')
      )
    })

    it('should return null when queue is empty', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify([]))

      const result = emailQueueService.dequeue()

      expect(result).toBeNull()
    })

    it('should return null when no pending emails', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'processing' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      const result = emailQueueService.dequeue()

      expect(result).toBeNull()
    })
  })

  describe('markAsProcessing', () => {
    it('should update email status to processing', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      emailQueueService.markAsProcessing('1')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EMAIL_QUEUE,
        expect.stringContaining('"status":"processing"')
      )

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData[0].status).toBe('processing')
    })

    it('should handle non-existent item gracefully', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      emailQueueService.markAsProcessing('non-existent')

      expect(logger.warn).toHaveBeenCalledWith('Email queue item not found:', 'non-existent')
    })
  })

  describe('markAsSent', () => {
    it('should update email status to sent', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'processing' as const,
          attempts: 1,
          lastAttemptAt: new Date().toISOString(),
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      emailQueueService.markAsSent('1')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EMAIL_QUEUE,
        expect.stringContaining('"status":"sent"')
      )

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData[0].status).toBe('sent')
    })
  })

  describe('markAsFailed', () => {
    it('should mark as failed if max attempts reached', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'processing' as const,
          attempts: EMAIL_CONFIG.MAX_RETRY_ATTEMPTS - 1,
          lastAttemptAt: new Date().toISOString(),
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      emailQueueService.markAsFailed('1', 'Test error')

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData[0].status).toBe('failed')
      expect(savedData[0].attempts).toBe(EMAIL_CONFIG.MAX_RETRY_ATTEMPTS)
      expect(savedData[0].error).toBe('Test error')
    })

    it('should reschedule for retry if attempts remaining', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'processing' as const,
          attempts: 0,
          lastAttemptAt: new Date().toISOString(),
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      emailQueueService.markAsFailed('1', 'Test error')

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData[0].status).toBe('pending')
      expect(savedData[0].attempts).toBe(1)
      expect(savedData[0].lastAttemptAt).toBeTruthy()
      expect(savedData[0].error).toBe('Test error')

      const expectedRetryTime = new Date(Date.now() + EMAIL_CONFIG.RETRY_DELAYS[0] * 60 * 1000).toISOString()
      expect(savedData[0].nextAttemptAt).toBe(expectedRetryTime)
    })
  })

  describe('Queue Statistics', () => {
    beforeEach(() => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        },
        {
          id: '2',
          emailData: { ...mockEmailData, to: [{ email: 'test2@example.com', name: 'Test 2' }] },
          status: 'processing' as const,
          attempts: 1,
          lastAttemptAt: new Date().toISOString(),
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 900).toISOString()
        },
        {
          id: '3',
          emailData: { ...mockEmailData, to: [{ email: 'test3@example.com', name: 'Test 3' }] },
          status: 'sent' as const,
          attempts: 1,
          lastAttemptAt: new Date().toISOString(),
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 800).toISOString()
        },
        {
          id: '4',
          emailData: { ...mockEmailData, to: [{ email: 'test4@example.com', name: 'Test 4' }] },
          status: 'failed' as const,
          attempts: 3,
          lastAttemptAt: new Date().toISOString(),
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 700).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))
    })

    it('should get queue size', () => {
      expect(emailQueueService.getQueueSize()).toBe(4)
    })

    it('should get pending count', () => {
      expect(emailQueueService.getPendingCount()).toBe(1)
    })

    it('should get processing count', () => {
      expect(emailQueueService.getProcessingCount()).toBe(1)
    })

    it('should get failed count', () => {
      expect(emailQueueService.getFailedCount()).toBe(1)
    })

    it('should get complete queue status', () => {
      const status = emailQueueService.getQueueStatus()
      expect(status).toMatchObject({
        total: 4,
        pending: 1,
        processing: 1,
        sent: 1,
        failed: 1
      })
    })
  })

  describe('getQueueItems', () => {
    it('should return all items when no status filter', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        },
        {
          id: '2',
          emailData: { ...mockEmailData, to: [{ email: 'test2@example.com', name: 'Test 2' }] },
          status: 'sent' as const,
          attempts: 1,
          lastAttemptAt: new Date().toISOString(),
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 900).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      const items = emailQueueService.getQueueItems()
      expect(items).toHaveLength(2)
    })

    it('should filter items by status', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        },
        {
          id: '2',
          emailData: { ...mockEmailData, to: [{ email: 'test2@example.com', name: 'Test 2' }] },
          status: 'sent' as const,
          attempts: 1,
          lastAttemptAt: new Date().toISOString(),
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 900).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      const pendingItems = emailQueueService.getQueueItems('pending')
      expect(pendingItems).toHaveLength(1)
      expect(pendingItems[0].id).toBe('1')

      const sentItems = emailQueueService.getQueueItems('sent')
      expect(sentItems).toHaveLength(1)
      expect(sentItems[0].id).toBe('2')
    })
  })

  describe('removeItem', () => {
    it('should remove specific item from queue', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        },
        {
          id: '2',
          emailData: { ...mockEmailData, to: [{ email: 'test2@example.com', name: 'Test 2' }] },
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 900).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      emailQueueService.removeItem('1')

      const callArgs = localStorageMock.setItem.mock.calls[0]
      const savedData = JSON.parse(callArgs[1])
      expect(savedData).toHaveLength(1)
      expect(savedData[0].id).toBe('2')
    })
  })

  describe('clearQueue', () => {
    it('should clear entire queue', () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date().toISOString(),
          createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      emailQueueService.clearQueue()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EMAIL_QUEUE,
        JSON.stringify([])
      )
    })
  })

  describe('processQueue', () => {
    it('should process queue with sendEmail callback', async () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date(Date.now() - 1000).toISOString(),
          createdAt: new Date(Date.now() - 2000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      const sendEmailMock = vi.fn().mockResolvedValue(true)
      await emailQueueService.processQueue(sendEmailMock)

      expect(sendEmailMock).toHaveBeenCalledWith(mockEmailData)
    })

    it('should handle sendEmail failures', async () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date(Date.now() - 1000).toISOString(),
          createdAt: new Date(Date.now() - 2000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      const sendEmailMock = vi.fn().mockRejectedValue(new Error('Send failed'))
      await emailQueueService.processQueue(sendEmailMock)

      expect(logger.error).toHaveBeenCalledWith('Email send failed:', expect.any(Error))
    })

    it('should process multiple emails in batch', async () => {
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date(Date.now() - 1000).toISOString(),
          createdAt: new Date(Date.now() - 2000).toISOString()
        },
        {
          id: '2',
          emailData: { ...mockEmailData, to: [{ email: 'test2@example.com', name: 'Test 2' }] },
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: new Date(Date.now() - 900).toISOString(),
          createdAt: new Date(Date.now() - 1900).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      const sendEmailMock = vi.fn().mockResolvedValue(true)
      await emailQueueService.processQueue(sendEmailMock)

      expect(sendEmailMock).toHaveBeenCalledTimes(2)
    })

    it('should skip scheduled emails not yet due', async () => {
      const scheduledTime = new Date(Date.now() + 60000).toISOString() // 1 minute in future
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: scheduledTime,
          createdAt: new Date(Date.now() - 1000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      const sendEmailMock = vi.fn()
      await emailQueueService.processQueue(sendEmailMock)

      expect(sendEmailMock).not.toHaveBeenCalled()
    })

    it('should process scheduled emails when due', async () => {
      const scheduledTime = new Date(Date.now() - 1000).toISOString() // 1 second ago (due)
      const queue = [
        {
          id: '1',
          emailData: mockEmailData,
          status: 'pending' as const,
          attempts: 0,
          lastAttemptAt: null,
          nextAttemptAt: scheduledTime,
          createdAt: new Date(Date.now() - 2000).toISOString()
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(queue))

      const sendEmailMock = vi.fn().mockResolvedValue(true)
      await emailQueueService.processQueue(sendEmailMock)

      expect(sendEmailMock).toHaveBeenCalledWith(mockEmailData)
    })
  })

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('Storage error')
      })

      expect(() => emailQueueService.getQueueSize()).toBe(0)
      expect(() => emailQueueService.getPendingCount()).toBe(0)
      expect(() => emailQueueService.getProcessingCount()).toBe(0)
      expect(() => emailQueueService.getFailedCount()).toBe(0)
    })

    it('should handle JSON parsing errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')

      expect(() => emailQueueService.getQueueSize()).toBe(0)
    })
  })
})