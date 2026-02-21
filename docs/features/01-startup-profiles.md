# Feature: Startup Profiles

## Overview
Allow entrepreneurs to create comprehensive profiles for their startups, including company information, pitch, team details, and funding goals.

## User Stories
- As an entrepreneur, I want to create a startup profile so that investors can discover my venture
- As an entrepreneur, I want to edit my startup information to keep it current
- As an investor, I want to view detailed startup profiles to make informed investment decisions
- As an admin, I want to review and approve startup submissions before they go live

## Functional Requirements

### Data Fields
- **Basic Info**
  - Company name (EN/FA)
  - Tagline/one-liner (EN/FA)
  - Logo/image upload
  - Industry/category
  - Location
  - Founded date
  - Website URL
  - Social media links

- **Pitch**
  - Problem statement (EN/FA)
  - Solution description (EN/FA)
  - Value proposition (EN/FA)
  - Market size/opportunity
  - Business model
  - Competitive advantages

- **Team**
  - Founder(s) information
  - Team size
  - Key team members

- **Funding**
  - Funding goal (amount)
  - Current funding raised
  - Funding stage (Seed, Series A, etc.)
  - Use of funds breakdown
  - Minimum investment amount

- **Documents** (Optional)
  - Pitch deck upload
  - Business plan
  - Financial projections

### User Actions
1. **Create Startup**
   - Multi-step form
   - Draft saving capability
   - Submit for review

2. **Edit Startup**
   - Only by owner or admin
   - Version history tracking

3. **View Startup**
   - Public profile page
   - Investment button/CTA
   - Share functionality

4. **Admin Review**
   - Approve/reject submissions
   - Request changes/more info
   - Moderation notes

## Technical Specifications

### API Endpoints
- `POST /api/startups` - Create new startup
- `GET /api/startups` - List startups (with filters)
- `GET /api/startups/[id]` - Get single startup
- `PATCH /api/startups/[id]` - Update startup
- `DELETE /api/startups/[id]` - Delete startup (admin only)
- `POST /api/startups/[id]/approve` - Approve startup (admin)
- `POST /api/startups/[id]/reject` - Reject startup (admin)

### Database Schema
```typescript
{
  _id: ObjectId,
  owner: ObjectId, // User reference
  status: 'draft' | 'pending' | 'approved' | 'rejected',
  basicInfo: {
    name: { en: string, fa: string },
    tagline: { en: string, fa: string },
    logo: string, // URL
    industry: string,
    location: string,
    foundedDate: Date,
    website: string,
    socialLinks: {
      linkedin: string,
      twitter: string,
      instagram: string
    }
  },
  pitch: {
    problem: { en: string, fa: string },
    solution: { en: string, fa: string },
    valueProposition: { en: string, fa: string },
    marketSize: string,
    businessModel: { en: string, fa: string },
    advantages: { en: string[], fa: string[] }
  },
  team: {
    founders: [{
      name: string,
      role: string,
      bio: string,
      image: string
    }],
    teamSize: number,
    keyMembers: []
  },
  funding: {
    goal: number,
    raised: number,
    stage: string,
    useOfFunds: { en: string, fa: string },
    minimumInvestment: number
  },
  documents: {
    pitchDeck: string,
    businessPlan: string,
    financials: string
  },
  metrics: {
    viewCount: number,
    investorInterest: number
  },
  createdAt: Date,
  updatedAt: Date,
  approvedAt: Date,
  approvedBy: ObjectId
}
```

## UI/UX Design

### Startup Card (List View)
- Logo + Company name
- Tagline
- Industry tag
- Location
- Funding progress bar
- Investment amount range
- "View Details" button

### Startup Detail Page
- Hero section with logo, name, tagline
- Tabs: Overview | Team | Funding | Documents
- Investment CTA button (sticky)
- Share buttons
- Bookmark/save feature

### Create/Edit Form
- Step 1: Basic Information
- Step 2: Your Pitch
- Step 3: Team Details
- Step 4: Funding Details
- Step 5: Documents (Optional)
- Step 6: Review & Submit

## Validation Rules
- Required fields: name, tagline, problem, solution, funding goal
- Logo: max 2MB, formats: jpg, png, webp
- Funding goal: minimum $1,000, maximum $10,000,000
- URLs must be valid format
- Bilingual content required for key fields

## Success Metrics
- Number of startups submitted per week
- Approval rate
- Average time to approval
- Investor engagement per startup
- Conversion rate (views to investments)
