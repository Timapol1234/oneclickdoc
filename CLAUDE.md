# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Конструктор заявлений** - веб-сервис для создания юридически корректных заявлений через пошаговый конструктор с готовыми шаблонами для МФЦ, судов, банков, ФНС и других организаций.

## Technology Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon.tech in production)
- **Authentication:** NextAuth.js
- **Validation:** Zod, React Hook Form
- **State Management:** Zustand
- **Telegram Bot:** Grammy framework
- **Email:** Nodemailer with SMTP
- **Error Tracking:** Sentry (optional)

## Essential Commands

### Development
```bash
npm run dev            # Start development server (http://localhost:3000)
npm run build          # Build for production
npm run start          # Run production build
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run type-check     # TypeScript type checking
```

### Database
```bash
npx prisma migrate dev --name <name>  # Create and apply new migration
npx prisma db push                    # Push schema changes (development)
npx prisma db seed                    # Seed database with initial data
npx prisma studio                     # Open Prisma Studio GUI
npx prisma generate                   # Generate Prisma Client
```

### Telegram Bot
```bash
# Setup webhook (after deployment)
curl -X POST https://your-app.vercel.app/api/bot/setup

# Check webhook status
curl https://your-app.vercel.app/api/bot/setup

# Delete webhook
curl -X DELETE https://your-app.vercel.app/api/bot/setup
```

## High-Level Architecture

### Next.js App Structure

The project uses Next.js 14 App Router architecture:

- `src/app/` - App Router pages and API routes
  - Each folder represents a route
  - `page.tsx` - Page component
  - `layout.tsx` - Layout wrapper
  - `route.ts` - API route handler
- `src/components/` - Reusable React components organized by feature
- `src/lib/` - Shared utilities and helpers
- `src/store/` - Zustand state management
- `src/types/` - TypeScript type definitions
- `src/bot/` - Telegram bot implementation

### Database Schema Architecture

Core models and their relationships:

1. **User** (users table)
   - Can authenticate via email/phone OR Telegram
   - `email`, `phone`, `telegramId` fields (all optional, but at least one required)
   - Has many `documents` and `verificationCodes`

2. **Template** (templates table)
   - Belongs to a `Category`
   - Has many `FormField` (the form structure)
   - Has many `Document` (filled instances)
   - Contains `contentJson` (HTML template with placeholders)

3. **FormField** (form_fields table)
   - Belongs to a `Template`
   - Defines form structure: fieldName, fieldType, label, validationRules
   - Organized by `stepNumber` and `order`
   - Field types: text, number, date, select, textarea

4. **Document** (documents table)
   - Belongs to `User` and `Template`
   - Status: "draft" or "generated"
   - `filledData` stores user responses as JSON
   - `pdfUrl` for generated PDF file

5. **Category** (categories table)
   - Has many `Template`
   - Used for organizing templates (МФЦ, Суды, Банки, etc.)

### Telegram Bot Architecture

The Telegram bot integrates with the main application:

- **Webhook-based:** Uses Telegram webhooks (not polling)
- **Session Management:** In-memory session storage for form filling
- **User Linking:** Users are identified by `telegramId` in the database
- **Form Flow:** Multi-step forms with inline keyboards and text input
- **API Integration:** Shares database and business logic with web app

**Bot Flow:**
1. User sends `/start` → Auto-register/login via Telegram ID
2. Browse templates → Select category → Select template
3. Start form → Answer questions step-by-step
4. Submit → Document saved to database

**Key Files:**
- `src/bot/index.ts` - Bot initialization and exports
- `src/bot/handlers/` - Command and callback handlers
- `src/bot/session/SessionManager.ts` - Form state management
- `src/app/api/bot/webhook/route.ts` - Telegram webhook endpoint

### Document Generation Flow

1. User selects a template
2. System loads template with associated FormFields (sorted by stepNumber, order)
3. User fills out form step-by-step
4. Data is validated using Zod schemas based on FormField.validationRules
5. Filled data is stored as JSON in Document.filledData
6. HTML template (from Template.contentJson) is merged with filled data
7. PDF is generated (using html2pdf.js on client-side or server-side solution)
8. PDF URL is stored in Document.pdfUrl

### Authentication Flow

**Web App:**
- NextAuth.js with Credentials provider
- Email or phone + password authentication
- Email/phone verification via codes (VerificationCode model)
- Session stored in cookies

**Telegram Bot:**
- Auto-registration on first `/start` command
- User identified by Telegram ID (unique)
- No password required
- Shares same User model and database

## Important Patterns and Conventions

### API Route Structure

API routes follow consistent patterns:

