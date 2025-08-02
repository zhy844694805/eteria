# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Working directory is `frontend/` for all commands:

```bash
# Install dependencies (required due to React 19 peer dependency conflicts)
npm install --legacy-peer-deps

# Development server
npm run dev

# Production build
npm run build

# Production server
npm run start

# Linting (disabled during builds in next.config.mjs)
npm run lint

# Database commands
npx prisma generate          # Generate Prisma client after schema changes
npx prisma db push          # Push schema changes to database  
npx prisma studio          # View database in Prisma Studio
npx prisma db push --force-reset  # Reset database (development only)

# Admin management
npm run create-admin        # Create super admin user (admin@aimodel.it / admin123456)
npm run check-admin         # Check admin user status
```

## Project Overview

**永念 | EternalMemory** is a bilingual (Chinese) memorial website built with Next.js 15 that supports creating memorial pages for both pets and humans. The application implements a dual memorial system architecture with completely separate user flows and branding.

## Architecture Overview

### Dual Memorial System

The application has two parallel memorial systems with intelligent routing:

- **Pet Memorial System**: Routes starting with `/pet-memorial`, `/create-obituary`, `/community-pet-obituaries`
- **Human Memorial System**: Routes starting with `/human-memorial`, `/create-person-obituary`, `/community-person-obituaries`
- **Main Homepage**: `/` acts as a landing page to choose between systems

The navigation component (`/components/navigation.tsx`) detects which system the user is in via pathname analysis and shows context-appropriate menus with different color schemes:
- **Teal/Turquoise**: Pet memorial system
- **Purple**: Human memorial system

### Multi-Step Form Pattern

Both memorial creation flows use a consistent multi-step form architecture:

1. **Information Step**: Basic details (name, dates, photos)
2. **Story Step**: Life story and memories
3. **Creator Information Step**: Details about who is creating the memorial

Form state is managed at the page level with:
- Centralized `formData` object
- `updateFormData` helper function
- Step validation with `canProceed` flags
- Navigation between steps with `currentStep` state

### Technology Stack

- **Next.js 15.2.4** with App Router and React 19
- **TypeScript** with strict configuration
- **Tailwind CSS 3.4.17** with custom design system
- **shadcn/ui** component library (40+ Radix UI components)
- **React Hook Form + Zod** for form validation
- **Lucide React** for icons

### Component Architecture

**Navigation System:**
```typescript
// Navigation intelligently detects current system
const isPetMemorialSystem = pathname.startsWith('/pet-memorial') || 
                            pathname.startsWith('/create-obituary') || 
                            pathname.startsWith('/community-pet-obituaries')

const isHumanMemorialSystem = pathname.startsWith('/human-memorial') || 
                              pathname.startsWith('/create-person-obituary') || 
                              pathname.startsWith('/community-person-obituaries')
```

**Form Components:**
- Pet forms: `/components/create-obituary/*`
- Human forms: `/components/create-person-obituary/*`
- Shared UI: `/components/ui/*` (shadcn/ui components)

### Key Differences Between Systems

**Pet Memorial Fields:**
- `petName`, `petType`, `breed`, `color`, `gender`
- Pet-specific language and icons

**Human Memorial Fields:**  
- `personName`, `relationship`, `age`, `occupation`, `location`
- Relationship options: parent, spouse, child, sibling, relative, friend, colleague, other

### Development Configuration

The `next.config.mjs` has build optimizations disabled for development:
- ESLint checks disabled during builds
- TypeScript errors ignored during builds  
- Image optimization disabled

### Chinese Localization

The application is primarily in Chinese with:
- Page metadata set to `lang="zh-CN"`
- Chinese titles and descriptions
- Mixed Chinese/English in code (Chinese for user-facing content, English for technical terms)

### Dynamic Routes

Community pages use dynamic routing:
- `/community-pet-obituaries/[slug]` for individual pet memorials
- `/community-person-obituaries/[slug]` for individual human memorials

Slug generation pattern: `name.toLowerCase().replace(/[^a-z0-9]/g, "").substring(0, 6) + "h2"`

### Styling System

Custom Tailwind configuration with:
- CSS variables for theming
- Component variants using `class-variance-authority`
- Consistent spacing and typography scales
- Dark mode support (via `next-themes`)

### Important Development Notes

1. **Form State Management**: Always use the centralized `formData` pattern with `updateFormData` helper
2. **Navigation Context**: Use pathname detection to determine which memorial system the user is in
3. **Color Schemes**: Maintain teal for pet system, purple for human system
4. **Chinese Content**: User-facing content should be in Chinese, code should use English variable names
5. **Component Imports**: Use absolute imports with `@/` prefix for components and utilities
6. **Type Safety**: All form data should be properly typed, especially the different field structures between pet and human memorials

### Database Integration

**Database Stack:**
- **Prisma ORM** with SQLite for development
- Full database schema supporting users, memorials, images, messages, candles, likes
- Type-safe database operations with generated Prisma client

