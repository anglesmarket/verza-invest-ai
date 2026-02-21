# Feature: User Roles & Authentication

## Overview
Multi-role authentication system supporting Entrepreneurs, Investors, and Admins with appropriate permissions.

## User Stories
- As a new user, I want to register as either an entrepreneur or investor
- As a user, I want to switch between investor and entrepreneur modes
- As an admin, I want to manage user roles and permissions
- As a user, I want to update my profile and preferences

## User Roles

### Entrepreneur
**Capabilities:**
- Create and manage startup profiles
- View investment activity on their startups
- Respond to investor inquiries
- Access entrepreneur dashboard

**Profile Fields:**
- Bio/background
- LinkedIn profile
- Previous ventures/experience
- Areas of expertise

### Investor
**Capabilities:**
- Browse and search startups
- Make investment commitments
- View investment portfolio
- Save/bookmark startups
- Access investor dashboard

**Profile Fields:**
- Investment preferences (industries, stages)
- Investment range
- Bio/background
- LinkedIn profile
- Accredited investor status (optional)

### Admin
**Capabilities:**
- All investor and entrepreneur capabilities
- Approve/reject startup submissions
- Manage user accounts
- View platform analytics
- Moderate content
- Configure platform settings

## Technical Specifications

### User Model Extension
```typescript
{
  _id: ObjectId,
  email: string,
  password: string, // hashed
  name: string,
  image: string,
  roles: ['investor', 'entrepreneur', 'admin'],
  
  // Entrepreneur specific
  entrepreneurProfile: {
    bio: { en: string, fa: string },
    linkedin: string,
    experience: { en: string, fa: string },
    expertise: string[]
  },
  
  // Investor specific
  investorProfile: {
    bio: { en: string, fa: string },
    linkedin: string,
    preferences: {
      industries: string[],
      stages: string[],
      minInvestment: number,
      maxInvestment: number
    },
    accreditedInvestor: boolean
  },
  
  verified: boolean,
  status: 'active' | 'suspended' | 'deleted',
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

### API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - NextAuth login
- `GET /api/users/profile` - Get current user
- `PATCH /api/users/profile` - Update profile
- `POST /api/users/role` - Add role to user
- `DELETE /api/users/role` - Remove role
- `GET /api/admin/users` - List all users (admin)
- `PATCH /api/admin/users/[id]` - Update user (admin)

## UI/UX Design

### Registration Flow
1. **Step 1: Basic Info**
   - Email, Password, Name
   - Profile photo (optional)

2. **Step 2: Choose Role**
   - "I want to fund startups" (Investor)
   - "I want to raise funding" (Entrepreneur)
   - Can select both

3. **Step 3: Profile Details**
   - Role-specific fields
   - Skip option for later completion

### Profile Page
- Tabs: Overview | Settings | Security
- Role badges displayed
- Edit mode for profile fields
- Language preference toggle

### Admin Dashboard
- User management table
  - Filter by role, status
  - Search by name, email
  - Bulk actions
- Platform statistics
- Recent activity log
- Pending startup approvals

## Authorization Middleware
```typescript
// Protect routes by role
export const requireRole = (roles: string[]) => {
  return (req, res, next) => {
    const user = req.session.user;
    if (!user || !roles.some(role => user.roles.includes(role))) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    next();
  };
};
```

## Validation Rules
- Email must be unique
- Password minimum 8 characters
- At least one role required
- LinkedIn URL validation (if provided)
- Profile completion encouraged (not enforced)

## Security Considerations
- Password hashing with bcrypt
- Session-based authentication (NextAuth)
- CSRF protection
- Rate limiting on auth endpoints
- Email verification (optional future feature)
- 2FA support (future enhancement)

## Success Metrics
- User registration rate
- Role distribution
- Profile completion rate
- Active users (daily/weekly/monthly)
- User retention rate
