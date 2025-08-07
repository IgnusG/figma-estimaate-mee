const { widget } = figma
const { useSyncedState, useSyncedMap, useEffect, AutoLayout, Text } = widget

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

function EstimationCard({ value, title, emoji, isSelected, tooltip, onClick, _cardIndex, _isInHand, cardScale }: {
  value: number
  title: string
  emoji: string
  isSelected: boolean
  tooltip: string
  onClick: () => void
  _cardIndex?: number
  _isInHand?: boolean
  cardScale?: number
}) {
  // Use cardScale to determine size, default to 1.0 (full size)
  const scale = cardScale || 1.0
  const baseWidth = 58
  const baseHeight = 78
  const baseFontSize = 12
  const baseEmojiFontSize = 14
  const baseTitleFontSize = 8
  
  const scaledWidth = Math.round(baseWidth * scale)
  const scaledHeight = Math.round(baseHeight * scale)
  const scaledFontSize = Math.round(baseFontSize * scale)
  const scaledEmojiFontSize = Math.round(baseEmojiFontSize * scale)
  const scaledTitleFontSize = Math.round(baseTitleFontSize * scale)
  
  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={Math.round(8 * scale)}
      spacing={Math.round(4 * scale)}
      width={scaledWidth}
      height={scaledHeight}
      fill={isSelected ? "#007AFF" : "#FFFFFF"}
      stroke={isSelected ? "#007AFF" : "#E6E6E6"}
      strokeWidth={isSelected ? 3 : 2}
      cornerRadius={Math.round(8 * scale)}
      onClick={onClick}
      tooltip={tooltip}
      hoverStyle={{
        fill: isSelected ? "#0056CC" : "#F0F8FF",
        stroke: isSelected ? "#0056CC" : "#007AFF"
      }}
    >
      <Text 
        fontSize={scaledEmojiFontSize}
      >
        {emoji}
      </Text>
      <Text 
        fontSize={scaledFontSize} 
        fontWeight="bold"
        fill={isSelected ? "#FFFFFF" : "#000000"}
      >
        {value}
      </Text>
      <Text 
        fontSize={scaledTitleFontSize} 
        horizontalAlignText="center"
        fill={isSelected ? "#FFFFFF" : "#666666"}
        width="fill-parent"
      >
        {title}
      </Text>
    </AutoLayout>
  )
}

