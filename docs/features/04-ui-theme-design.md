# Feature: UI/UX Theme & Design System

## Overview
Create an attractive, modern, and professional design system that builds trust and excitement around startup funding.

## Design Philosophy
- **Modern & Clean**: Minimalist interface with purpose
- **Professional**: Builds credibility for financial transactions
- **Exciting**: Inspires innovation and entrepreneurship
- **Trustworthy**: Clear, transparent, secure feeling

## Color Palette

### Primary Colors
```css
--primary-600: #6366f1; /* Indigo - main brand color */
--primary-500: #818cf8;
--primary-400: #a5b4fc;

--accent-600: #ec4899; /* Pink - highlights, CTAs */
--accent-500: #f472b6;
--accent-400: #f9a8d4;

--success-600: #10b981; /* Green - funding progress */
--success-500: #34d399;
--success-400: #6ee7b7;
```

### Neutral Colors
```css
--gray-900: #111827; /* Dark mode background */
--gray-800: #1f2937;
--gray-700: #374151;
--gray-600: #4b5563;
--gray-500: #6b7280;
--gray-400: #9ca3af;
--gray-300: #d1d5db;
--gray-200: #e5e7eb;
--gray-100: #f3f4f6;
--gray-50: #f9fafb; /* Light mode background */
```

### Gradient Definitions
```css
--gradient-primary: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
--gradient-success: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
--gradient-dark: linear-gradient(135deg, #1f2937 0%, #111827 100%);
```

## Typography

### Font Family
- **Primary**: 'Space Grotesk' - Modern geometric sans-serif
- **Fallback**: system-ui, sans-serif

### Font Sizes & Weights
```css
/* Headings */
--text-5xl: 3rem;    /* 48px - Hero titles */
--text-4xl: 2.25rem; /* 36px - Section titles */
--text-3xl: 1.875rem; /* 30px - Card titles */
--text-2xl: 1.5rem;  /* 24px - Subsections */
--text-xl: 1.25rem;  /* 20px - Large text */

/* Body */
--text-lg: 1.125rem; /* 18px - Lead paragraphs */
--text-base: 1rem;   /* 16px - Body text */
--text-sm: 0.875rem; /* 14px - Captions */
--text-xs: 0.75rem;  /* 12px - Labels */

/* Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## UI Components

### Glassmorphism Cards
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
```

### Buttons
```css
.btn-primary {
  background: var(--gradient-primary);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: transparent;
  border: 2px solid var(--primary-600);
  color: var(--primary-600);
  padding: 10px 22px;
  border-radius: 8px;
}
```

### Input Fields
```css
.input-field {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  transition: all 0.3s;
}

.input-field:focus {
  border-color: var(--primary-600);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

## Layout Patterns

### Section Spacing
```css
.section-padding {
  padding: 80px 0;
}

@media (max-width: 768px) {
  .section-padding {
    padding: 48px 0;
  }
}
```

### Container Widths
```css
.container-narrow {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.container-wide {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}
```

## Animation & Effects

### Hover Effects
- Subtle lift on cards (translateY(-4px))
- Glow effect on primary buttons
- Smooth color transitions (0.3s ease)

### Loading States
- Skeleton screens for content loading
- Progress bars with gradient fills
- Spinner with brand colors

### Page Transitions
- Fade in for page loads
- Slide up for modals
- Expand for dropdowns

## Icons
- **Library**: Lucide React
- **Style**: Rounded, consistent stroke width
- **Usage**: 
  - 24px for navigation
  - 20px for inline elements
  - 48px for feature highlights

## Responsive Breakpoints
```css
--mobile: 640px;
--tablet: 768px;
--desktop: 1024px;
--wide: 1280px;
```

## Dark Mode
- Default: System preference
- Toggle available in navbar
- Smooth transitions between modes
- Adjusted opacity for better contrast

## Accessibility
- WCAG 2.1 AA compliance
- Focus states on all interactive elements
- Sufficient color contrast ratios
- Screen reader friendly labels
- Keyboard navigation support

## Component Library Priority
1. **Hero Section** - First impression
2. **Startup Card** - Core UI element
3. **Investment Modal** - Critical user action
4. **Navigation** - Site navigation
5. **Dashboard Widgets** - User data visualization
6. **Forms** - Data input
7. **Badges & Tags** - Visual indicators
8. **Progress Bars** - Funding visualization

## Inspiration References
- **Modern SaaS**: Linear, Vercel
- **Fintech**: Stripe, Mercury
- **Funding platforms**: Product Hunt, AngelList

## Implementation Notes
- Use Tailwind CSS utility classes
- Create custom components for repeated patterns
- Maintain consistent spacing (8px grid)
- Test on multiple devices and browsers
- Optimize for performance (lazy load images, etc.)
