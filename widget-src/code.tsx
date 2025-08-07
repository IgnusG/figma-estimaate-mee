const { widget } = figma
const { useSyncedState, useSyncedMap, AutoLayout, Text } = widget

interface Vote {
  userId: string
  userName: string
  value: number
  timestamp: number
}

interface SessionState {
  status: 'waiting' | 'voting' | 'revealed'
  facilitatorId: string
  participants: string[]
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
  { value: 0, title: 'No Work', emoji: '🚫' },
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

function EstimationCard({ value, title, emoji, isSelected, onClick }: {
  value: number
  title: string
  emoji: string
  isSelected: boolean
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
      width={420}
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

  const handleStart = () => {
    try {
      const userId = figma.currentUser?.id || `user-${Date.now()}`
      const userName = figma.currentUser?.name || 'Anonymous'
      
      console.log('Starting session:', { userId, userName })
      
      setSessionState({
        status: 'voting',
        facilitatorId: userId,
        participants: [userId]
      })
    } catch (error) {
      console.error('Error starting session:', error)
      // Fallback without currentUser
      const fallbackId = `user-${Date.now()}`
      setSessionState({
        status: 'voting',
        facilitatorId: fallbackId,
        participants: [fallbackId]
      })
    }
  }

  const handleVote = (value: number) => {
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

  return (
    <AutoLayout
      direction="vertical"
      spacing={16}
      padding={16}
      fill="#FFFFFF"
      cornerRadius={12}
      stroke="#E6E6E6"
      width={420}
    >
      <Text fontSize={16} fontWeight="bold">
        Choose your estimate
      </Text>
      <Text fontSize={12} fill="#666666">
        Votes: {votes.size}/{sessionState.participants.length} | Count: {count}
      </Text>
      <Text fontSize={10} fill="#999999">
        Facilitator: {sessionState.facilitatorId}
      </Text>
      <Text fontSize={10} fill="#999999">
        Status: {sessionState.status} | Participants: {sessionState.participants.length}
      </Text>
      
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
      
      <AutoLayout direction="vertical" spacing={8} horizontalAlignItems="center">
        <AutoLayout direction="horizontal" spacing={6}>
          {FIBONACCI_CARDS.slice(0, 6).map(card => {
            // CAREFULLY access current user vote for highlighting
            let isSelected = false
            try {
              // Store current user ID in state during click handlers
              const currentUserId = sessionState.facilitatorId // Use facilitator as current user for now
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
                isSelected={isSelected}
                onClick={() => handleVote(card.value)}
              />
            )
          })}
        </AutoLayout>
        
        <AutoLayout direction="horizontal" spacing={6}>
          {FIBONACCI_CARDS.slice(6).map(card => {
            // CAREFULLY access current user vote for highlighting
            let isSelected = false
            try {
              // Store current user ID in state during click handlers
              const currentUserId = sessionState.facilitatorId // Use facilitator as current user for now
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
                isSelected={isSelected}
                onClick={() => handleVote(card.value)}
              />
            )
          })}
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(Widget)
