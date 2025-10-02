# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
npm run dev           # Start development server with TurboPack (localhost:3000)
npm run build         # Build production bundle
npm run start         # Start production server
npm run lint          # Run Next.js linting
```

### TypeScript
```bash
npx tsc --noEmit     # Type-check without emitting files
```

## Architecture Overview

CPAnalyzer is a charter party risk analysis tool built with Next.js 15, TypeScript, and shadcn/ui components. The application analyzes charter party agreements to identify risks, conflicts, and areas requiring attention.

### Core Architecture Patterns

1. **Unidirectional Data Flow**: State flows down via props, actions flow up via callbacks. The `AnalysisView` component serves as the single source of truth for analysis items and triage status.

2. **Centralized Storage**: All localStorage interactions are encapsulated in `StorageService` (`src/lib/storage-service.ts`). This service manages:
   - Authentication state
   - Assessment data
   - Feedback data
   - Triage status
   - View preferences

3. **Authentication**: The `useAuth` hook (`src/hooks/useAuth.ts`) manages authentication state and interacts with StorageService for persistence.

### Key Components & Data Flow

```
Home (page.tsx)
├── LoginForm (if not authenticated)
└── AppSidebar + Main Content (if authenticated)
    ├── AssessmentsListView
    │   └── Creates/manages assessments
    └── FeedbackManagementView
        └── Manages feedback across assessments

Assessment Detail (/assessment/[id]/page.tsx)
└── AnalysisView
    ├── AnalysisFilterTabs (filter UI)
    ├── AnalysisCard (displays items)
    └── FeedbackSection (rating & comments)
```

### Important Services

- **StorageService** (`lib/storage-service.ts`): Manages all localStorage operations
- **FeedbackService** (`lib/feedback-service.ts`): Handles feedback creation, updates, and soft-deletion
- **FileService** (`lib/file-service.ts`): Discovers and loads assessment JSON files from `/public/assessments/`
- **AssessmentUtils** (`lib/assessment-utils.ts`): Utility functions for assessment operations

### Data Models

Key TypeScript types are defined in `src/types/`:
- `Assessment`: Core assessment data structure
- `AnalysisItem`: Individual risk/conflict items
- `TriageStatus`: Item triage states (pending, acknowledged, resolved, false-positive)
- `Feedback`: User feedback on analysis quality

### File Organization

- `/src/app/`: Next.js App Router pages and layouts
- `/src/components/`: React components organized by domain
- `/src/lib/`: Services, utilities, and business logic
- `/src/types/`: TypeScript type definitions
- `/public/assessments/`: JSON data files for assessments

## Adding New Assessments

To add a new assessment for a specific tenant:

1. **Add JSON data files** to `/public/`:
   - Create `{assessment_id}_risks.json` with risk assessment data
   - Create `{assessment_id}_conflicts.json` with conflict report data

2. **Register the assessment** in `/src/lib/assessment-utils.ts`:
   - Add to `MOCK_ASSESSMENTS` array with metadata (id, name, user, lastUpdated)

3. **Grant tenant access** in `/src/components/auth/login-form.tsx`:
   - Add the assessment ID to the appropriate tenant in `TENANT_ASSESSMENTS`
   - Currently available tenants: 'ldc', 'bunge', 'user'

Example: Adding "Fortune Destiny" for LDC tenant:
```typescript
// 1. Files: public/fortune_destiny_risks.json, public/fortune_destiny_conflicts.json

// 2. In src/lib/assessment-utils.ts:
{
  id: 'fortune_destiny',
  name: 'Fortune Destiny',
  user: 'Leslie Clerc',
  lastUpdated: '2025-09-18T10:00:00Z'
}

// 3. In src/components/auth/login-form.tsx:
const TENANT_ASSESSMENTS = {
  'ldc': [
    // ... other assessments
    'fortune_destiny',
    // ...
  ]
}
```

## Development Notes

- The app uses Next.js App Router with client-side components (`"use client"`)
- Authentication is currently mock-based (no real backend)
- Data persistence uses localStorage (prepared for Supabase migration)
- UI components from shadcn/ui follow consistent design patterns
- Tailwind CSS with custom theme variables in `globals.css`