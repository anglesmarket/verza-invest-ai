# Feature: Investment System

## Overview
Enable investors to browse startups, express interest, and make investment commitments through the platform.

## User Stories
- As an investor, I want to invest in startups that align with my interests
- As an investor, I want to track my investment portfolio
- As an entrepreneur, I want to see who has invested in my startup
- As an admin, I want to monitor all investment activity

## Functional Requirements

### Investment Flow
1. **Browse Startups**
   - Filter by industry, funding stage, location
   - Sort by trending, newest, funding progress
   - Save/bookmark startups

2. **Express Interest**
   - Investor clicks "Invest" on startup profile
   - Enters investment amount
   - Reviews investment summary
   - Confirms investment

3. **Investment Tracking**
   - Startup funding progress updates
   - Investor receives confirmation
   - Entrepreneur receives notification

### Data Fields
- Investor ID
- Startup ID
- Investment amount
- Investment date
- Status (pending, confirmed, cancelled)
- Payment method (future: integrate payment gateway)
- Notes/message to entrepreneur

## Technical Specifications

### API Endpoints
- `POST /api/investments` - Create investment
- `GET /api/investments` - List investments (filtered by user)
- `GET /api/investments/[id]` - Get investment details
- `PATCH /api/investments/[id]` - Update investment status
- `DELETE /api/investments/[id]` - Cancel investment (within 24h)
- `GET /api/startups/[id]/investments` - Get all investments for a startup

### Database Schema
```typescript
{
  _id: ObjectId,
  investor: ObjectId, // User reference
  startup: ObjectId, // Startup reference
  amount: number,
  status: 'pending' | 'confirmed' | 'cancelled',
  paymentMethod: string, // future use
  message: string,
  createdAt: Date,
  updatedAt: Date,
  confirmedAt: Date
}
```

## UI/UX Design

### Investment Modal
- Startup summary (logo, name, current funding)
- Investment amount input
- Minimum/maximum validation
- Terms & conditions checkbox
- "Confirm Investment" button
- Secure/verified badges

### Investor Dashboard
- Portfolio overview
  - Total invested
  - Number of startups
  - Recent activity
- Investment list
  - Startup name & logo
  - Investment amount
  - Investment date
  - Status badge
- Filters: All | Active | Pending

### Entrepreneur View (Startup Dashboard)
- Total raised / Goal
- Number of investors
- Recent investments list
- Investor distribution chart
- Download investor list (CSV)

## Validation Rules
- Investment amount >= startup minimum investment
- Investment amount <= remaining funding needed
- User must be verified investor
- Cannot invest in own startup
- Maximum 10 investments per user per day (prevent spam)

## Security Considerations
- User authentication required
- Role-based access (investor role)
- Investment confirmation email
- Audit trail for all transactions
- Rate limiting on API endpoints

## Future Enhancements
- Payment gateway integration (Stripe, PayPal)
- Equity/reward tiers
- Investor messaging system
- Investment agreements/contracts
- Refund handling
- Secondary market (sell investments)

## Success Metrics
- Total investment volume
- Average investment amount
- Investor retention rate
- Startups successfully funded
- Time to funding goal
