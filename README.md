# Underwater Reports - Underwater Cleaning & Inspection Analysis

A tool for analyzing underwater cleaning and inspection reports to verify provider claims and assess vessel condition.

## Project Structure

### 📁 cpanalyzer-v1
The original implementation using vanilla JavaScript with React via CDN.
- Simple static HTML/JS application
- No build process required
- Uses localStorage for data persistence
- Quick to deploy but limited scalability

### 📁 cpanalyzer-v2
Modern implementation built with Next.js, TypeScript, and shadcn/ui.
- Full-stack ready architecture
- Type-safe development
- Modern UI components
- Prepared for database integration and multi-tenant support

## Live Demo

**Production URL**: https://cpanalyzerdemo.netlify.app/

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/danleads/cpanalyzer-demo.git
cd cpanalyzer-demo

# Install dependencies
npm install

# Run development server
npm run dev
# Visit http://localhost:3000
```

### Available Scripts
```bash
npm run dev    # Start development server
npm run build  # Build for production
npm run lint   # Run linting
npx tsc --noEmit  # Type checking
```

## Features

- **Risk Assessment**: Identifies missing information, ambiguities, and potential risks in charter parties
- **Conflict Analysis**: Detects conflicting clauses between different documents
- **Feedback System**: Allows users to rate and comment on analysis quality
- **Multi-Tenant Support**: Isolated data access for different organizations
- **Triage System**: Mark items as acknowledged, resolved, or false positives
- **Export Functionality**: Export feedback data for review

## Migration from v1 to v2

Version 2 maintains feature parity with v1 while adding:
- Better performance and scalability
- Improved UI/UX with consistent design system
- Type safety with TypeScript
- Ready for authentication and multi-tenant features
- Prepared for cloud storage and AI integration

## Future Development

The v2 architecture is designed to support:
- Supabase integration for authentication and data storage
- File upload capabilities for charter party documents
- AI-powered analysis features
- Multi-tenant SaaS functionality
- Real-time collaboration features 

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 15, TypeScript, React
- **UI**: shadcn/ui components, Tailwind CSS
- **Data Storage**: localStorage (demo), Supabase (production-ready)
- **Deployment**: Netlify with continuous deployment from GitHub

### Key Directories
- `/src/app/` - Next.js App Router pages
- `/src/components/` - React components
- `/src/lib/` - Business logic and utilities
- `/src/types/` - TypeScript type definitions
- `/public/` - Static assets and assessment JSON files
- `/docs/` - Project documentation

## Documentation

For detailed documentation, please see the `/docs` directory:

- **[Architecture](docs/architecture.md)** - System design and data flow
- **[Contributing](docs/CONTRIBUTING.md)** - Development workflow and guidelines
- **[Deployment](docs/DEPLOYMENT.md)** - Deployment process and environments
- **[Design System](docs/DESIGN.md)** - UI/UX guidelines 