const { widget } = figma
const { useSyncedState, useSyncedMap, AutoLayout, Text } = widget

interface Vote {
  userId: string
  userName: string
  value: number | string
  timestamp: number
}

interface SessionState {
  status: 'waiting' | 'voting' | 'revealed'
  facilitatorId: string
  participants: string[]
}

interface Participant {
  userId: string
  userName: string
  isSpectator: boolean
  joinedAt: number
}

interface VoteResult {
  value: number | string
  participants: Array<{
    name: string
    userId: string
  }>
  count: number
}

const FIBONACCI_CARDS = [
  { value: 0, title: 'No Work', emoji: '🚫', tooltip: 'No effort required' },
  { value: 0.5, title: 'Tiny Task', emoji: '🤏', tooltip: 'Minimal effort, quick fix' },
  { value: 1, title: 'Quick Win', emoji: '⚡', tooltip: 'Very simple, 1-2 hours' },
  { value: 2, title: 'Easy Peasy', emoji: '😊', tooltip: 'Simple task, half day' },
  { value: 3, title: 'Simple Task', emoji: '👍', tooltip: 'Straightforward, 1 day' },
  { value: 5, title: 'Medium Work', emoji: '🔨', tooltip: 'Some complexity, 2-3 days' },
  { value: 8, title: 'Big Task', emoji: '💪', tooltip: 'Complex work, 1 week' },
  { value: 13, title: 'Heavy Lift', emoji: '🏋️', tooltip: 'Very complex, 2 weeks' }
]

const JOKER_CARDS = [
  { value: '∞', title: 'Infinite', emoji: '♾️', tooltip: 'Too big to estimate' },
  { value: '?', title: 'Unknown', emoji: '🤷', tooltip: 'Need more information' },
  { value: '🍕', title: 'Pizza Break', emoji: '🍕', tooltip: 'Let\'s discuss over food' },
  { value: '☕', title: 'Coffee Time', emoji: '☕', tooltip: 'Need a break to think' }
]

function EstimationCard({ value, title, emoji, isSelected, tooltip, onClick }: {
  value: number
  title: string
  emoji: string
  isSelected: boolean
  tooltip: string
  onClick: () => void
}) {
  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={8}
      spacing={4}
      width={58}
      height={78}
      fill={isSelected ? "#007AFF" : "#FFFFFF"}
      stroke={isSelected ? "#007AFF" : "#E6E6E6"}
      strokeWidth={2}
      cornerRadius={6}
      onClick={onClick}
      tooltip={tooltip}
    >
      <Text fontSize={14}>{emoji}</Text>
      <Text 
        fontSize={12} 
        fontWeight="bold"
        fill={isSelected ? "#FFFFFF" : "#000000"}
      >
        {value}
      </Text>
      <Text 
        fontSize={8} 
        horizontalAlignText="center"
        fill={isSelected ? "#FFFFFF" : "#666666"}
        width="fill-parent"
      >
        {title}
      </Text>
    </AutoLayout>
  )
}

function JokerCard({ value, title, emoji, isSelected, tooltip, onClick }: {
  value: string
  title: string
  emoji: string
  isSelected: boolean
  tooltip: string
  onClick: () => void
}) {
  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={8}
      spacing={4}
      width={58}
      height={78}
      fill={isSelected ? "#FF6B35" : "#FFFFFF"}
      stroke={isSelected ? "#FF6B35" : "#FF6B35"}
      strokeWidth={2}
      cornerRadius={6}
      onClick={onClick}
      tooltip={tooltip}
    >
      <Text fontSize={14}>{emoji}</Text>
      <Text 
        fontSize={12} 
        fontWeight="bold"
        fill={isSelected ? "#FFFFFF" : "#FF6B35"}
      >
        {value}
      </Text>
      <Text 
        fontSize={8} 
        horizontalAlignText="center"
        fill={isSelected ? "#FFFFFF" : "#FF6B35"}
        width="fill-parent"
      >
        {title}
      </Text>
    </AutoLayout>
  )
}

