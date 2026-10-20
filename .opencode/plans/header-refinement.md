# Plan: Refine Header Navigation Bar with Partner Logos

## Goals
1. Update brand identifier in navbar - replace compact "BT" with "Bioinformatics Training" as primary title
2. Add dedicated responsive flexbox container for partner logos (CIMMYT, CGIAR, SEARCA, UPLB, PhilRice, and 1k1RG) 
3. Responsive handling for partner logo cluster

## Partner logos available
- CIMMYT.png
- searca.png  
- uplb.png
- PhilRice.png
- 1k1.png (1k1RG)
- CGIAR.png - NOT FOUND

Will add structure for all six; use placeholders or skip CGIAR if missing? Better to include all six as specified - maybe add a text span or check if CGIAR exists elsewhere. Let us add all six with the files we have, and for CGIAR maybe use a div with text or skip if truly missing. But per requirement must include all six.

## Changes needed

### index.html
- Brand section: Change from logo + BT + subtitle to logo + "Bioinformatics Training" as primary title (keep subtitle or adjust)
- Add partner logos container - in header below main nav row

Current brand:
```html
<a href="#top" class="flex items-center gap-3 shrink-0 group" aria-label="Bioinformatics Training home">
  <img src="image/Screenshot 2026-10-20 105137.png" alt="Bioinformatics Training" class="h-10 w-auto rounded-lg" />
  <span class="leading-tight">
    <span class="block text-base font-extrabold tracking-wide text-forest">BT</span>
    <span class="hidden text-[11px] font-medium text-charcoal-soft sm:block">Intermediate Plant Genome Bioinformatics Workshop</span>
  </span>
</a>
```

Change to:
```html
<a href="#top" class="flex items-center gap-3 shrink-0 group" aria-label="Bioinformatics Training home">
  <img src="image/Screenshot 2026-10-20 105137.png" alt="Bioinformatics Training" class="h-10 w-auto rounded-lg" />
  <span class="leading-tight">
    <span class="block text-base font-extrabold tracking-wide text-forest">Bioinformatics Training</span>
    <span class="hidden text-[11px] font-medium text-charcoal-soft sm:block">Intermediate Plant Genome Bioinformatics Workshop</span>
  </span>
</a>
```

Add partner logos container after the main flex row in header:
```html
<div class="partner-logos-container flex flex-wrap items-center gap-3 md:gap-4 py-2 border-t border-sage/60">
  <img src="image/CIMMYT.png" alt="CIMMYT" class="h-7 md:h-8 w-auto object-contain">
  <img src="image/..." alt="CGIAR" ...> <!-- if missing, might need to handle -->
  <img src="image/searca.png" alt="SEARCA" class="h-7 md:h-8 w-auto object-contain">
  <img src="image/uplb.png" alt="UPLB" class="h-7 md:h-8 w-auto object-contain">
  <img src="image/PhilRice.png" alt="PhilRice" class="h-7 md:h-8 w-auto object-contain">
  <img src="image/1k1.png" alt="1k1RG" class="h-7 md:h-8 w-auto object-contain">
</div>
```

Styling: height 28-32px (h-7 to h-8), gap 12-16px (gap-3 to gap-4), padding py-2, border-top for separation.

### qa.html - same changes

Also need to ensure responsive handling with flex-wrap.