function JokerCard({ value, title, emoji, isSelected, tooltip, onClick, _cardIndex, _isInHand, cardScale }: {
  value: string
  title: string
  emoji: string
  isSelected: boolean
  tooltip: string
  onClick: () => void
  _cardIndex?: number
  _isInHand?: boolean
  cardScale?: number
}) {
  // Use cardScale to determine size, default to 1.0 (full size)
  const scale = cardScale || 1.0
  const baseWidth = 58
  const baseHeight = 78
  const baseFontSize = 12
  const baseEmojiFontSize = 14
  const baseTitleFontSize = 8
  
  const scaledWidth = Math.round(baseWidth * scale)
  const scaledHeight = Math.round(baseHeight * scale)
  const scaledFontSize = Math.round(baseFontSize * scale)
  const scaledEmojiFontSize = Math.round(baseEmojiFontSize * scale)
  const scaledTitleFontSize = Math.round(baseTitleFontSize * scale)
  
  return (
    <AutoLayout
      direction="vertical"
      horizontalAlignItems="center"
      verticalAlignItems="center"
      padding={Math.round(8 * scale)}
      spacing={Math.round(4 * scale)}
      width={scaledWidth}
      height={scaledHeight}
      fill={isSelected ? "#FF6B35" : "#FFFFFF"}
      stroke={isSelected ? "#FF6B35" : "#FF6B35"}
      strokeWidth={isSelected ? 3 : 2}
      cornerRadius={Math.round(8 * scale)}
      onClick={onClick}
      tooltip={tooltip}
      hoverStyle={{
        fill: isSelected ? "#E5501F" : "#FFF4F0",
        stroke: "#FF6B35"
      }}
    >
      <Text 
        fontSize={scaledEmojiFontSize}
      >
        {emoji}
      </Text>
      <Text 
        fontSize={scaledFontSize} 
        fontWeight="bold"
        fill={isSelected ? "#FFFFFF" : "#FF6B35"}
      >
        {value}
      </Text>
      <Text 
        fontSize={scaledTitleFontSize} 
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
  const [myUserId, setMyUserId] = useSyncedState<string>('myUserId', '')
  const votes = useSyncedMap<Vote>('votes')
  const participants = useSyncedMap<Participant>('participants')

  // Initialize current user ID when widget loads
  useEffect(() => {
    try {
      const userId = figma.currentUser?.id
      const userName = figma.currentUser?.name || 'Anonymous'
      
      if (userId && userId !== myUserId) {
        console.log('Setting current user ID:', { userId, userName })
        setMyUserId(userId)
      }
      
      // Auto-add all active users to participants when session is voting
      if (sessionState.status === 'voting') {
        try {
          const activeUsers = figma.activeUsers || []
          console.log('Active users in file:', activeUsers.length, activeUsers.map(u => ({ id: u.id, name: u.name })))
          
          // Add any active users who aren't already participants
          activeUsers.forEach(user => {
            if (user.id && !participants.get(user.id)) {
              console.log('Auto-adding active user:', { userId: user.id, userName: user.name })
              participants.set(user.id, {
                userId: user.id,
                userName: user.name || 'Anonymous',
                isSpectator: false,
                joinedAt: Date.now()
              })
              
              // Update session participant list
              const currentParticipants = sessionState.participants || []
              if (!currentParticipants.includes(user.id)) {
                setSessionState({
                  ...sessionState,
                  participants: [...currentParticipants, user.id]
                })
              }
            }
          })
        } catch (activeUsersError) {
          console.error('Error accessing activeUsers:', activeUsersError)
          // Fallback to manual join for current user
          if (userId && !participants.get(userId)) {
            console.log('Fallback: Auto-joining current user to active session')
            joinSession(false)
          }
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error)
    }
  })

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
      const userId = figma.currentUser?.id || sessionState.facilitatorId
      if (userId === sessionState.facilitatorId) {
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
      const userId = figma.currentUser?.id || sessionState.facilitatorId
      if (userId === sessionState.facilitatorId) {
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
  const currentUserId = myUserId
  const currentParticipant = currentUserId ? participants.get(currentUserId) : null
  
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
      width={560} // Increased width to prevent card cutoff
    >
      <Text fontSize={16} fontWeight="bold">
        Choose your estimate
      </Text>
      {/* Participant Status */}
      <AutoLayout direction="vertical" spacing={6} horizontalAlignItems="center">
        <Text fontSize={12} fill="#666666">
          Votes: {votes.size}/{(() => {
            try {
              // Use activeUsers if available, fallback to participants
              const activeUsers = figma.activeUsers || []
              return activeUsers.length > 0 ? activeUsers.length : sessionState.participants.filter(id => !participants.get(id)?.isSpectator).length
            } catch (error) {
              return sessionState.participants.filter(id => !participants.get(id)?.isSpectator).length
            }
          })()}
        </Text>
        <AutoLayout direction="horizontal" spacing={8} wrap horizontalAlignItems="center">
          {(() => {
            try {
              // Show active users if available, fallback to participants
              const activeUsers = figma.activeUsers || []
              if (activeUsers.length > 0) {
                return activeUsers.map(user => {
                  if (!user.id) return null
                  const hasVoted = votes.get(user.id) !== undefined
                  const participant = participants.get(user.id)
                  const isSpectator = participant?.isSpectator || false
                  
                  return (
                    <AutoLayout
                      key={user.id}
                      padding={{ vertical: 2, horizontal: 6 }}
                      fill={hasVoted ? "#28A745" : isSpectator ? "#6C757D" : "#FFC107"}
                      cornerRadius={12}
                    >
                      <Text fontSize={10} fill="#FFFFFF">
                        {user.name || 'Anonymous'}{isSpectator ? " 👁️" : hasVoted ? " ✓" : ""}
                      </Text>
                    </AutoLayout>
                  )
                })
              } else {
                // Fallback to session participants
                return sessionState.participants.map(userId => {
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
                })
              }
            } catch (error) {
              console.error('Error displaying participants:', error)
              // Final fallback to session participants
              return sessionState.participants.map(userId => {
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
              })
            }
          })()}
        </AutoLayout>
      </AutoLayout>
      
      {/* Facilitator Controls */}
      {myUserId === sessionState.facilitatorId && (
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
      
      <AutoLayout direction="vertical" spacing={24} horizontalAlignItems="center">
        {/* Card Hand - Fibonacci Cards */}
        <AutoLayout direction="vertical" spacing={16} horizontalAlignItems="center">
          <Text fontSize={14} fill="#666666" fontWeight="bold">📊 Story Points - Choose Your Card</Text>
          
          {/* Card Fan Layout */}
          <AutoLayout 
            direction="horizontal" 
            spacing={4} // Positive spacing to prevent cutoff
            horizontalAlignItems="center" // Center alignment since no height offsets
            padding={{ horizontal: 12, vertical: 12 }}
            height={120} // Reduced height since cards scale instead of move
          >
            {(() => {
              // Find the selected card index
              let selectedIndex = -1
              try {
                if (currentUserId) {
                  const userVote = votes.get(currentUserId)
                  if (userVote) {
                    selectedIndex = FIBONACCI_CARDS.findIndex(card => card.value === userVote.value)
                  }
                }
              } catch (error) {
                console.error('Error finding selected card:', error)
              }
              
              return FIBONACCI_CARDS.map((card, index) => {
                // CAREFULLY access current user vote for highlighting
                let isSelected = false
                try {
                  if (currentUserId) {
                    const userVote = votes.get(currentUserId)
                    isSelected = userVote?.value === card.value
                  }
                } catch (error) {
                  console.error('Error checking card selection:', error)
                  isSelected = false
                }
                
                // Calculate card scale based on distance from selected card
                let cardScale
                if (selectedIndex === -1) {
                  // No selection - all cards same size
                  cardScale = 1.0
                } else {
                  // Selection exists - scale down based on distance from selected card
                  const distanceFromSelected = Math.abs(index - selectedIndex)
                  // Selected card = 1.2 scale, others decrease by 0.1 per step
                  cardScale = isSelected ? 1.2 : Math.max(0.7, 1.0 - (distanceFromSelected * 0.1))
                }
                
                return (
                  <EstimationCard
                    key={card.value}
                    value={card.value}
                    title={card.title}
                    emoji={card.emoji}
                    tooltip={card.tooltip}
                    isSelected={isSelected}
                    _cardIndex={index}
                    _isInHand={true}
                    cardScale={cardScale}
                    onClick={() => {
                      // Use currentParticipant from scope
                      if (currentParticipant && !currentParticipant.isSpectator) {
                        handleVote(card.value)
                      }
                    }}
                  />
                )
              })
            })()}
          </AutoLayout>
        </AutoLayout>

        {/* Special Joker Cards */}
        <AutoLayout direction="vertical" spacing={16} horizontalAlignItems="center">
          <Text fontSize={14} fill="#FF6B35" fontWeight="bold">🃏 Special Cards - When Story Points Don't Apply</Text>
          
          {/* Joker Card Fan */}
          <AutoLayout 
            direction="horizontal" 
            spacing={8} // Normal spacing
            horizontalAlignItems="center" // Center alignment since no height offsets
            padding={{ horizontal: 12, vertical: 12 }}
            height={110} // Reduced height since cards scale instead of move
          >
            {(() => {
              // Find the selected joker card index
              let selectedJokerIndex = -1
              try {
                if (currentUserId) {
                  const userVote = votes.get(currentUserId)
                  if (userVote) {
                    selectedJokerIndex = JOKER_CARDS.findIndex(card => card.value === userVote.value)
                  }
                }
              } catch (error) {
                console.error('Error finding selected joker card:', error)
              }
              
              return JOKER_CARDS.map((card, index) => {
                // CAREFULLY access current user vote for highlighting
                let isSelected = false
                try {
                  if (currentUserId) {
                    const userVote = votes.get(currentUserId)
                    isSelected = userVote?.value === card.value
                  }
                } catch (error) {
                  console.error('Error checking card selection:', error)
                  isSelected = false
                }
                
                // Calculate card scale based on distance from selected joker card
                let cardScale
                if (selectedJokerIndex === -1) {
                  // No joker selection - all cards same size
                  cardScale = 1.0
                } else {
                  // Joker selection exists - scale down based on distance from selected card
                  const distanceFromSelected = Math.abs(index - selectedJokerIndex)
                  // Selected card = 1.2 scale, others decrease by 0.1 per step
                  cardScale = isSelected ? 1.2 : Math.max(0.7, 1.0 - (distanceFromSelected * 0.1))
                }
                
                return (
                  <JokerCard
                    key={card.value}
                    value={card.value}
                    title={card.title}
                    emoji={card.emoji}
                    tooltip={card.tooltip}
                    isSelected={isSelected}
                    _cardIndex={index}
                    _isInHand={true}
                    cardScale={cardScale}
                    onClick={() => {
                      // Use currentParticipant from scope
                      if (currentParticipant && !currentParticipant.isSpectator) {
                        handleVote(card.value)
                      }
                    }}
                  />
                )
              })
            })()}
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(Widget)
