# Plan: Clean up partner logo integration

## Goal
1. Remove the Tiny Icon Row - miniature, low-resolution partner icon row currently appearing on the far left of the navigation area (brand/logo area)
2. Optimize the Main Partner Logo Banner - keep only the clean partner logo row (CIMMYT, SEARCA, UPLB, PhilRice, 1k1RG), centered/aligned symmetrically, heights 24-28px, gap 16px

Looking at current structure:
- Brand area (far left): has Screenshot logo + "Bioinformatics Training" text + subtitle
- Below main nav row: partner-logos-container with CIMMYT, SEARCA, UPLB, PhilRice, 1k1RG

The "tiny icon row on the far left of the navigation area" - the Screenshot logo in the brand might be what they mean. Also "partner icon row" - Screenshot might be considered a partner/logo icon.

Also need to remove it from both index.html and qa.html.

Changes:
- In brand section, remove the Screenshot img
- Adjust brand styling to just have text
- Update partner logos container: heights 24-28px (h-6 to h-7), gap 16px (gap-4), center it properly
