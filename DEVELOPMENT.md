# Development Guide

## Prerequisites

- Node.js v18+ (tested with v22.5.1)
- npm or yarn

## Quick Start

```bash
# Install dependencies
npm install

# Create .env file (see Environment Variables below)
cp .env.example .env

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
│   │   │   └── FilterPreview/  # Filter preview feature components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and API client
│   │   └── pages/          # Page components
├── server/                 # Express server (API proxy)
└── .env                    # Environment configuration
```

## Key Features

### Filter Preview (Default Feed)

On the default/live feed, users can filter posts using:

- **Left Sidebar**: Profile selector (companies, sectors, subsectors)
- **Right Sidebar**: Filter criteria (number ranges, boolean filters)

Filters auto-apply with 500ms debounce. Uses `POST /api/posts/search` when filters are active.

### Clickable Filters on Posts

Click on post elements to quickly filter:

- **Sector/Subsector badges** - Filter by that sector/subsector
- **Category badge** - Filter by category
- **Boolean tags** (Order Information, Capacity Expansion, etc.)

### Feed Management

- Create custom feeds with filter criteria
- Edit existing feeds (sidebar state preserved when switching feeds)
- Save filter preview as a new feed

## API Proxy

The dev server proxies `/api/*` requests to the `BACKEND_URL`. This handles:

- Authentication token forwarding
- CORS handling
- Request logging (visible in terminal)

## Troubleshooting

### Port already in use

```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Then restart
npm run dev
```

### TypeScript errors

```bash
# Check for type errors
npm run check
```

### Clear node_modules

```bash
rm -rf node_modules
npm install
```
