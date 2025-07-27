# Investor Feed - Marketing Landing Page

## Overview

This is a React-based marketing landing page for "Investor Feed," a financial insights platform. The application is built using a modern full-stack architecture with Express.js backend, React frontend, and PostgreSQL database using Drizzle ORM. The site focuses on driving traffic to their Twitter account (@_Investor_Feed_) where they provide curated investment insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Styling**: Custom CSS variables for theming with Alata font from Google Fonts

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Build**: esbuild for fast production bundling

### Data Storage Solutions
- **Database**: PostgreSQL (configured via DATABASE_URL environment variable)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Fallback**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Current State**: Complete authentication system implemented with social login
- **Pages**: Login/Signup pages with email and social authentication options
- **Social Login**: Google OAuth and X (Twitter) OAuth integration ready
- **Protected Routes**: Dashboard page for authenticated users
- **Context**: React Context API for global authentication state management
- **Navigation**: Dynamic header with login/logout functionality
- **Session Storage**: localStorage for demo, ready for JWT token integration

## Key Components

### Frontend Components
1. **Header**: Sticky navigation with logo and mobile menu
2. **Hero**: Main landing section with call-to-action to Twitter
3. **About**: Information about the platform's mission
4. **Follow**: Twitter-focused conversion section with value propositions
5. **Footer**: Contact information and social links

### Backend Components
1. **Routes**: Express router setup (currently minimal)
2. **Storage Interface**: Abstracted storage layer with in-memory fallback
3. **Vite Integration**: Development server with HMR support

### UI Library
- Complete shadcn/ui component set including forms, dialogs, navigation, and data display components
- Custom theme with purple brand colors (hsl(258, 60%, 52%))
- Responsive design with mobile-first approach

## Data Flow

1. **Static Content**: All content is currently static and rendered client-side
2. **API Ready**: Backend structure prepared for future API endpoints
3. **Database Schema**: User management schema defined but not actively used
4. **External Links**: Primary CTA directs users to Twitter (@_Investor_Feed_)

## External Dependencies

### Key Libraries
- **UI/Styling**: @radix-ui components, Tailwind CSS, class-variance-authority
- **Data Fetching**: @tanstack/react-query for future API integration
- **Database**: @neondatabase/serverless, drizzle-orm, drizzle-zod
- **Development**: Vite, tsx, esbuild
- **Icons**: lucide-react, react-icons (specifically for Twitter icon)

### Third-Party Services
- **Neon Database**: PostgreSQL hosting (based on @neondatabase/serverless dependency)
- **Google Fonts**: Alata font family
- **Twitter/X**: Primary external integration point

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment detection (development/production)
- `REPL_ID`: Replit-specific environment detection

### Production Setup
- Express serves both API routes (future) and static assets
- Single entry point: `dist/index.js`
- Database migrations must be run before startup
- Sessions stored in PostgreSQL for scalability

### Development Features
- Hot module replacement via Vite
- TypeScript checking across client, server, and shared code
- Replit integration with development banner and runtime error overlay
- File watching and auto-restart capabilities

The application is structured as a marketing funnel with the primary goal of converting visitors to Twitter followers, while maintaining the infrastructure for future feature expansion including user accounts, content management, and API-driven functionality.