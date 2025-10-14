# Contributing to Estimatee-Mee

Thank you for contributing to Estimatee-Mee! This guide will help you understand our development workflow and release process.

## Table of Contents

- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Release Workflow](#release-workflow)
- [Publishing Releases](#publishing-releases)

## Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/figma-estimaate-mee.git
   cd figma-estimaate-mee
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development mode**

   ```bash
   npm run watch
   ```

4. **Run tests**
   ```bash
   npm run test        # Run once
   npm run test:watch  # Watch mode
   npm run test:ui     # UI mode
   ```

## Making Changes

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

Edit the code in `widget-src/`. The widget will automatically rebuild if you're running `npm run watch`.

### 3. Run Quality Checks

Before committing, ensure all checks pass:

```bash
npm run tsc         # Type checking
npm run lint        # Linting
npm run test        # Tests
npm run build       # Build
```

Or run all checks at once:

```bash
npm run ci
```

### 4. Create a Changeset

**This is required for all PRs that change functionality.**

```bash
npm run changeset
```

You'll be prompted to:

1. Select the change type:
   - **patch**: Bug fixes, minor changes (1.0.0 → 1.0.1)
   - **minor**: New features, backward-compatible (1.0.0 → 1.1.0)
   - **major**: Breaking changes (1.0.0 → 2.0.0)

2. Write a summary of your changes (this will appear in the changelog)

This creates a file in `.changeset/` directory.

#### For Documentation-Only Changes

If your PR only updates documentation, tests, or build configuration (no functional changes), create an empty changeset:

```bash
npx changeset --empty
```

### 5. Commit and Push

```bash
git add .
git commit -m "Your descriptive commit message"
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Open a PR against the `main` branch
- GitHub Actions will automatically check for a changeset
- Your PR will be reviewed by maintainers

## Release Workflow

Our release process is automated using [Changesets](https://github.com/changesets/changesets) and GitHub Actions.

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Developer creates PR with changeset                      │
│    → Changeset check ensures changeset exists               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PR merged to main                                         │
│    → Release PR workflow triggers                            │
│    → Auto-creates "Version Packages" PR                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. "Version Packages" PR includes:                           │
│    • Updated version in package.json                         │
│    • Updated CHANGELOG.md                                    │
│    • Deleted consumed changeset files                        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Merge "Version Packages" PR                               │
│    → Release workflow triggers                               │
│    → Runs: type check, lint, tests, build                   │
│    → Creates git tag (v1.2.3)                                │
│    → Creates GitHub Release with artifacts                   │
└─────────────────────────────────────────────────────────────┘
```

### Automated Workflows

#### 1. **Changeset Check** (`.github/workflows/changeset-check.yml`)

- **Trigger**: Every PR to `main`
- **Purpose**: Ensures a changeset file exists
- **Action**: Fails PR if no changeset found

#### 2. **Release PR** (`.github/workflows/release-pr.yml`)

- **Trigger**: Push to `main` branch
- **Purpose**: Creates "Version Packages" pull request
- **Action**:
  - Runs `changeset version` to bump versions
  - Updates CHANGELOG.md
  - Creates/updates PR automatically

#### 3. **Release** (`.github/workflows/release.yml`)

- **Trigger**: Version change in `package.json` on `main`
- **Purpose**: Build and publish release
- **Action**:
  - Runs quality checks (types, lint, tests)
  - Builds the widget (`dist/code.js`)
  - Creates git tag (`v1.2.3`)
  - Creates GitHub Release with:
    - Release notes from CHANGELOG.md
    - `dist/code.js` artifact
    - `manifest.json` artifact

### Example Release Flow

```bash
# Developer workflow
git checkout -b feature/dark-mode
# ... make changes ...
npm run changeset  # Select "minor", describe "Add dark mode toggle"
git add .
git commit -m "Add dark mode toggle"
git push

# After PR is merged to main:
# → GitHub Actions automatically creates "Version Packages" PR
# → Review and merge "Version Packages" PR
# → GitHub Actions automatically:
#    ✓ Runs tests
#    ✓ Builds widget
#    ✓ Creates git tag v1.1.0
#    ✓ Creates GitHub Release
```

### Multiple Changes Before Release

If multiple PRs are merged before the "Version Packages" PR is merged, changesets will intelligently combine them:

```bash
PR #1: patch - Fix voting bug
PR #2: minor - Add new card type
PR #3: patch - Fix typo

→ Version Packages PR will:
  • Bump to next minor version (includes both patches and minor)
  • Combine all changelog entries
  • Version: 1.0.0 → 1.1.0
```

## Publishing Releases

**Note**: Releases are automatically published to GitHub, but must be manually installed in Figma.

### Installing a Released Version in Figma

1. **Download the release artifacts**
   - Go to [Releases](https://github.com/YOUR_USERNAME/figma-estimaate-mee/releases)
   - Download `code.js` and `manifest.json` from the latest release

2. **Import into Figma**
   - Open Figma desktop app
   - Go to **Menu → Widgets → Development → Import widget from manifest**
   - Select the downloaded `manifest.json`
   - Figma will load the widget from the same directory

3. **Verify installation**
   - Right-click on canvas
   - Go to **Widgets → Development**
   - Your widget should appear in the list

### Publishing to Figma Community (Manual)

While GitHub releases are automated, publishing to the Figma Community requires manual steps:

1. **Update the widget in your Figma file**
   - Import the latest release following the steps above
   - Test the widget thoroughly

2. **Publish to Community**
   - In Figma, go to **Menu → Widgets → Development → Publish to Community**
   - Fill in the required information:
     - Description
     - Tags
     - Screenshots
   - Submit for review

3. **Update after approval**
   - Once approved, users can install from Figma Community
   - Update community version for each new GitHub release

## Troubleshooting

### Changeset Check Fails

```bash
# Create a changeset if you forgot
npm run changeset

# For documentation-only changes
npx changeset --empty
```

### Tests Failing Locally

```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests with verbose output
npm run test -- --reporter=verbose
```

### Build Issues

```bash
# Check TypeScript errors
npm run tsc

# Force rebuild
rm -rf dist
npm run build
```

## Code Style

- This project uses **Prettier** for formatting and **ESLint** for linting
- Pre-commit hooks automatically format and lint staged files
- Run `npm run format` to format all files
- Run `npm run lint:fix` to auto-fix linting issues

## Getting Help

- Open an [issue](https://github.com/YOUR_USERNAME/figma-estimaate-mee/issues) for bugs
- Start a [discussion](https://github.com/YOUR_USERNAME/figma-estimaate-mee/discussions) for questions
- Check existing issues and discussions before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.
