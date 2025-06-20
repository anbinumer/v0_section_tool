# ACU Section Manager - Comprehensive Style Guide

## 1. Brand Identity & Color Palette

### Primary Colors

```css
:root {
  --acu-purple: #663399;
  --acu-purple-dark: #4a1a5c;
  --acu-purple-light: #8b5fbf;
}
```

### Extended Color System

```css
/* Purple Scale */
--purple-50: #f3f0ff;
--purple-100: #e9e2ff;
--purple-200: #d6ccff;
--purple-300: #b8a6ff;
--purple-400: #9575ff;
--purple-500: #7c3aed;
--purple-600: #663399; /* Primary ACU Purple */
--purple-700: #4a1a5c;
--purple-800: #3d1a78;
--purple-900: #2d1b69;

/* Semantic Colors */
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-500: #22c55e;
--success-600: #16a34a;
--success-700: #15803d;

--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;
--warning-600: #d97706;
--warning-700: #b45309;

--error-50: #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;
--error-600: #dc2626;
--error-700: #b91c1c;

--info-50: #eff6ff;
--info-100: #dbeafe;
--info-500: #3b82f6;
--info-600: #2563eb;
--info-700: #1d4ed8;

/* Neutral Scale */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

## 2. Typography System

### Font Stack

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

### Type Scale

```css
/* Headings */
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }

/* Font Weights */
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

### Typography Usage

- **Page Titles**: `text-2xl font-semibold text-gray-900`
- **Card Titles**: `text-xl font-semibold text-gray-900`
- **Section Headers**: `text-lg font-semibold text-gray-900`
- **Body Text**: `text-sm text-gray-600`
- **Labels**: `text-sm font-medium text-gray-700`
- **Captions**: `text-xs text-gray-500`


## 3. Layout & Spacing System

### Container Widths

```css
.max-w-7xl { max-width: 80rem; } /* Main content container */
.max-w-2xl { max-width: 42rem; } /* Modal/form containers */
.max-w-md { max-width: 28rem; } /* Small modals */
```

### Spacing Scale (Tailwind)

```css
/* Padding/Margin Scale */
p-1: 0.25rem    p-2: 0.5rem     p-3: 0.75rem    p-4: 1rem
p-5: 1.25rem    p-6: 1.5rem     p-8: 2rem       p-12: 3rem
p-16: 4rem      p-20: 5rem      p-24: 6rem      p-32: 8rem

/* Gap Scale */
gap-1: 0.25rem  gap-2: 0.5rem   gap-3: 0.75rem  gap-4: 1rem
gap-6: 1.5rem   gap-8: 2rem     gap-12: 3rem    gap-16: 4rem
```

### Grid System

```css
/* Common Grid Patterns */
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Responsive Breakpoints */
md:grid-cols-2  /* 768px+ */
lg:grid-cols-3  /* 1024px+ */
xl:grid-cols-4  /* 1280px+ */
```

## 4. Component Design System

### Card Components

```css
/* Base Card */
.card-base {
  @apply rounded-lg border bg-white shadow-sm;
}

/* Card Variants */
.card-elevated {
  @apply rounded-lg border bg-white shadow-md hover:shadow-lg transition-shadow;
}

.card-interactive {
  @apply rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer;
}

/* Card Sections */
.card-header {
  @apply flex flex-col space-y-1.5 p-6;
}

.card-content {
  @apply p-6 pt-0;
}

.card-title {
  @apply text-2xl font-semibold leading-none tracking-tight;
}

.card-description {
  @apply text-sm text-gray-600;
}
```

### Button System

```css
/* Primary Button */
.btn-primary {
  @apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
         bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 py-2 
         ring-offset-background transition-colors focus-visible:outline-none 
         focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 
         disabled:pointer-events-none disabled:opacity-50;
}

/* Secondary Button */
.btn-secondary {
  @apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
         border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-10 px-4 py-2 
         ring-offset-background transition-colors focus-visible:outline-none 
         focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 
         disabled:pointer-events-none disabled:opacity-50;
}

/* Success Button */
.btn-success {
  @apply inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
         bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 
         ring-offset-background transition-colors focus-visible:outline-none 
         focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 
         disabled:pointer-events-none disabled:opacity-50;
}

/* Button Sizes */
.btn-sm { @apply h-9 rounded-md px-3; }
.btn-lg { @apply h-11 rounded-md px-8; }
```

### Badge System

