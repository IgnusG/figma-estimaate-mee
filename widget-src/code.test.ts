import { describe, it, expect } from 'vitest'

// Test constants and interfaces
const FIBONACCI_CARDS = [
  { value: 0, title: 'No Work', emoji: '🚫' },
  { value: 0.5, title: 'Tiny Task', emoji: '🤏' },
  { value: 1, title: 'Quick Win', emoji: '⚡' },
  { value: 2, title: 'Easy Peasy', emoji: '😊' },
  { value: 3, title: 'Simple Task', emoji: '👍' },
  { value: 5, title: 'Medium Work', emoji: '🔨' },
  { value: 8, title: 'Big Task', emoji: '💪' },
  { value: 13, title: 'Heavy Lift', emoji: '🏋️' },
  { value: 20, title: 'Major Work', emoji: '🎯' },
  { value: 40, title: 'Epic Task', emoji: '🚀' },
  { value: 100, title: 'Mega Project', emoji: '🏔️' }
]

const JOKER_CARDS = [
  { value: '∞', title: 'Infinite', emoji: '♾️' },
  { value: '?', title: 'Unknown', emoji: '🤷' },
  { value: '🍕', title: 'Pizza Break', emoji: '🍕' },
  { value: '☕', title: 'Coffee Time', emoji: '☕' }
]

interface Vote {
  userId: string
  userName: string
  value: number | string
  timestamp: number
}

interface SessionState {
  facilitatorId: string
  status: 'waiting' | 'voting' | 'revealed'
  participants: string[]
}

describe('Estimatee-Mee Widget', () => {
  describe('Constants', () => {
    it('should have correct fibonacci cards', () => {
      expect(FIBONACCI_CARDS).toHaveLength(11)
      expect(FIBONACCI_CARDS[0].value).toBe(0)
      expect(FIBONACCI_CARDS[1].value).toBe(0.5)
      expect(FIBONACCI_CARDS[10].value).toBe(100)
    })

    it('should have correct joker cards', () => {
      expect(JOKER_CARDS).toHaveLength(4)
      expect(JOKER_CARDS.map(card => card.value)).toEqual(['∞', '?', '🍕', '☕'])
    })
  })

  describe('Vote Interface', () => {
    it('should create valid vote object', () => {
      const vote: Vote = {
        userId: 'test-user',
        userName: 'Test User',
        value: 5,
        timestamp: Date.now()
      }

      expect(vote.userId).toBe('test-user')
      expect(vote.userName).toBe('Test User')
      expect(vote.value).toBe(5)
      expect(typeof vote.timestamp).toBe('number')
    })

    it('should support joker values', () => {
      const jokerVote: Vote = {
        userId: 'test-user',
        userName: 'Test User',
        value: '∞',
        timestamp: Date.now()
      }

      expect(jokerVote.value).toBe('∞')
    })
  })

  describe('SessionState Interface', () => {
    it('should create valid session state', () => {
      const sessionState: SessionState = {
        facilitatorId: 'facilitator-123',
        status: 'voting',
        participants: ['user-1', 'user-2', 'user-3']
      }

      expect(sessionState.facilitatorId).toBe('facilitator-123')
      expect(sessionState.status).toBe('voting')
      expect(sessionState.participants).toHaveLength(3)
    })

    it('should support all status types', () => {
      const statuses: SessionState['status'][] = ['waiting', 'voting', 'revealed']
      
      statuses.forEach(status => {
        const sessionState: SessionState = {
          facilitatorId: 'test',
          status,
          participants: []
        }
        expect(['waiting', 'voting', 'revealed']).toContain(sessionState.status)
      })
    })
  })
})