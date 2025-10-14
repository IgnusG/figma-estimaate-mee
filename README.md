# Estimatee-Mee

A Figma widget for conducting estimation sessions (story points, planning poker) with real-time collaboration.

## Contributing

For development setup, workflow, and release process, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Quick Start

Below are the steps to get your widget running. You can also find instructions at:

https://www.figma.com/widget-docs/setup-guide/

This widget template uses TypeScript and NPM, two standard tools in creating JavaScript applications.

First, download Node.js which comes with NPM. This will allow you to install TypeScript and other
libraries. You can find the download link here:

https://nodejs.org/en/download/

Next, install TypeScript, esbuild and the latest type definitions by running:

npm install

If you are familiar with JavaScript, TypeScript will look very familiar. In fact, valid JavaScript code
is already valid Typescript code.

TypeScript adds type annotations to variables. This allows code editors such as Visual Studio Code
to provide information about the Figma API while you are writing code, as well as help catch bugs
you previously didn't notice.

For more information, visit https://www.typescriptlang.org/

Using TypeScript requires a compiler to convert TypeScript (widget-src/code.tsx) into JavaScript (dist/code.js)
for the browser to run. We use esbuild to do this for us.

We recommend writing TypeScript code using Visual Studio code:

1. Download Visual Studio Code if you haven't already: https://code.visualstudio.com/.
2. Open this directory in Visual Studio Code.
3. Compile TypeScript to JavaScript: Run the "Terminal > Run Build Task..." menu item,
   then select "npm: watch". You will have to do this again every time
   you reopen Visual Studio Code.

That's it! Visual Studio Code will regenerate the JavaScript file every time you save.

## Card Gamification System

Estimatee-Mee includes a poker card gamification feature that adds an element of fun and competition to estimation sessions.

### How It Works

1. **Card Distribution**: After each estimation round, every participant who voted (excluding spectators and non-voters) receives a random playing card
2. **Card Collection**: Each participant can hold up to 5 cards maximum
3. **Card Management**: When a participant already has 5 cards and receives a new one, a random existing card is removed
4. **Card Display**: A small card icon appears next to participants' names when they have cards
5. **Card Viewing**: Hover over a participant's card icon to see their collected cards in ascending order
6. **Poker Showdown**: Use the "Reveal Cards" button on the results screen to determine the poker winner

### Card Set

The system uses a standard 52-card deck:

- **Ranks**: 2, 3, 4, 5, 6, 7, 8, 9, 10, Jack, Queen, King, Ace
- **Suits**: Clubs (♣), Diamonds (♦), Hearts (♥), Spades (♠)

### Poker Hand Rankings

Winners are determined using standard poker hand rankings (highest to lowest):

1. **Royal Flush**: A, K, Q, J, 10 of the same suit
2. **Straight Flush**: Five consecutive cards of the same suit
3. **Four of a Kind**: Four cards of the same rank
4. **Full House**: Three of a kind plus a pair
5. **Flush**: Five cards of the same suit (not consecutive)
6. **Straight**: Five consecutive cards of mixed suits
7. **Three of a Kind**: Three cards of the same rank
8. **Two Pair**: Two different pairs
9. **One Pair**: Two cards of the same rank
10. **High Card**: Highest single card when no other hand is made

### Rules

- Only participants who vote in a round receive cards
- Spectators and non-voters do not receive cards
- Cards are distributed randomly from a shuffled deck
- Maximum 5 cards per participant
- Poker hands are evaluated using the best 5-card combination
- In case of tied hands, standard poker tiebreaker rules apply
