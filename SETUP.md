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