```css
/* Base Badge */
.badge-base {
  @apply inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold 
         transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2;
}

/* Badge Variants */
.badge-default {
  @apply badge-base border-transparent bg-purple-600 text-white;
}

.badge-secondary {
  @apply badge-base border-transparent bg-gray-100 text-gray-800;
}

.badge-success {
  @apply badge-base border-transparent bg-green-100 text-green-800;
}

.badge-warning {
  @apply badge-base border-transparent bg-yellow-100 text-yellow-800;
}

.badge-error {
  @apply badge-base border-transparent bg-red-100 text-red-800;
}

.badge-outline {
  @apply badge-base text-gray-700 border-gray-300;
}
```

### Alert System

```css
/* Base Alert */
.alert-base {
  @apply relative w-full rounded-lg border p-4;
}

/* Alert Variants */
.alert-info {
  @apply alert-base border-blue-200 bg-blue-50 text-blue-800;
}

.alert-success {
  @apply alert-base border-green-200 bg-green-50 text-green-800;
}

.alert-warning {
  @apply alert-base border-yellow-200 bg-yellow-50 text-yellow-800;
}

.alert-error {
  @apply alert-base border-red-200 bg-red-50 text-red-800;
}

/* Alert with Icon */
.alert-with-icon {
  @apply alert-base [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4;
}
```

### Form Elements

```css
/* Input Fields */
.input-base {
  @apply flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
         ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium 
         placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 
         focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
}

/* Labels */
.label-base {
  @apply text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70;
}

/* Textarea */
.textarea-base {
  @apply flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
         ring-offset-background placeholder:text-gray-400 focus-visible:outline-none 
         focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 
         disabled:cursor-not-allowed disabled:opacity-50;
}
```

## 5. Icon System

### Icon Library: Lucide React

```javascriptreact
// Common Icons Used
import { Users, UserPlus, Settings, Target, CheckCircle, AlertTriangle, Clock, Shield, FileText, BarChart3, Zap, Play, Shuffle, GripVertical, Eye, EyeOff, Edit, Trash2, Plus, X, Info, Bug, Download, Upload, Search, Filter, Calendar, Globe, Key, TestTube, TrendingUp, Activity, Loader2 } from 'lucide-react'
```

### Icon Usage Guidelines

```javascriptreact
// Icon Sizes
<Icon className="w-4 h-4" />  // Small (16px) - inline with text
<Icon className="w-5 h-5" />  // Medium (20px) - buttons, cards
<Icon className="w-6 h-6" />  // Large (24px) - headers
<Icon className="w-8 h-8" />  // XL (32px) - empty states
<Icon className="w-12 h-12" /> // XXL (48px) - major empty states

// Icon Colors
<Icon className="w-5 h-5 text-purple-600" />  // Primary
<Icon className="w-5 h-5 text-gray-600" />    // Secondary
<Icon className="w-5 h-5 text-green-600" />   // Success
<Icon className="w-5 h-5 text-yellow-600" />  // Warning
<Icon className="w-5 h-5 text-red-600" />     // Error
<Icon className="w-5 h-5 text-blue-600" />    // Info
```

## 6. Status & State Indicators

### Ratio Status Colors

```css
/* Student:Facilitator Ratio Indicators */
.ratio-ideal {
  @apply bg-green-100 text-green-800 border-green-200;
}

.ratio-acceptable {
  @apply bg-yellow-100 text-yellow-800 border-yellow-200;
}

.ratio-warning {
  @apply bg-red-100 text-red-800 border-red-200;
}
```

### Progress Indicators

```css
/* Progress Bar */
.progress-base {
  @apply relative h-4 w-full overflow-hidden rounded-full bg-gray-200;
}

.progress-indicator {
  @apply h-full w-full flex-1 bg-purple-600 transition-all;
}

/* Loading States */
.loading-spinner {
  @apply animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600;
}
```

### Section Status

```css
/* Section Creation Status */
.section-tool-created {
  @apply border-purple-200 bg-purple-50;
}

.section-canvas-original {
  @apply border-blue-200 bg-blue-50;
}

.section-readonly {
  @apply border-gray-200 bg-gray-50;
}
```

## 7. Layout Patterns

### Header Layout

