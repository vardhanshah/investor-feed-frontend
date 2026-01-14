  # Development Workflow

  ## Branching & Worktrees

  - For code changes, create a new branch and worktree in `worktrees/` folder (flat structure)
  - Create `worktrees/` folder if not present (not tracked by git)
  - Branch naming: `feature/{name}` or `bugfix/{name}`
  - Base branch: Always checkout from `development`
  - Only create worktree when code changes are needed (not for questions/exploration)
  - Worktree cleanup is handled by user

  ## Testing Requirements

  - Write exhaustive tests covering all scenarios and edge cases:
    - **Unit tests**: Individual functions/components
    - **Integration tests**: Component interactions
    - **E2E tests**: Full user flows (using Playwright)
  - Run existing tests before starting work to ensure baseline is green
  - All tests must pass before PR

  ## Code Quality

  - Write air-tight, complete code
  - Keep codebase entropy in check: maintain consistency with existing patterns, keep complexity low
  - Can install dependencies as needed

  ## Commit & PR Process

  - Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
  - Run the application for user to review behavior
  - Wait for explicit user approval before pushing and creating PR
  - PR target: `development` branch

  ## Logging

  - Write application logs to `logs/` folder (create if doesn't exist)
  - Log file naming: `logs/{branch-name}.log` (e.g., `logs/feature-user-auth.log`)


# Development Guide

## Prerequisites

- Node.js v18+ (tested with v22.5.1)
- npm or yarn

## Quick Start

```bash
# Install dependencies
npm install
# Start development server
npm run dev
```

The app will be available at `http://localhost:5001`

## Environment Variables

Create a `.env` file in the root directory:

```env
BACKEND_URL=https://dev.investorfeed.in
PORT=5001
```

| Variable | Description | Default |
|----------|-------------|---------|
| `BACKEND_URL` | Backend API URL to proxy requests to | Required |
| `PORT` | Port to run the dev server on | `5001` |

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Run production build |
| `npm run check` | TypeScript type checking |
| `npm run test` | Run tests |
| `npm run test:ui` | Run tests with UI |

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── ui/         # Base UI components (shadcn/ui)
# Environment Setup & Running the Application

## Prerequisites

- macOS with Homebrew installed

## Setup Steps

### 1. Install Node.js

```bash
brew install node
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

The `.env` file contains:
- `BACKEND_URL` - Backend API URL (default: `https://dev.investorfeed.in`)
- `PORT` - Development server port (default: `5001`)

## Running the Application

### Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:5001**

### Running Tests

```bash
npm test
```

To run a specific test file:

```bash
npm test -- --run path/to/test.tsx
```
