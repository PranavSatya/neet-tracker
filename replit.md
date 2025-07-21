# WorkTrackWeb - Quadgen Maintenance Tracking Application

## Overview

WorkTrackWeb is a full-stack React web application designed for Quadgen to manage maintenance activities including preventive maintenance, corrective maintenance, and change requests. The application features role-based authentication with separate interfaces for regular users and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: TailwindCSS with CSS variables for theming
- **Animations**: Framer Motion for smooth transitions and interactions
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React hooks with Context API for authentication
- **Form Handling**: React Hook Form with Zod for validation
- **Data Fetching**: TanStack React Query for server state management

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: Firebase Firestore (NoSQL document database)
- **Authentication**: Firebase Authentication with email/password
- **API Architecture**: RESTful API endpoints prefixed with `/api`
- **Development Setup**: Vite dev server with HMR and middleware integration

### Database Design
The application is configured to use both Firebase Firestore and potentially PostgreSQL with Drizzle ORM:
- **Firestore Collections**:
  - `users` - User profiles with role information
  - `preventive_maintenance` - Preventive maintenance records
  - `corrective_maintenance` - Corrective maintenance records
  - `change_requests` - Change request records
- **Drizzle Schema**: Basic user table defined for potential PostgreSQL migration

## Key Components

### Authentication System
- Firebase Auth integration for email/password authentication
- Role-based access control (admin/user roles)
- Protected routes with automatic redirection based on user role
- Persistent authentication state management

### User Interface
- **Activity Selector**: Dashboard for users to choose maintenance activities
- **Form Components**: Dedicated forms for each maintenance type with validation
- **Admin Dashboard**: Comprehensive view of all maintenance records with filtering and export capabilities
- **Responsive Design**: Mobile-first approach with consistent styling

### Data Management
- Real-time data synchronization with Firestore
- Form validation using Zod schemas
- Toast notifications for user feedback
- Loading states and error handling

## Data Flow

1. **Authentication Flow**:
   - User logs in via Firebase Auth
   - System fetches user role from Firestore
   - Automatic redirection to appropriate dashboard

2. **User Workflow**:
   - Select maintenance activity type
   - Fill out corresponding form with validation
   - Submit data to Firestore collection
   - Receive confirmation with success animation

3. **Admin Workflow**:
   - View aggregated data from all maintenance collections
   - Apply filters by activity type, date, and status
   - Export filtered data to CSV format

## External Dependencies

### Core Technologies
- **Firebase**: Authentication and Firestore database
- **Shadcn/ui**: Pre-built accessible UI components
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for React

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and better developer experience
- **ESLint/Prettier**: Code formatting and linting
- **Drizzle Kit**: Database migration tool (for potential PostgreSQL usage)

### Runtime Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- Firebase SDK (@neondatabase/serverless for potential migration)
- Form validation (Zod, @hookform/resolvers)
- Date handling (date-fns)
- CSV export functionality

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized production bundle
- Backend: ESBuild compiles TypeScript server code
- Static assets served from `dist/public` directory

### Environment Configuration
- Firebase configuration via environment variables
- Development vs production builds with different optimizations
- Replit-specific integrations for development environment

### Production Considerations
- Static file serving through Express
- Environment-specific Firebase project configuration
- Error handling and logging middleware
- Session management with potential PostgreSQL session store

The application is designed to be easily deployable on various platforms while maintaining development flexibility through the Vite dev server integration and potential database migration path from Firebase to PostgreSQL using Drizzle ORM.