```javascriptreact
<div className="bg-white border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo and title */}
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-purple-700 rounded flex items-center justify-center">
          <Users className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Section Management Tool</h1>
          <p className="text-sm text-gray-500">Course Name (ID: 12345)</p>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center space-x-3">
        <Badge className="bg-purple-100 text-purple-800">
          <Clock className="w-3 h-3 mr-1" />
          14 days to census
        </Badge>
        <Button className="bg-purple-700 hover:bg-purple-800">
          Sync with Canvas
        </Button>
      </div>
    </div>
  </div>
</div>
```

### Main Content Layout

```javascriptreact
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Alert Section */}
  <Alert className="mb-6 border-amber-200 bg-amber-50">
    <AlertTriangle className="h-4 w-4 text-amber-600" />
    <AlertDescription className="text-amber-800">
      Important notification content
    </AlertDescription>
  </Alert>

  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {/* Stat cards */}
  </div>

  {/* Main Interface */}
  <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
    {/* Tab content */}
  </Tabs>
</div>
```

### Card Grid Layout

```javascriptreact
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card className="hover:shadow-md transition-shadow cursor-pointer">
    <CardContent className="p-6">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Zap className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold">Action Title</h3>
          <p className="text-sm text-muted-foreground">Description text</p>
        </div>
      </div>
      <Button className="w-full mt-4 bg-green-600 hover:bg-green-700">
        Action Button
      </Button>
    </CardContent>
  </Card>
</div>
```

## 8. Responsive Design

### Breakpoint System

```css
/* Tailwind Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Responsive Patterns

```javascriptreact
// Grid responsiveness
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

// Text responsiveness
<h1 className="text-lg md:text-xl lg:text-2xl font-semibold">

// Spacing responsiveness
<div className="px-4 sm:px-6 lg:px-8">

// Flex direction responsiveness
<div className="flex flex-col sm:flex-row gap-4">
```

## 9. Animation & Transitions

### Transition Classes

```css
/* Hover Transitions */
.transition-shadow { transition: box-shadow 0.15s ease-in-out; }
.transition-colors { transition: color, background-color, border-color 0.15s ease-in-out; }
.transition-all { transition: all 0.15s ease-in-out; }

/* Loading Animation */
.animate-spin { animation: spin 1s linear infinite; }

/* Hover Effects */
.hover\:shadow-md:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.hover\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
```

## 10. Accessibility Guidelines

### Focus States

```css
/* Focus Ring */
.focus-visible\:outline-none:focus-visible { outline: 2px solid transparent; }
.focus-visible\:ring-2:focus-visible { box-shadow: 0 0 0 2px var(--purple-500); }
.focus-visible\:ring-offset-2:focus-visible { box-shadow: 0 0 0 2px white, 0 0 0 4px var(--purple-500); }
```

### ARIA Labels

```javascriptreact
// Screen reader text
<span className="sr-only">Screen reader only text</span>

// ARIA attributes
<button aria-pressed={isActive} aria-label="Toggle section visibility">
<div role="alert" aria-live="polite">Status message</div>
<input aria-describedby="help-text" />
```

### Color Contrast

- All text meets WCAG AA standards (4.5:1 ratio minimum)
- Interactive elements have sufficient contrast
- Focus indicators are clearly visible


## 11. Dark Mode Support (Future)

### CSS Variables Setup

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 3.9%;
  --primary: 263 70% 50%;
  --primary-foreground: 0 0% 98%;
}

.dark {
  --background: 0 0% 3.9%;
  --foreground: 0 0% 98%;
  --card: 0 0% 3.9%;
  --card-foreground: 0 0% 98%;
  --primary: 263 70% 50%;
  --primary-foreground: 0 0% 9%;
}
```

## 12. Implementation Notes

### CSS Framework

- **Primary**: Tailwind CSS for utility-first styling
- **Components**: shadcn/ui for consistent component library
- **Icons**: Lucide React for consistent iconography


### File Structure

```plaintext
styles/
├── globals.css          # Global styles and CSS variables
├── components.css       # Component-specific styles
└── utilities.css        # Custom utility classes

components/
├── ui/                  # Base UI components (shadcn/ui)
├── layout/              # Layout components
└── features/            # Feature-specific components
```

### Best Practices

1. **Consistency**: Use design tokens and predefined classes
2. **Accessibility**: Always include proper ARIA labels and focus states
3. **Responsiveness**: Mobile-first approach with progressive enhancement
4. **Performance**: Minimize custom CSS, leverage Tailwind's purging
5. **Maintainability**: Use semantic class names and component composition


This style guide ensures visual consistency across the entire ACU Section Manager application while maintaining accessibility, responsiveness, and brand alignment.