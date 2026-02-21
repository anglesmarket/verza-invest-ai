# Verza InvestArt - Startup Funding Platform

A modern, secure platform connecting visionary entrepreneurs with forward-thinking investors. Built with Next.js, MongoDB, and NextAuth.

## Features

- **Startup Profiles** — Entrepreneurs can create comprehensive profiles showcasing their ventures
- **Investment System** — Secure investment commitments from $1,000 minimum
- **Discovery & Search** — Browse startups by industry, funding stage, and location
- **Role-Based Access** — Investor, Entrepreneur, and Admin roles with tailored dashboards
- **Bilingual Support** — Full English and Persian/Farsi language support (RTL)
- **Dark Mode** — Beautiful dark/light theme with smooth transitions
- **Responsive Design** — Mobile-first design optimized for all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: MongoDB + Mongoose
- **Auth**: NextAuth.js (Credentials + Google OAuth)
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Fonts**: Space Grotesk

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd verza-investart
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template and fill in your values:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | Random secret for JWT encryption |
| `NEXTAUTH_URL` | Yes | Base URL of the app (e.g. `http://localhost:3000`) |
| `GOOGLE_ID` | No | Google OAuth client ID (optional) |
| `GOOGLE_SECRET` | No | Google OAuth client secret (optional) |

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── api/          # REST API endpoints
│   │   ├── auth/     # Authentication routes
│   │   ├── startups/ # Startup CRUD operations
│   │   └── investments/ # Investment tracking
│   ├── startups/     # Startup browsing & detail pages
│   ├── dashboard/    # User dashboards
│   ├── admin/        # Admin panel
│   └── auth/         # Sign in / Register pages
├── components/       # UI components
│   ├── Hero.tsx             # Hero section
│   ├── FeaturedStartups.tsx # Startup showcase
│   ├── StartupCard.tsx      # Startup card component
│   ├── HowItWorks.tsx       # Process explanation
│   ├── Navbar.tsx           # Navigation
│   └── Footer.tsx           # Footer
├── context/          # React Context providers
│   ├── AuthContext     # NextAuth SessionProvider wrapper
│   ├── DataContext     # Central data hub
│   └── NotificationContext # Toast & alerts
├── lib/              # Utilities & configurations
│   ├── db.ts         # MongoDB connection
│   ├── auth.ts       # NextAuth configuration
│   └── constants.ts  # Static data & fallbacks
└── models/           # Mongoose schemas
    ├── User.ts       # User model (multi-role)
    ├── Startup.ts    # Startup profiles
    └── Investment.ts # Investment tracking
```

## User Roles

| Role | Capabilities |
|---|---|
| **Investor** | Browse startups, make investments, view portfolio |
| **Entrepreneur** | Create & manage startup profiles, view funding progress |
| **Admin** | Platform management, approve startups, manage users |

*Note: Users can have multiple roles (both Investor and Entrepreneur)*

## Design System

### Color Palette
- **Primary**: Indigo (#6366f1) to Pink (#ec4899) gradient
- **Success**: Emerald (#10b981)
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font**: Space Grotesk (modern geometric sans-serif)
- **Weights**: 300, 400, 500, 600, 700

### Components
- Glassmorphism cards with backdrop blur
- Gradient buttons with hover effects
- Progress bars for funding visualization
- Badge system for categories and status

## API Routes

### Startups
- `GET /api/startups` - List all approved startups
- `GET /api/startups/[id]` - Get startup details
- `POST /api/startups` - Create new startup (auth required)
- `PATCH /api/startups/[id]` - Update startup (owner/admin only)
- `POST /api/startups/[id]/approve` - Approve startup (admin only)

### Investments
- `GET /api/investments` - List user investments
- `POST /api/investments` - Create new investment
- `GET /api/startups/[id]/investments` - Get startup investments

### Authentication
- `POST /api/auth/register` - User registration
- NextAuth routes at `/api/auth/*`

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

## Development Roadmap

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed development phases.

### Current Status
✅ Phase 1: Planning & Documentation
✅ Phase 2: Database Models
✅ Phase 3: Core UI Components (Hero, Startup Cards, Navigation)
🚧 Phase 4: API Routes & Backend Logic
🚧 Phase 5: User Dashboards
⏳ Phase 6: Admin Panel
⏳ Phase 7: Testing & Refinement

## Features Documentation

Detailed feature specifications are available in `/docs/features/`:
- [Startup Profiles](./docs/features/01-startup-profiles.md)
- [Investment System](./docs/features/02-investment-system.md)
- [User Roles & Auth](./docs/features/03-user-roles-auth.md)
- [UI Theme & Design](./docs/features/04-ui-theme-design.md)

## Contributing

This is a private project. For authorized contributors:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private - All rights reserved

## Support

For questions or issues, contact the development team.