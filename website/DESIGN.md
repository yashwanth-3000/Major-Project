# Design System Documentation

## Color Palette

### Primary Colors
- **Primary (Teal)**: `hsl(180, 70%, 42%)` - Main brand color for buttons and highlights
- **Medical (Emerald)**: `hsl(160, 70%, 50%)` - Success states and medical indicators
- **Warning (Amber)**: `hsl(38, 92%, 55%)` - Attention and important information

### Background Colors
- **Background**: `hsl(200, 30%, 6%)` - Deep blue-tinted dark background
- **Muted**: `hsl(198, 25%, 12%)` - Subtle background for cards and sections
- **Border**: `hsl(198, 25%, 15%)` - Subtle borders for depth

### Text Colors
- **Foreground**: `hsl(180, 20%, 96%)` - Primary text color
- **Muted Foreground**: `hsl(198, 15%, 60%)` - Secondary text color

## Typography

### Heading Font: Crimson Pro
- **Weight**: 400, 600, 700
- **Usage**: All headings (h1-h6), large display text
- **Character**: Elegant serif that adds sophistication and credibility

### Body Font: IBM Plex Sans
- **Weight**: 300, 400, 500, 600
- **Usage**: Body text, UI elements, descriptions
- **Character**: Technical, clean, and highly readable

## Component Patterns

### Cards
```tsx
className="rounded-2xl border border-primary/20 bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm hover:border-primary/40 transition-all duration-300"
```

### Buttons
- **Primary**: Gradient border with primary background
- **Outline**: Border with hover state
- **Ghost**: Transparent with hover background

### Animations

#### Float Effect
```css
animation: float 6s ease-in-out infinite
```
Used for: Feature cards, floating elements

#### Glow Effect
```css
animation: glow 2s ease-in-out infinite alternate
```
Used for: Statistics, important numbers

#### Fade In + Slide
```css
animate-in fade-in slide-in-from-bottom-4 duration-500
```
Used for: Chat messages, content reveals

## Layout Principles

1. **Maximum Width**: 7xl (1280px) for content sections
2. **Spacing**: Generous padding (24-32px on mobile, 48-64px on desktop)
3. **Borders**: Subtle, low-opacity borders for depth
4. **Backdrop Blur**: Used on overlays and cards for glassmorphism effect
5. **Gradients**: Subtle radial gradients for background depth

## Page-Specific Design

### Home Page
- **Hero**: Large typography with gradient text
- **Features**: Floating cards with hover effects
- **Results**: Two-column layout with badges and CTAs
- **Achievement Cards**: Gradient backgrounds with glow animations

### Chat Interface
- **Message Bubbles**: Rounded corners, subtle shadows
- **Avatar**: Icon-based with gradient backgrounds
- **Input**: Large, accessible with quick actions
- **Status Indicators**: Pulsing dot for AI activity

## Accessibility

- High contrast ratios (WCAG AA compliant)
- Clear focus states on interactive elements
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly

## Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px
- **Wide**: > 1280px

## Animation Guidelines

- **Duration**: 300-500ms for UI interactions
- **Easing**: cubic-bezier for smooth transitions
- **Stagger**: 50-100ms delay between sequential items
- **Reduced Motion**: Respect user preferences

## Best Practices

1. Use semantic HTML elements
2. Maintain consistent spacing rhythm
3. Layer effects for depth (borders, shadows, blurs)
4. Animate meaningfully (not just for decoration)
5. Test in dark mode (default theme)
6. Ensure touch targets are at least 44x44px
7. Use icons from Lucide React library consistently
8. Keep text readable with proper line height and letter spacing

