# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

| Command            | Purpose                                             |
| ------------------ | --------------------------------------------------- |
| `npm run build`    | Compile TypeScript to JavaScript using ESBuild      |
| `npm run watch`    | Build and watch for file changes during development |
| `npm run lint`     | Run ESLint on TypeScript files                      |
| `npm run lint:fix` | Run ESLint with automatic fixes                     |
| `npm run tsc`      | Type check without emitting files                   |
| `npm run test`     | Run tests with Vitest                               |
| `npm run test:ui`  | Run tests with Vitest UI                            |

## Project Architecture

**Estimatee-Mee** is a Figma widget for conducting estimation sessions (story points, planning poker) built with TypeScript and the Figma Widget API.

### Core Architecture

- **Entry Point**: `widget-src/code.tsx` registers the main Widget component
- **Component Structure**: Follows atomic design pattern (atoms/molecules/organisms)
- **State Management**: Uses Figma's `useSyncedState` and `useSyncedMap` for real-time collaboration
- **Session Flow**: waiting → voting → revealed states

### Key State Management

The widget uses Figma's synced state for real-time collaboration:

- `sessionStateData` (SessionState): Overall session status and participants
- `votes` (SyncedMap<Vote>): Individual user votes
- `participants` (SyncedMap<Participant>): Active users and their roles
- `activeUserIds`: List of currently active users (updated via polling)

### Component Hierarchy

```
Widget (organisms/widget.tsx)
├── WelcomeContent (molecules/) - Initial screen
├── VotingInterface (molecules/)
│   ├── CardGrid (molecules/) - Fibonacci cards
│   └── JokerCardGrid (molecules/) - Special cards (🤷‍♀️, ☕, etc.)
├── ParticipantStatus (molecules/) - Shows voting progress
├── FacilitatorControls (molecules/) - Reveal results button
└── ResultsView (molecules/) - Vote results and summary
```

### Custom Hooks

- `useSessionState`: Manages session lifecycle and participant management
- `useVoting`: Handles vote submission and result grouping
- `useUserPolling`: Tracks active users and removes inactive participants

### Key Types

- `SessionState`: Session status, facilitator, and participants
- `Vote`: User vote with timestamp
- `Participant`: User info and spectator status
- `CardData`: Card configuration (value, emoji, tooltip)

## Figma Widget Specific

- Built for FigJam environment (`editorType: ["figjam"]`)
- Uses Figma Widget API v1.0.0
- Network access restricted to "none"
- Custom JSX configuration targets Figma's widget runtime

## Testing

- Uses Vitest for testing
- Test configuration in `vitest.config.ts`
- Tests located in `widget-src/code.test.ts`

## Build Output

- Source: `widget-src/` (TypeScript)
- Output: `dist/code.js` (compiled JavaScript)
- Manifest: `manifest.json` defines widget metadata
