# Plan: Polish Header Partner Logos Strip

## Goals
1. Vertical Alignment & Centering
   - Center partner logo container horizontally below navigation
   - Adjust vertical padding to sit between navbar and hero badge
   
2. Responsive Spacing & Scaling
   - Consistent spacing gap: 16px-24px
   - Add max-height/responsive scaling for mobile to prevent awkward wrapping/overlap

## Current state
In index.html and qa.html:
```html
<div class="partner-logos-container flex flex-wrap items-center justify-center gap-4 py-2 border-t border-sage/60">
  <img src="image/CIMMYT.png" alt="CIMMYT" class="h-6 md:h-7 w-auto object-contain">
  ...
</div>
```

## Changes
- Update gap to gap-4 md:gap-6 (16px to 24px)
- Adjust padding to py-3 md:py-4 for better vertical spacing
- Update heights: h-5 sm:h-6 md:h-7 for better mobile scaling
- Consider max-w-full and overflow handling if needed
- Apply to both index.html and qa.html
