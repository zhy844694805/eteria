# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**永念 | EternalMemory** is a bilingual (Chinese) memorial website built with Next.js 15 that supports creating memorial pages for both pets and humans. The application implements a dual memorial system architecture with completely separate user flows and branding.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting (currently disabled in build)
npm run lint
```

The development server runs on http://localhost:3000 by default.

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

### Authentication System

The application includes a complete user authentication system with:

**User Management:**
- Registration and login with email/password
- LocalStorage-based user persistence (no backend required)
- User preference tracking for memorial system choice
- Automatic redirection based on user preferences

**Key Features:**
- **Unified User System**: Pet and human memorial users share the same accounts
- **Preference Memory**: Users who choose a memorial type will be automatically redirected to that system on return visits
- **Context-Aware Navigation**: Login/register buttons appear on main pages, user info shown when logged in

**Authentication Flow:**
1. New users register with name, email, password
2. Users choose memorial type (pet or human) 
3. System saves preference to user profile
4. On return visits, users are automatically redirected to their preferred system
5. Users can switch systems anytime, preference will be updated

**Important Implementation Details:**
- `AuthProvider` wraps the entire app in `layout.tsx`
- User state managed via `useAuth()` hook
- Authentication logic in `/lib/auth.ts` using localStorage
- User types defined in `/lib/types/auth.ts`
- Navigation component shows different UI based on auth state

### Current Limitations

- No backend integration (uses localStorage for auth)
- No database persistence
- Image uploads not implemented  
- Email notifications not configured
- Payment processing not integrated
- Password reset functionality not implemented