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
```

## Architecture Overview

This is a Chinese-localized pet obituary website built with Next.js 15 App Router architecture. The application is fully translated to Chinese (永念 | EternalMemory) and uses modern React patterns.

### Key Technical Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with build error ignoring enabled
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Library**: Radix UI primitives with custom styling
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Font**: Inter from Google Fonts

### Application Structure

**Pages (App Router)**:
- `/` - Homepage with hero section, how-it-works, statistics, recent obituaries
- `/create-obituary` - Multi-step form for pet obituary creation
- `/community-pet-obituaries` - Gallery of all pet obituaries with filtering
- `/community-pet-obituaries/[slug]` - Individual obituary pages
- `/pricing` - Pricing information
- `/donate` - Donation page

**Components Architecture**:
- `components/navigation.tsx` - Main site navigation with current page highlighting
- `components/footer.tsx` - Site footer with newsletter signup
- `components/ui/` - shadcn/ui component library (40+ components)
- `components/create-obituary/` - Multi-step form components:
  - `pet-information-step.tsx` - Pet details and photo upload
  - `tell-their-story-step.tsx` - Story writing (AI or manual)
  - `your-information-step.tsx` - Owner contact information

### State Management Patterns

**Multi-step Form State**: The create obituary flow uses useState with a unified form data object containing:
- Pet information (name, type, breed, dates, photos)
- Story data (writing method, traits, memories)
- Owner information (name, email)

**Navigation State**: Navigation component accepts `currentPage` prop for active state styling.

### Styling System

**Tailwind Configuration**: Extended theme with CSS variables for dynamic theming, custom color palette including sidebar components, and shadcn/ui integration.

**Component Styling Patterns**:
- Gradient backgrounds: `bg-gradient-to-b from-pink-50 to-purple-50`
- Rounded design language: `rounded-2xl`, `rounded-full` buttons
- Color scheme: Teal primary (`teal-400`), purple (`purple-400`), pink (`pink-400`) accents
- Responsive design with `md:` breakpoints

### Internationalization Notes

The entire application is Chinese-localized:
- HTML lang attribute: `zh-CN`
- All UI text translated to Chinese
- Pet breed names localized
- Form placeholders and validation messages in Chinese
- Maintain Chinese text when adding new features

### Development Patterns

**File Upload Handling**: Uses FileReader API for image previews with File objects stored in state.

**Dynamic Routing**: Slug generation for pet obituaries uses name + type + year + hash pattern.

**Component Composition**: Heavy use of compound components (Select with SelectTrigger, SelectContent, SelectItem pattern).

**Form Validation**: Multi-step validation with conditional proceed logic based on required fields.

### Build Configuration Notes

- TypeScript and ESLint errors ignored during builds (development-focused setup)
- Image optimization disabled (`unoptimized: true`)
- Uses `--legacy-peer-deps` for npm install due to React 19 compatibility issues with some dependencies