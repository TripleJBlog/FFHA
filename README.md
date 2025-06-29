# Forge & Fury: Hero's Ascent

## Overview

This is a browser-based idle RPG game called "Forge & Fury: Hero's Ascent" built with a full-stack TypeScript architecture. Players create heroes, engage in idle combat, craft equipment, and compete in PvP arena battles. The game features persistent character progression, real-time combat mechanics, and offline reward systems.

## System Architecture

### Frontend Architecture

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for game assets
- **Styling**: Tailwind CSS with custom game theme
- **3D Graphics**: Three.js with React Three Fiber for 3D rendering
- **State Management**: Zustand with persistence middleware
- **UI Components**: Radix UI components with custom styling
- **Query Management**: TanStack Query for server state

### Backend Architecture

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Management**: In-memory storage (development) with planned PostgreSQL migration
- **API Design**: RESTful endpoints with validation using Zod schemas

### Data Flow

1. **Client-Side State**: Zustand stores manage game state (hero, combat, equipment, workshop)
2. **Server Communication**: HTTP requests through TanStack Query with automatic retries
3. **Real-time Updates**: Polling-based system for idle combat progression
4. **Persistence**: Client state persisted to localStorage, server data to PostgreSQL

## Key Components

### Game Systems

- **Hero Management**: Character creation, leveling, stat progression
- **Combat System**: Idle combat with automatic enemy engagement
- **Equipment System**: Weapon/armor crafting, enhancement, and socketing
- **Workshop**: Item crafting with material requirements and time-based completion
- **Arena PvP**: Ranked battles against other players
- **Offline Rewards**: Progression continues when players are away

### State Management Stores

- `useHero`: Character data, stats, experience, and resources
- `useCombat`: Idle combat state, enemy encounters, combat logs
- `useEquipment`: Inventory management, item enhancement
- `useWorkshop`: Crafting queues, materials, recipe management
- `useArena`: PvP rankings, opponent finding, battle results
- `useOffline`: Offline progression calculation and reward distribution

### UI Architecture

- **Responsive Design**: Mobile-first approach with desktop optimizations
- **Component Library**: Custom components built on Radix UI primitives
- **Game Interface**: Tabbed navigation between game systems
- **3D Integration**: Three.js canvas for enhanced visual effects

## External Dependencies

### Core Libraries

- **React Ecosystem**: React, React DOM, React Router
- **3D Graphics**: @react-three/fiber, @react-three/drei, @react-three/postprocessing
- **UI Components**: @radix-ui/\* components for accessible UI elements
- **State Management**: Zustand with persistence
- **Database**: Drizzle ORM with @neondatabase/serverless driver
- **Validation**: Zod for runtime type checking

### Development Tools

- **Build System**: Vite with TypeScript and React plugins
- **Styling**: Tailwind CSS with PostCSS
- **Type Safety**: TypeScript with strict configuration
- **Asset Handling**: Support for GLTF, GLB, MP3, OGG, WAV files

## Deployment Strategy

### Production Build

- **Frontend**: Vite builds optimized bundle to `dist/public`
- **Backend**: ESBuild compiles server code to `dist/index.js`
- **Assets**: Large 3D models and audio files supported via Vite config

### Environment Configuration

- **Database**: Neon PostgreSQL with connection pooling
- **Session Storage**: connect-pg-simple for production sessions
- **Port Configuration**: Server runs on port 5000 with external port 80

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
