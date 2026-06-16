---
name: Lumina Creative
colors:
  surface: '#0f1419'
  surface-dim: '#0f1419'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0f14'
  surface-container-low: '#181c21'
  surface-container: '#1c2026'
  surface-container-high: '#262a30'
  surface-container-highest: '#31353b'
  on-surface: '#dfe2ea'
  on-surface-variant: '#cac3d8'
  inverse-surface: '#dfe2ea'
  inverse-on-surface: '#2c3137'
  outline: '#948ea1'
  outline-variant: '#494455'
  surface-tint: '#cdbdff'
  primary: '#cdbdff'
  on-primary: '#370096'
  primary-container: '#7c4dff'
  on-primary-container: '#fcf6ff'
  inverse-primary: '#6833ea'
  secondary: '#8fd8ff'
  on-secondary: '#003548'
  secondary-container: '#00c1fd'
  on-secondary-container: '#004b65'
  tertiary: '#c3c6d1'
  on-tertiary: '#2c3039'
  tertiary-container: '#6e727c'
  on-tertiary-container: '#f8f8ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e8deff'
  primary-fixed-dim: '#cdbdff'
  on-primary-fixed: '#20005f'
  on-primary-fixed-variant: '#4f00d0'
  secondary-fixed: '#c2e8ff'
  secondary-fixed-dim: '#75d1ff'
  on-secondary-fixed: '#001e2b'
  on-secondary-fixed-variant: '#004d67'
  tertiary-fixed: '#dfe2ed'
  tertiary-fixed-dim: '#c3c6d1'
  on-tertiary-fixed: '#181c24'
  on-tertiary-fixed-variant: '#434750'
  background: '#0f1419'
  on-background: '#dfe2ea'
  surface-variant: '#31353b'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-margin: 20px
  gutter: 12px
---

## Brand & Style
The design system focuses on a high-energy, "dark-mode first" aesthetic tailored for generative AI workflows. It targets creators and digital artists who value speed, precision, and visual inspiration. 

The style combines **Modern Corporate** structure with **Glassmorphism** and **High-Contrast** accents. By utilizing deep charcoal surfaces (#0F1115) as a canvas, the vibrant primary purple and electric blue elements appear to emit light, mimicking the "spark" of AI generation. The interface prioritizes a premium, tactile feel that balances professional toolsets with a playful, experimental spirit.

## Colors
The palette is rooted in deep space tones to ensure the AI-generated artwork remains the focal point.
- **Primary (#7C4DFF):** A vibrant purple used for primary actions and brand presence.
- **Secondary (#00C2FF):** An electric blue used for secondary highlights, progress indicators, and active states.
- **Surface Strategy:** Use #181C24 for elevated containers, cards, and bottom sheets to create a clear visual hierarchy against the #0F1115 base.
- **Functional Colors:** Success and Error colors are saturated to remain legible and impactful against dark backgrounds.

## Typography
This design system utilizes **Plus Jakarta Sans** for its modern, friendly, and highly legible geometric characteristics. 
- **Headlines:** Use Bold (700) or SemiBold (600) weights with slight negative letter-spacing to maintain a compact, "pro" look.
- **Body:** Standard reading text uses a 16px base for accessibility on mobile devices.
- **Labels:** Caps and increased letter-spacing are encouraged for small metadata or category tags to ensure they don't get lost in the dark UI.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for mobile-first PWA experiences.
- **Safe Zones:** A standard 20px margin is applied to the left and right of the screen.
- **Rhythm:** An 8px linear scale (with 4px increments for tight components) ensures vertical harmony.
- **Thumb-Zone Optimization:** Critical interactive elements (Prompt bars, Generate buttons, Style switchers) are placed in the bottom 40% of the viewport.
- **Stacking:** Use 12px gutters between cards in a feed and 24px between distinct functional sections.

## Elevation & Depth
Depth is created through a mix of **Tonal Layering** and **Glassmorphism**:
- **Level 0 (Base):** #0F1115 for the main application background.
- **Level 1 (Surface):** #181C24 for cards and navigation bars.
- **Level 2 (Overlay):** Semi-transparent versions of the surface color (80% opacity) with a 20px backdrop blur for modals and floating action menus.
- **Shadows:** Use extremely soft, large-spread shadows with a slight purple tint (`rgba(124, 77, 255, 0.1)`) to suggest objects are glowing rather than casting dark shadows.

## Shapes
The shape language is generous and "squircle" inspired, leaning into a friendly and modern creative tool vibe.
- **Standard Components:** Buttons and Input fields use `rounded-lg` (16px / 1rem).
- **Large Containers:** Content cards and bottom sheets use `rounded-xl` (24px / 1.5rem).
- **Small Elements:** Tooltips and tags use `rounded-md` (8px / 0.5rem).

## Components
- **Buttons:** Primary buttons are high-contrast purple with white text. They should have a minimum height of 56px for "thumb-friendly" accessibility. Use a subtle gradient (Primary to Secondary) for the "Generate" call-to-action.
- **Input Fields:** Use #181C24 backgrounds with a 1px border that glows (Secondary Blue) when focused. 
- **Cards:** Incorporate a subtle 1px inner border (stroke) using `white` at 10% opacity to define edges against the dark background.
- **Chips/Styles:** Style selection chips should use high-saturation thumbnails with the selected state indicated by a 3px Primary Purple border.
- **Bottom Sheets:** These are the primary navigation pattern for AI settings. They must have a visible "handle" at the top and utilize backdrop blurring to maintain context of the art underneath.
- **Progress Bars:** Use a linear gradient from Primary to Secondary to represent AI processing stages.