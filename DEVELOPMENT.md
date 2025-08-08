# Development Guide - Estimatee-Mee

A comprehensive guide for developing, testing, and working with the Figma API within this widget project.

## Project Overview

**Estimatee-Mee** is a Figma widget built with TypeScript that serves as a scaffold for developing interactive Figma widgets. The current implementation includes a counter widget with increment/decrement functionality.

### Key Features

- TypeScript-based development
- ESBuild for fast compilation
- ESLint integration with Figma-specific rules
- FigJam editor support
- Widget API v1.0.0 compatibility

## Project Structure

```
figma-estimaate-mee/
├── dist/                   # Compiled JavaScript output
│   └── code.js            # Built widget code
├── widget-src/            # Source TypeScript files
│   ├── code.tsx          # Main widget implementation
│   └── tsconfig.json     # TypeScript configuration
├── manifest.json         # Figma widget manifest
├── package.json          # Project dependencies and scripts
└── README.md            # Basic setup instructions
```

## Prerequisites

> **Source:** [Figma Widget API Prerequisites](https://www.figma.com/widget-docs/prerequisites/)

1. **Node.js** (includes NPM)
   - Download from: https://nodejs.org/en/download/
   - Required for TypeScript compilation and dependency management

2. **Visual Studio Code** (recommended)
   - Download from: https://code.visualstudio.com/
   - Provides excellent TypeScript and Figma API IntelliSense
   - As of 2025, type definitions ship with docstrings for inline documentation

3. **Figma Desktop App** (required)
   - Latest version required for widget development and testing
   - Widgets cannot be developed in the browser version

## Setup & Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Development Setup in VS Code**
   - Open the project directory in VS Code
   - Run: `Terminal > Run Build Task...`
   - Select: `npm: watch`
   - This enables automatic compilation on file changes

3. **Alternative Quick Setup**
   ```bash
   npm init @figma/widget
   ```
   > **Note:** For new projects, you can use the official Figma widget initializer

## Development Scripts

| Script         | Command            | Description                                     |
| -------------- | ------------------ | ----------------------------------------------- |
| **Build**      | `npm run build`    | Compiles TypeScript to JavaScript using ESBuild |
| **Watch**      | `npm run watch`    | Builds and watches for file changes             |
| **Lint**       | `npm run lint`     | Runs ESLint on TypeScript files                 |
| **Lint Fix**   | `npm run lint:fix` | Runs ESLint with automatic fixes                |
| **Type Check** | `npm run tsc`      | Runs TypeScript compiler without emitting files |

## Dependencies

### Core Dependencies

- **@figma/widget-typings**: TypeScript definitions for Figma Widget API
- **@figma/plugin-typings**: TypeScript definitions for Figma Plugin API
- **esbuild**: Fast JavaScript bundler for compilation
- **typescript**: TypeScript compiler

### Development Tools

- **@figma/eslint-plugin-figma-plugins**: ESLint rules specific to Figma development
- **@typescript-eslint/eslint-plugin**: TypeScript-specific ESLint rules
- **@typescript-eslint/parser**: TypeScript parser for ESLint

## Figma Widget Configuration

### Manifest Configuration (`manifest.json`)

```json
{
  "name": "Estimatee-Mee",
  "id": "1534179818853239353",
  "api": "1.0.0",
  "main": "dist/code.js",
  "capabilities": [],
  "enableProposedApi": false,
  "documentAccess": "dynamic-page",
  "editorType": ["figjam"],
  "containsWidget": true,
  "widgetApi": "1.0.0",
  "networkAccess": {
    "allowedDomains": ["none"]
  }
}
```

### Key Configuration Options

- **`editorType`**: Currently set to `["figjam"]` for FigJam support
- **`documentAccess`**: Set to `"dynamic-page"` for page-level access
- **`networkAccess`**: Currently restricted to `["none"]`
- **`capabilities`**: Empty array - extend for additional permissions

## Working with Figma Widget API

> **Source:** [Figma Widget API Reference](https://www.figma.com/widget-docs/api/api-reference/)

### Core Widget Concepts

Widgets are interactive objects that extend the functionality of design files and FigJam boards. Unlike plugins that run for a specific person, everyone can see and interact with the same widget.

1. **Widget Registration**

   ```typescript
   const { widget } = figma;
   const { useSyncedState, usePropertyMenu, AutoLayout, Text, SVG } = widget;

   function Widget() {
     // Widget implementation
   }

   widget.register(Widget); // Main entry point for rendering
   ```

2. **Synced State Management**

   ```typescript
   const [count, setCount] = useSyncedState("count", 0);
   ```

   - Maintains state across widget instances
   - Persists data in Figma document
   - Uses storage key and default value pattern

3. **Property Menu Integration**

   ```typescript
   usePropertyMenu(
     [
       {
         itemType: "action",
         propertyName: "reset",
         tooltip: "Reset",
         icon: `<svg>...</svg>`,
       },
     ],
     callback,
   );
   ```

   - Specifies the property menu shown when widget is selected
   - Supports actions, dropdowns, and other interactive elements

4. **Available UI Components**
   - **Layer-based**: AutoLayout, Frame, Text, Rectangle, Image, Ellipse, SVG, Line
   - **Special**: Input, Fragment, Span
   - **Interactive**: All components support click handlers and styling

### Additional Hooks Available

- **`useEffect`**: Runs when widget state changes
- **`useStickable`**: Allows widgets to stick to other nodes (FigJam only)
- **`useSyncedMap`**: Manages widget state with multiple keys
- **`useWidgetId`**: References the current active widget node's ID

### TypeScript Configuration

The widget uses custom JSX configuration for Figma:

```json
{
  "jsx": "react",
  "jsxFactory": "figma.widget.h",
  "jsxFragmentFactory": "figma.widget.Fragment",
  "target": "es2016"
}
```

## Testing & Quality Assurance

### Code Quality Tools

1. **ESLint Configuration**
   - Extends Figma-specific rules
   - TypeScript integration
   - Automatic unused variable detection

2. **Type Checking**
   ```bash
   npm run tsc
   ```

   - Validates TypeScript without compilation
   - Catches type errors early

### Recommended Testing Workflow

1. Run `npm run watch` for continuous compilation
2. Use Figma Desktop app's development mode for real-time testing
3. Validate with `npm run lint` and `npm run tsc`
4. Test widget functionality in appropriate editor:
   - **FigJam**: For collaboration and whiteboard features
   - **Figma**: For design-focused functionality
5. Test multiplayer scenarios if using shared state
6. Verify widget behavior across different document states

## Deployment Process

1. **Build Production Code**

   ```bash
   npm run build
   ```

2. **Validate Code Quality**

   ```bash
   npm run lint
   npm run tsc
   ```

3. **Upload to Figma**
   - Use Figma Desktop app (required)
   - Navigate to Plugins → Development
   - Import using `manifest.json`
   - Test in both Figma and FigJam environments as needed

## API Reference & Resources

### Official Documentation

- [**Figma Widget API Documentation**](https://www.figma.com/widget-docs/) - Main documentation hub
- [**API Reference**](https://www.figma.com/widget-docs/api/api-reference/) - Complete API reference
- [**Setup Guide**](https://www.figma.com/widget-docs/setup-guide/) - Getting started tutorial
- [**Prerequisites**](https://www.figma.com/widget-docs/prerequisites/) - Development requirements
- [**figma.widget API**](https://www.figma.com/widget-docs/api/figma-widget/) - Core widget API details
- [**Plugin API Integration**](https://www.figma.com/widget-docs/using-the-plugin-api/) - Using Plugin API within widgets
- [**Figma Plugin API Reference**](https://www.figma.com/plugin-docs/) - Plugin API documentation

### Learning Resources

- [**Widget Samples Repository**](https://github.com/figma/widget-samples) - Official code examples
  - Counter widget (demonstrates `useSyncedState`)
  - Notepad (shows `Input` component usage)
  - UserBadge (uses `<Image>` and user properties)
  - Table widget (illustrates `useSyncedMap`)
  - Multiplayer Counter (multiplayer-safe state management)
  - And more examples for various use cases

### Community & Support

- [**Figma Community Forum**](https://forum.figma.com/c/plugin-widget-api/20) - Developer discussions
- [**Discord Server**](https://discord.gg/xzQhe2Vcvx) - Real-time community support

### Development Tools

- [**TypeScript Handbook**](https://www.typescriptlang.org/) - TypeScript language reference
- **IntelliSense Support**: Type definitions include docstrings (2025 update)
- **VS Code Extensions**: Enhanced support for Figma development

## Common Development Patterns

### State Management

```typescript
// Single value
const [value, setValue] = useSyncedState("key", defaultValue);

// Complex objects
const [data, setData] = useSyncedState("data", {
  items: [],
  settings: {},
});
```

### Event Handling

```typescript
<SVG
  src="..."
  onClick={() => {
    // Handle click events
    setValue(newValue)
  }}
/>
```

### Conditional Rendering

```typescript
{condition && (
  <Text>Conditional content</Text>
)}
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Check TypeScript configuration and imports
2. **Widget Not Loading**: Verify `manifest.json` and built file path
3. **Type Errors**: Ensure proper Figma API usage and type definitions

### Development Tips

- Use VS Code for best TypeScript experience with inline API documentation
- Keep `npm run watch` running during development for automatic compilation
- Test frequently in Figma Desktop app's development environment
- Utilize ESLint for code quality maintenance
- Explore the [widget samples repository](https://github.com/figma/widget-samples) for implementation patterns
- Use the Figma Community Forum and Discord for development support
- Consider both Figma and FigJam use cases when designing widgets

## Contributing

When extending this widget:

1. Follow existing TypeScript patterns
2. Maintain ESLint compliance
3. Update manifest.json for new capabilities
4. Test thoroughly in FigJam environment
5. Document new features and API usage
