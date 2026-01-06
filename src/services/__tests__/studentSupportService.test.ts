import { describe, it, expect, vi, beforeEach } from 'vitest'

type SupportRequest = {
  id: number
  student: string
  issue: string
  status: string
  createdAt?: string
  updatedAt?: string
}

// Mock Student Support Service
class StudentSupportService {
  supportRequests: SupportRequest[]
  isInitialized: boolean

  constructor() {
    this.supportRequests = []
    this.isInitialized = false
  }

  async initialize() {
    // Simulate async initialization
    this.isInitialized = true
    this.supportRequests = [
      { id: 1, student: 'John Doe', issue: 'Login problem', status: 'open' },
      { id: 2, student: 'Jane Smith', issue: 'Course access', status: 'in-progress' }
    ]
    return true
  }

  async createSupportRequest(studentName: string, issue: string) {
    if (!this.isInitialized) {
      throw new Error('Service not initialized')
    }
    
    const request = {
      id: this.supportRequests.length + 1,
      student: studentName,
      issue: issue,
      status: 'open',
      createdAt: new Date().toISOString()
    }
    
    this.supportRequests.push(request)
    return request
  }

  async getSupportRequests() {
    if (!this.isInitialized) {
      throw new Error('Service not initialized')
    }
    
    return this.supportRequests
  }

  async updateRequestStatus(requestId: string | number, newStatus: string) {
    if (!this.isInitialized) {
      throw new Error('Service not initialized')
    }
    
    const request = this.supportRequests.find(req => req.id === requestId)
    if (!request) {
      throw new Error('Request not found')
    }
    
    request.status = newStatus
    request.updatedAt = new Date().toISOString()
    return request
  }
}

describe('StudentSupportService', () => {
  let service: StudentSupportService

  beforeEach(async () => {
    service = new StudentSupportService()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize successfully', async () => {
      const result = await service.initialize()
      
      expect(result).toBe(true)
      expect(service.isInitialized).toBe(true)
      expect(service.supportRequests).toHaveLength(2)
    })

    it('should have empty requests before initialization', () => {
      expect(service.supportRequests).toEqual([])
      expect(service.isInitialized).toBe(false)
    })
  })

  describe('createSupportRequest', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('should create a new support request', async () => {
      const request = await service.createSupportRequest('Alice Johnson', 'Password reset')
      
      expect(request).toEqual({
        id: 3,
        student: 'Alice Johnson',
        issue: 'Password reset',
        status: 'open',
        createdAt: expect.any(String)
      })
    })

    it('should throw error when service not initialized', async () => {
      const uninitializedService = new StudentSupportService()
      
      await expect(uninitializedService.createSupportRequest('Test', 'Test'))
        .rejects.toThrow('Service not initialized')
    })
  })

  describe('getSupportRequests', () => {
    it('should return empty array when not initialized', async () => {
      await expect(service.getSupportRequests()).rejects.toThrow('Service not initialized')
    })

    it('should return support requests when initialized', async () => {
      await service.initialize()
      const requests = await service.getSupportRequests()
      
      expect(requests).toHaveLength(2)
      expect(requests[0]).toEqual({
        id: 1,
        student: 'John Doe',
        issue: 'Login problem',
        status: 'open'
      })
    })
  })

  describe('updateRequestStatus', () => {
    beforeEach(async () => {
      await service.initialize()
    })

    it('should update request status', async () => {
      const updated = await service.updateRequestStatus(1, 'resolved')
      
      expect(updated.status).toBe('resolved')
      expect(updated.updatedAt).toBeDefined()
    })

    it('should throw error for non-existent request', async () => {
      await expect(service.updateRequestStatus(999, 'resolved'))
        .rejects.toThrow('Request not found')
    })

    it('should throw error when service not initialized', async () => {
      const uninitializedService = new StudentSupportService()
      
      await expect(uninitializedService.updateRequestStatus(1, 'resolved'))
        .rejects.toThrow('Service not initialized')
    })
  })

  describe('integration tests', () => {
    it('should handle full request lifecycle', async () => {
      await service.initialize()
      
      // Create request
      const request = await service.createSupportRequest('Bob Wilson', 'Course enrollment')
      expect(request.status).toBe('open')
      
      // Update status
      const updated = await service.updateRequestStatus(request.id, 'in-progress')
      expect(updated.status).toBe('in-progress')
      
      // Check in requests list
      const requests = await service.getSupportRequests()
      const foundRequest = requests.find(req => req.id === request.id)
      expect(foundRequest?.status).toBe('in-progress')
    })
  })
})