**Key Database Commands:**
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Push schema changes to database  
npx prisma db push

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma db push --force-reset
```

### Authentication System

**Multi-Provider Authentication Architecture:**
The application supports multiple authentication methods with database-backed user management:

- **Database Authentication** (`/lib/auth-db.ts`): Primary system using Prisma + SQLite
- **Google OAuth** (`/api/auth/google/*`): Google SSO integration with automatic user creation
- **localStorage Authentication** (`/lib/auth.ts`): Legacy system for backward compatibility  
- **Migration Service** (`/lib/migration-service.ts`): Handles data migration from localStorage to database
- **Admin Authentication** (`/lib/admin-auth.ts`): Role-based admin access control

**Authentication Methods:**
1. **Email/Password**: Traditional registration with bcrypt password hashing
2. **Google OAuth**: Single Sign-On using Google accounts, automatic user creation/linking
3. **Admin System**: Role-based access (USER, MODERATOR, ADMIN, SUPER_ADMIN)

**Key Features:**
- CUID-based user IDs for database consistency
- JWT token-based session management
- OAuth provider tracking (`provider` field: 'email', 'google', etc.)
- Memorial creation with proper user association
- Real-time memorial listing and community features
- Admin dashboard with user management

**Authentication Flow:**
1. Users register/login through database-backed API endpoints (`/api/auth/*`)
2. User sessions managed via `useAuth()` hook with database state
3. Memorial creation requires authenticated users with valid database records
4. Migration alerts prompt users to move localStorage data to database
5. Google OAuth flow: authorization → callback → user creation/linking → JWT token

### API Architecture

**RESTful API Structure:**
- `/api/auth/*` - User authentication endpoints (login, register, Google OAuth, verify)
- `/api/auth/google/*` - Google OAuth flow (authorization URL, callback handling)
- `/api/admin/*` - Admin-only endpoints for user/content management
- `/api/memorials/*` - Memorial CRUD operations with user authorization
- `/api/images/*` - Image upload and management (file storage + database records)
- `/api/upload/image/*` - File upload handling (multipart/form-data)
- `/api/messages/*` - Memorial messages/comments
- `/api/candles/*` - Virtual candle lighting
- `/api/debug/*` - Development debugging endpoints

**Important API Patterns:**
- All APIs use Zod for request/response validation
- Prisma relationships automatically include related data
- Error handling with standardized response formats
- User authorization checks for memorial ownership
- JWT token validation via Authorization header or cookies
- OAuth callback handling with redirect-based flow
- File upload with validation (type, size limits)
- Admin role verification for protected endpoints

### Data Persistence Strategy

**Memorial Creation Flow:**
1. User fills multi-step form (pet info → story → creator info)
2. Form submission sends complete payload to `/api/memorials`
3. Database creates memorial with all relationships (images, tags, etc.)
4. Memorial appears in community listings with real-time data

**Database Schema Highlights:**
- Users have `preferredSystem` (PET/HUMAN) for automatic routing
- OAuth support with `provider` and `providerId` fields for multi-provider authentication
- User roles (USER, MODERATOR, ADMIN, SUPER_ADMIN) with role-based access control
- Memorials support both pet and human types with flexible fields
- Rich relationship modeling (messages, candles, likes, images, tags)
- Image management with file metadata (filename, size, mimeType, isMain flag)
- Soft deletion and status management (DRAFT/PUBLISHED/ARCHIVED)
- Admin audit logging and content review system

### Form Architecture Specifics

**Pet Information Step Enhancements:**
- Dynamic breed selection based on pet type (25+ dog breeds, 22+ cat breeds, etc.)
- Comprehensive breed database covering dogs, cats, birds, rabbits, hamsters, guinea pigs, and exotic pets
- Form validation prevents empty string values in Select components
- Pet type selection drives available breed options dynamically

### Image Upload System

**File Upload Architecture:**
- **Frontend**: Multi-step form with image preview and management
- **API**: `/api/upload/image` handles file storage to `public/uploads/images/`
- **Database**: `/api/images` manages image metadata and relationships
- **Validation**: File type (JPG, PNG, GIF, WebP), size limits (5MB), quantity limits (10 per memorial)

**Image Upload Flow:**
1. User selects images in memorial creation form
2. Files uploaded to `/api/upload/image` → saved to filesystem
3. Image metadata stored via `/api/images` → database records
4. Memorial creation associates image IDs with memorial
5. Display uses relative URLs from database records

### Admin System

**Admin Dashboard Features:**
- User management (view, ban, role assignment)
- Memorial moderation (approve, reject, delete)
- System statistics and analytics
- Audit logging for all admin actions

**Admin Access:**
- Route: `/admin` (role-based access control)
- Authentication: Admin roles required (MODERATOR, ADMIN, SUPER_ADMIN)
- Default super admin: `admin@aimodel.it` / `admin123456` (created via script)

### Environment Configuration

**Required Environment Variables:**
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_BASE_URL="http://localhost:3001"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3001"
```

### Development Debugging

**Common Issues:**
- Select components require non-empty string values (use placeholder values like "no-type" for disabled options)
- Database field mapping must match Prisma schema exactly (e.g., `authorId` not `creator`)
- Authentication context switches between localStorage and database systems during transition
- TypeScript errors in API routes often indicate Prisma schema mismatches
- Image upload requires proper file validation and error handling
- Google OAuth requires valid client credentials and redirect URI configuration
- Next.js 15 dynamic routes require `await params` in page components

### Current System Status

**Implemented Features:**
- Full user authentication with database persistence
- Google OAuth integration with automatic user creation/linking
- Memorial creation with comprehensive image upload system
- Community memorial listings with real-time data
- Multi-step form with comprehensive pet breed selection
- Admin dashboard with user management and content moderation
- Role-based access control (USER, MODERATOR, ADMIN, SUPER_ADMIN)
- Image upload and management with file validation
- Chinese localization throughout application
- Edit memorial functionality with authentication checks

**Migration Path:**
- Users with localStorage data see migration prompts
- Database system is primary, localStorage maintained for backward compatibility
- Memorial creation requires database authentication
- Google OAuth users automatically verified and created in database