# Plan: Update Branding and Hero Banner

## Goal
Update branding from BI_TRAIN/G-TRAIN to Bioinformatics Training (or BT where space constrained), update hero banner content, and verify.

## Files to modify

### 1. index.html (main landing page)
- Title (line ~6): "Intermediate Plant Genome Bioinformatics Workshop 2026 | BI_TRAIN" → "Intermediate Plant Genome Bioinformatics Workshop 2026 | Bioinformatics Training"
- Navbar logo/brand (line ~95-103): 
  - aria-label: "BI_TRAIN home" → "Bioinformatics Training home"
  - Brand text: "BI_TRAIN" → "BT" (space constrained - mobile navbars/logos per instruction)
- Hero section (lines ~167-213):
  - H1 (line ~174): "Elevate Your Data Analysis Skills" → "Intermediate Plant Genome Bioinformatics Workshop"
  - Add/update subtitle/metadata right after H1: "27–30 October 2026 | SEARCA Headquarters, UPLB Campus, College, Los Baños, Laguna"
- Footer (line ~452): "BI_TRAIN" → "Bioinformatics Training"

### 2. qa.html (Q&A page)
- Navbar logo/brand (line ~95-103): "BI_TRAIN home" → "Bioinformatics Training home", brand text "BI_TRAIN" → "BT"
- Footer (line ~270): "BI_TRAIN" → "Bioinformatics Training"

### 3. css/style.css
- Comment line ~2: "BI_TRAIN — custom stylesheet" → "Bioinformatics Training — custom stylesheet"

### 4. README.md and README.md.save
- Update all occurrences of "BI_TRAIN" to "Bioinformatics Training" as appropriate

## Verification
- Search for remaining BI_TRAIN/G-TRAIN
- Check for broken internal links (all links look relative/anchors, should be fine)
- Suggest running a build/validation - this is a static site, can do basic HTML check with node or just grep

## Additional change: Include logo from image folder
- Logo file: `image/Screenshot 2026-10-20 105137.png` (954 x 238)
- Replace the DNA icon in navbar (both index.html and qa.html) with the actual logo image
- May need to adjust styling (height/width) to fit in the navbar
- Could also add as alt text "Bioinformatics Training" or similar

## Additional change: Include logo from image folder
- Logo file: `image/Screenshot 2026-10-20 105137.png` (954 x 238)
- Replace the DNA icon in navbar (both index.html and qa.html) with the actual logo image
- May need to adjust styling (height/width) to fit in the navbar
- Could also add as alt text "Bioinformatics Training" or similar

## Header Navigation Refinement Plan

### Requirements:
1. Update Brand Identifier in Navbar:
   - Replace compact "BT" text with "Bioinformatics Training" as primary title (or keep clean)
   - Current: BT + subtitle. Want "Bioinformatics Training" as primary title.

2. Refactor Partner Logos Container:
   - Need to add a dedicated responsive flexbox container for partner logos (CIMMYT, CGIAR, SEARCA, UPLB, PhilRice, and 1k1RG)
   - Uniform height 28-32px, gap 12-16px, padding to prevent overlap
   - Can be in header or below main navbar

3. Responsive handling - wrap/scale on tablet/mobile

### Current state:
- Logo image on left, BT text next to it
- Nav in middle, auth on right

Need to understand where to place partner logos. Looking at requirements again: "Create a dedicated, responsive flexbox container for the partner logos cluster (CIMMYT, CGIAR, SEARCA, UPLB, PhilRice, and 1k1RG) in the header or directly below the main navbar."

Also the partner logos aren't present as files - maybe they need to be added? Or maybe use text/svgs? Or perhaps the user expects us to structure the layout for them. Let us look up the full requirements again more carefully.

Looking at the full request: "access the final page here. it is not rendering properly" - maybe related to image not being pushed? Also they want header refined with partner logos. The partner logos might need to be added as images or just structured. But we need to see if there are any existing references to these logos.

Let us look up more context about the expected structure. Also check if there's a README or other info about partner logos.
