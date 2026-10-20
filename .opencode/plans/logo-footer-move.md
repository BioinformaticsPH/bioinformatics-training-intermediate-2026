# Plan: Move partner logo strip above footer

## Changes
1. Remove partner-logos-container from header (index.html and qa.html) - lines around 148-158
2. Add partner-logos-container right before <footer> in both files
3. Style: normal flow (position static), centered, bg matching footer or lower content band, padding my-8/py-6, gap 16-24px, responsive heights

Current header location removed. New location before footer:
```html
  <!-- Partner Logos -->
  <section class="bg-white border-t border-sage/60">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <div class="partner-logos-container flex flex-wrap items-center justify-center gap-4 md:gap-6">
        <img src="image/CIMMYT.png" alt="CIMMYT" class="h-5 sm:h-6 md:h-7 w-auto object-contain max-h-7">
        ...
      </div>
    </div>
  </section>
  <footer ...>
```