function ResultsView({ 
  voteResults, 
  onReset 
}: { 
  voteResults: VoteResult[]
  onReset: () => void
}) {
  return (
    <AutoLayout
      direction="vertical"
      spacing={16}
      padding={16}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E6E6E6"
      width={480}
    >
      <Text fontSize={18} fontWeight="bold" horizontalAlignText="center">
        🎯 Results Revealed
      </Text>
      
      <Text fontSize={14} fill="#666666" horizontalAlignText="center">
        Here's how everyone voted:
      </Text>
      
      <AutoLayout direction="vertical" spacing={12}>
        {voteResults.map(result => (
          <AutoLayout
            key={result.value}
            direction="vertical"
            spacing={6}
            padding={12}
            fill="#F8F9FA"
            cornerRadius={6}
            width="fill-parent"
          >
            <AutoLayout direction="horizontal" spacing={8} horizontalAlignItems="center">
              <Text fontSize={16} fontWeight="bold">
                {result.value}
              </Text>
              <Text fontSize={12} fill="#666666">
                ({result.count} vote{result.count !== 1 ? 's' : ''})
              </Text>
            </AutoLayout>
            <AutoLayout direction="vertical" spacing={2}>
              {result.participants.map(participant => (
                <Text key={participant.userId} fontSize={12} fill="#333333">
                  • {participant.name}
                </Text>
              ))}
            </AutoLayout>
          </AutoLayout>
        ))}
      </AutoLayout>
      
      {/* Reset Button for Facilitator */}
      <AutoLayout
        padding={{ vertical: 12, horizontal: 24 }}
        fill="#007AFF"
        cornerRadius={8}
        onClick={onReset}
        horizontalAlignItems="center"
      >
        <Text fontSize={14} fill="#FFFFFF" fontWeight="bold">
          Start New Round
        </Text>
      </AutoLayout>
    </AutoLayout>
  )
}

