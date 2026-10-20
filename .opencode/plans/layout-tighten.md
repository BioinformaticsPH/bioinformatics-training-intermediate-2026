# Plan: Tighten layout spacing to pull content upward

## Changes

### 1. Hero Banner Spacing (index.html)
- Hero container (line ~168): `py-20 sm:py-28 lg:py-32` → reduce to `py-12 sm:py-16 lg:py-20`
- Margin after intro paragraph (line ~176-181) is `mt-6` - tighten to `mt-4`
- Margin for buttons div (line ~183): `mt-9` → `mt-6`

### 2. Schedule Section / Main Content
- Main content wrapper (line ~284): `py-16 sm:py-16 lg:py-20` → reduce to `py-10 sm:py-12 lg:py-16` or more aggressively `py-8 sm:py-10 lg:py-12`
- The mb-6 between day cards is maintained as requested

Also look at spacing in other areas if needed.

## Updated values