```typescript
// GET /api/resource - List/Read
export async function GET(request: NextRequest) {
  // Read from database
  // Return JSON response
}

// POST /api/resource - Create
export async function POST(request: NextRequest) {
  const body = await request.json();
  // Validate with Zod
  // Create in database
  // Return JSON response
}

// PATCH/PUT /api/resource/[id] - Update
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Update in database
  // Return JSON response
}
```

### Prisma Client Usage

Always use the singleton pattern for Prisma Client:

```typescript
import { prisma } from '@/lib/prisma';

// Use prisma.model.method()
const users = await prisma.user.findMany();
```

### Form Handling Pattern

Forms use React Hook Form + Zod:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  field: z.string().min(1, 'Required')
});

const form = useForm({
  resolver: zodResolver(schema)
});
```

### Telegram Bot Handlers

All handlers follow this pattern:

```typescript
export async function handleCommand(ctx: BotContext) {
  const telegramId = ctx.from?.id.toString();

  if (!telegramId) {
    await ctx.reply('Error message');
    return;
  }

  try {
    // Business logic
    await ctx.reply('Success message');
  } catch (error) {
    console.error('Error:', error);
    await ctx.reply('Произошла ошибка');
  }
}
```

## Environment Variables

Required variables in `.env`:

```env
# Database (required)
DATABASE_URL="postgresql://..."

# NextAuth (required for web app)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Telegram Bot (required for bot)
TELEGRAM_BOT_TOKEN="bot-token-from-botfather"
WEBHOOK_URL="https://your-app.vercel.app"

# Email (required for verification)
SMTP_USER="email@example.com"
SMTP_PASSWORD="password"
```

## Database Migrations

When modifying Prisma schema:

1. Update `prisma/schema.prisma`
2. Run migration:
   - Development: `npx prisma migrate dev --name descriptive_name`
   - Production: `npx prisma migrate deploy`
3. Regenerate client: `npx prisma generate` (usually automatic)

**Important:** The `telegramId` field was added to support Telegram bot authentication. Ensure this field is present when working with user authentication.

## Key Integration Points

### Web App ↔ Telegram Bot

Both interfaces share:
- Same database (via Prisma)
- Same User model (web users can also use bot)
- Same Template and Document models
- Same business logic for document creation

**Differences:**
- Web: NextAuth session-based authentication
- Bot: Telegram ID-based authentication (no password)
- Web: Multi-page form with preview
- Bot: Chat-based step-by-step form

### Template System

Templates are highly configurable:

- `contentJson`: HTML template with Handlebars-style placeholders `{{fieldName}}`
- `formFields`: Array of field definitions (what data to collect)
- `applicantType`: "physical", "legal", or "both" (filters templates)
- `tags`: Comma-separated tags for search/filtering

When creating new templates, ensure:
1. FormFields match placeholders in contentJson
2. StepNumber groups related fields
3. Validation rules are defined as JSON string

## Common Tasks

### Adding a New Template

1. Create category (if needed) via seed or Prisma Studio
2. Create template with contentJson (HTML)
3. Add FormFields for each placeholder in contentJson
4. Test form flow in web app and/or Telegram bot

### Adding a New API Endpoint

1. Create `route.ts` in `src/app/api/[path]/`
2. Export GET/POST/PATCH/DELETE functions
3. Use Prisma for database operations
4. Return NextResponse.json()
5. Add error handling

### Modifying Telegram Bot

1. Add/modify handlers in `src/bot/handlers/`
2. Register handler in `src/bot/handlers/index.ts`
3. Test locally with ngrok
4. Deploy and update webhook

## Testing

While there are no automated tests, manual testing workflow:

1. **Web App:** Start dev server, test flows in browser
2. **API Routes:** Use curl or Postman
3. **Telegram Bot:**
   - Local: Use ngrok + real Telegram bot
   - Production: Test directly with deployed bot
4. **Database:** Use Prisma Studio for data inspection

## Deployment

**Vercel (recommended):**

1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel Dashboard
3. Deploy main branch
4. After deployment, setup Telegram webhook: `POST /api/bot/setup`

**Environment Variables on Vercel:**
- All variables from `.env` should be added
- `WEBHOOK_URL` should be your Vercel app URL
- Database should be production PostgreSQL (Neon.tech recommended)

## Documentation

- `README.md` - General project overview and setup
- `docs/TELEGRAM_BOT.md` - Complete Telegram bot documentation
- `docs/TELEGRAM_BOT_QUICKSTART.md` - Quick start guide for bot
- This file (CLAUDE.md) - Guidance for Claude Code

## Code Style

- TypeScript strict mode enabled
- Prettier for formatting
- ESLint for linting
- Use async/await (not .then())
- Use const/let (not var)
- Functional components with hooks (no class components)
