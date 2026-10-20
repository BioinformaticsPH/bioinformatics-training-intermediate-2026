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