function Widget() {
  const [count, setCount] = useSyncedState('count', 0)
  const [sessionState, setSessionState] = useSyncedState<SessionState>('session', {
    status: 'waiting',
    facilitatorId: '',
    participants: []
  })
  const votes = useSyncedMap<Vote>('votes')
  const participants = useSyncedMap<Participant>('participants')

  const handleStart = () => {
    try {
      const userId = figma.currentUser?.id || `user-${Date.now()}`
      const userName = figma.currentUser?.name || 'Anonymous'
      
      console.log('Starting session:', { userId, userName })
      
      // Add facilitator as participant
      participants.set(userId, {
        userId,
        userName,
        isSpectator: false,
        joinedAt: Date.now()
      })
      
      setSessionState({
        status: 'voting',
        facilitatorId: userId,
        participants: [userId]
      })
    } catch (error) {
      console.error('Error starting session:', error)
      // Fallback without currentUser
      const fallbackId = `user-${Date.now()}`
      participants.set(fallbackId, {
        userId: fallbackId,
        userName: 'Anonymous',
        isSpectator: false,
        joinedAt: Date.now()
      })
      setSessionState({
        status: 'voting',
        facilitatorId: fallbackId,
        participants: [fallbackId]
      })
    }
  }

  const handleVote = (value: number | string) => {
    try {
      // Store vote in SyncedMap
      const userId = figma.currentUser?.id || `voter-${Date.now()}`
      const userName = figma.currentUser?.name || 'Anonymous'
      
      console.log('Storing vote:', { userId, userName, value })
      
      votes.set(userId, {
        userId,
        userName,
        value,
        timestamp: Date.now()
      })
      
      setCount(count + 1)
    } catch (error) {
      console.error('Error in vote handler:', error)
      // Fallback without map storage
      setCount(count + 1)
    }
  }

  const joinSession = (asSpectator = false) => {
    try {
      const userId = figma.currentUser?.id || `user-${Date.now()}`
      const userName = figma.currentUser?.name || 'Anonymous'
      
      // Add as participant if not already present
      if (!participants.get(userId)) {
        participants.set(userId, {
          userId,
          userName,
          isSpectator: asSpectator,
          joinedAt: Date.now()
        })
        
        // Update session participant list
        const currentParticipants = sessionState.participants
        if (!currentParticipants.includes(userId)) {
          setSessionState({
            ...sessionState,
            participants: [...currentParticipants, userId]
          })
        }
      }
    } catch (error) {
      console.error('Error joining session:', error)
    }
  }

  const revealResults = () => {
    try {
      // Only facilitator can reveal results
      const currentUserId = figma.currentUser?.id || sessionState.facilitatorId
      if (currentUserId === sessionState.facilitatorId) {
        console.log('Revealing results')
        setSessionState({
          ...sessionState,
          status: 'revealed'
        })
      }
    } catch (error) {
      console.error('Error revealing results:', error)
    }
  }

  const resetSession = () => {
    try {
      // Only facilitator can reset
      const currentUserId = figma.currentUser?.id || sessionState.facilitatorId
      if (currentUserId === sessionState.facilitatorId) {
        console.log('Resetting session')
        // Clear all votes
        votes.keys().forEach(key => votes.delete(key))
        setSessionState({
          ...sessionState,
          status: 'voting'
        })
        setCount(0)
      }
    } catch (error) {
      console.error('Error resetting session:', error)
    }
  }

  const groupVotesByValue = (): VoteResult[] => {
    const grouped = new Map<number | string, VoteResult>()
    
    votes.keys().forEach(key => {
      const vote = votes.get(key)
      if (!vote) return
      const existing = grouped.get(vote.value)
      if (existing) {
        existing.participants.push({
          name: vote.userName,
          userId: vote.userId
        })
        existing.count++
      } else {
        grouped.set(vote.value, {
          value: vote.value,
          participants: [{
            name: vote.userName,
            userId: vote.userId
          }],
          count: 1
        })
      }
    })
    
    return Array.from(grouped.values()).sort((a, b) => {
      // Sort by value (numbers first, then strings)
      if (typeof a.value === 'number' && typeof b.value === 'number') {
        return a.value - b.value
      }
      if (typeof a.value === 'number') return -1
      if (typeof b.value === 'number') return 1
      return String(a.value).localeCompare(String(b.value))
    })
  }

  if (sessionState.status === 'waiting') {
    return (
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="center"
        verticalAlignItems="center"
        padding={32}
        spacing={16}
        fill="#FFFFFF"
        cornerRadius={12}
        stroke="#E6E6E6"
      >
        <Text fontSize={24} fontWeight="bold">
          🎯 Estimatee-Mee
        </Text>
        <Text fontSize={16} fill="#666666" horizontalAlignText="center">
          Start a planning poker session
        </Text>
        <AutoLayout
          padding={{ vertical: 12, horizontal: 24 }}
          fill="#007AFF"
          cornerRadius={8}
          onClick={handleStart}
        >
          <Text fontSize={16} fill="#FFFFFF" fontWeight="bold">
            Start Session
          </Text>
        </AutoLayout>
      </AutoLayout>
    )
  }

  if (sessionState.status === 'revealed') {
    return (
      <ResultsView
        voteResults={groupVotesByValue()}
        onReset={resetSession}
      />
    )
  }

  // Check if current user needs to join
  const currentUserId = sessionState.facilitatorId // Use facilitator for now
  const currentParticipant = participants.get(currentUserId)
  
  if (sessionState.status === 'voting' && !currentParticipant) {
    return (
      <AutoLayout
        direction="vertical"
        horizontalAlignItems="center"
        verticalAlignItems="center"
        padding={32}
        spacing={16}
        fill="#FFFFFF"
        cornerRadius={12}
        stroke="#E6E6E6"
      >
        <Text fontSize={20} fontWeight="bold">
          🎯 Session in Progress
        </Text>
        <Text fontSize={14} fill="#666666" horizontalAlignText="center">
          Join this estimation session
        </Text>
        <AutoLayout direction="horizontal" spacing={12}>
          <AutoLayout
            padding={{ vertical: 10, horizontal: 20 }}
            fill="#007AFF"
            cornerRadius={6}
            onClick={() => joinSession(false)}
          >
            <Text fontSize={14} fill="#FFFFFF" fontWeight="bold">
              Join as Voter
            </Text>
          </AutoLayout>
          <AutoLayout
            padding={{ vertical: 10, horizontal: 20 }}
            fill="#6C757D"
            cornerRadius={6}
            onClick={() => joinSession(true)}
          >
            <Text fontSize={14} fill="#FFFFFF" fontWeight="bold">
              Join as Spectator
            </Text>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    )
  }

  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      spacing={16}
      padding={16}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E6E6E6"
      width={480}
    >
      <Text fontSize={16} fontWeight="bold">
        Choose your estimate
      </Text>
      {/* Participant Status */}
      <AutoLayout direction="vertical" spacing={6} horizontalAlignItems="center">
        <Text fontSize={12} fill="#666666">
          Votes: {votes.size}/{sessionState.participants.filter(id => !participants.get(id)?.isSpectator).length}
        </Text>
        <AutoLayout direction="horizontal" spacing={8} wrap horizontalAlignItems="center">
          {sessionState.participants.map(userId => {
            const participant = participants.get(userId)
            const hasVoted = votes.get(userId) !== undefined
            if (!participant) return null
            
            return (
              <AutoLayout
                key={userId}
                padding={{ vertical: 2, horizontal: 6 }}
                fill={hasVoted ? "#28A745" : participant.isSpectator ? "#6C757D" : "#FFC107"}
                cornerRadius={12}
              >
                <Text fontSize={10} fill="#FFFFFF">
                  {participant.userName}{participant.isSpectator ? " 👁️" : hasVoted ? " ✓" : ""}
                </Text>
              </AutoLayout>
            )
          })}
        </AutoLayout>
      </AutoLayout>
      
      {/* Facilitator Controls */}
      {sessionState.facilitatorId === sessionState.facilitatorId && (
        <AutoLayout direction="horizontal" spacing={8}>
          <AutoLayout
            padding={{ vertical: 8, horizontal: 16 }}
            fill="#28A745"
            cornerRadius={6}
            onClick={revealResults}
          >
            <Text fontSize={12} fill="#FFFFFF" fontWeight="bold">
              Reveal Results
            </Text>
          </AutoLayout>
        </AutoLayout>
      )}
      
      <AutoLayout direction="vertical" spacing={12} horizontalAlignItems="center">
        {/* Fibonacci Cards */}
        <AutoLayout direction="vertical" spacing={8} horizontalAlignItems="center">
          <Text fontSize={12} fill="#666666" fontWeight="bold">Story Points</Text>
          <AutoLayout direction="horizontal" spacing={6}>
            {FIBONACCI_CARDS.slice(0, 5).map(card => {
              // CAREFULLY access current user vote for highlighting
              let isSelected = false
              try {
                const currentUserId = sessionState.facilitatorId
                const userVote = votes.get(currentUserId)
                isSelected = userVote?.value === card.value
              } catch (error) {
                console.error('Error checking card selection:', error)
                isSelected = false
              }
              
              return (
                <EstimationCard
                  key={card.value}
                  value={card.value}
                  title={card.title}
                  emoji={card.emoji}
                  tooltip={card.tooltip}
                  isSelected={isSelected}
                  onClick={() => {
                    const currentParticipant = participants.get(sessionState.facilitatorId)
                    if (currentParticipant && !currentParticipant.isSpectator) {
                      handleVote(card.value)
                    }
                  }}
                />
              )
            })}
          </AutoLayout>
          
          <AutoLayout direction="horizontal" spacing={6}>
            {FIBONACCI_CARDS.slice(5).map(card => {
              // CAREFULLY access current user vote for highlighting
              let isSelected = false
              try {
                const currentUserId = sessionState.facilitatorId
                const userVote = votes.get(currentUserId)
                isSelected = userVote?.value === card.value
              } catch (error) {
                console.error('Error checking card selection:', error)
                isSelected = false
              }
              
              return (
                <EstimationCard
                  key={card.value}
                  value={card.value}
                  title={card.title}
                  emoji={card.emoji}
                  tooltip={card.tooltip}
                  isSelected={isSelected}
                  onClick={() => {
                    const currentParticipant = participants.get(sessionState.facilitatorId)
                    if (currentParticipant && !currentParticipant.isSpectator) {
                      handleVote(card.value)
                    }
                  }}
                />
              )
            })}
          </AutoLayout>
        </AutoLayout>

        {/* Joker Cards */}
        <AutoLayout direction="vertical" spacing={8} horizontalAlignItems="center">
          <Text fontSize={12} fill="#FF6B35" fontWeight="bold">Special Cards</Text>
          <AutoLayout direction="horizontal" spacing={6}>
            {JOKER_CARDS.map(card => {
              // CAREFULLY access current user vote for highlighting
              let isSelected = false
              try {
                const currentUserId = sessionState.facilitatorId
                const userVote = votes.get(currentUserId)
                isSelected = userVote?.value === card.value
              } catch (error) {
                console.error('Error checking card selection:', error)
                isSelected = false
              }
              
              return (
                <JokerCard
                  key={card.value}
                  value={card.value}
                  title={card.title}
                  emoji={card.emoji}
                  tooltip={card.tooltip}
                  isSelected={isSelected}
                  onClick={() => {
                    const currentParticipant = participants.get(sessionState.facilitatorId)
                    if (currentParticipant && !currentParticipant.isSpectator) {
                      handleVote(card.value)
                    }
                  }}
                />
              )
            })}
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(Widget)
