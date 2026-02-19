# Tango Antwerp - Technical Specification

## Component Inventory

### shadcn/ui Components
- Button (for navigation buttons)

### Third-party Components
- None required

### Custom Components
1. **Navigation** - Fixed header with logo and nav buttons
2. **HeroSection** - Animated ice glass/logo with scroll trigger
3. **ContentSection** - Reusable text section with fade-in animation
4. **IceAnimation** - GSAP-powered scroll animation component

---

## Animation Implementation Table

| Animation | Library | Implementation Approach | Complexity |
|-----------|---------|------------------------|------------|
| Nav button hover | CSS | transition on background and color | Low |
| Page load fade-in | CSS/Framer Motion | opacity animation on mount | Low |
| Ice glass morph | GSAP ScrollTrigger | Pinned scroll with morphing SVG/images | High |
| Ice cube rotation | GSAP | Continuous rotation animation | Medium |
| Text reveal on scroll | GSAP ScrollTrigger | Fade in + translateY | Medium |
| Smooth scroll | CSS | scroll-behavior: smooth | Low |

---

## Animation Library Choices

### Primary: GSAP + ScrollTrigger
**Rationale:**
- Best-in-class scroll-triggered animations
- Pinned scroll sections (essential for hero animation)
- Smooth morphing capabilities
- Excellent performance

### Secondary: CSS Transitions
**Rationale:**
- Simple hover states
- No JavaScript overhead for basic interactions

### Optional: Framer Motion
**Rationale:**
- React component animations
- Page transitions if needed

---

## Project File Structure

```
app/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx      # Fixed header navigation
│   │   ├── HeroSection.tsx     # Hero with ice animation
│   │   ├── ContentSection.tsx  # Reusable content section
│   │   └── IceAnimation.tsx    # GSAP scroll animation
│   ├── pages/
│   │   ├── Bar.tsx             # Bar page (main)
│   │   └── Restaurant.tsx      # Restaurant page
│   ├── hooks/
│   │   └── useScrollAnimation.ts  # Custom scroll hook
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── public/
│   ├── images/
│   │   ├── ice-glass.png       # Hero ice glass image
│   │   └── ice-logo.png        # Ice logo image
│   └── fonts/                  # Custom fonts if needed
├── index.html
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Dependencies

### Core
- react
- react-dom
- react-router-dom

### Animation
- gsap
- @gsap/react

### UI
- @radix-ui/react-slot (for shadcn)
- class-variance-authority
- clsx
- tailwind-merge
- lucide-react

### Build
- vite
- typescript
- tailwindcss

---

## Implementation Notes

### Hero Animation Strategy
1. Use GSAP ScrollTrigger with `pin: true`
2. Create timeline with multiple phases:
   - Phase 1: Glass fades out, ice logo fades in
   - Phase 2: Ice logo rotates continuously
   - Phase 3: Logo scales down, text content reveals
3. Use scrub for smooth scroll-linked animation

### Navigation Strategy
1. Fixed position with z-index: 100
2. Use React Router for page navigation
3. Active state based on current route

### Responsive Strategy
1. Mobile: Hamburger menu
2. Tablet/Desktop: Full navigation
3. Use Tailwind breakpoints

---

## Performance Considerations

1. Use `will-change: transform` on animated elements
2. Lazy load images
3. Use CSS transforms instead of layout properties
4. Debounce scroll handlers if needed
5. Use `prefers-reduced-motion` media query
