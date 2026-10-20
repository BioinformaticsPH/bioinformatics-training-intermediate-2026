# Plan: Schedule section updates and spacing refinements

## 1. Content Updates (Days 3 & 4)
Already applied in js/ui.js - Day 3 is THU 29 OCT 2026 with Victor, Day 4 is FRI 30 OCT 2026 with All (Nikki for afternoon only). Details and requirements match.

## 2. Spacing adjustments

### In js/ui.js (renderSchedule)
- Each `<li class="schedule-day">` needs `mb-6` (margin-bottom: 1.5rem)
- The panel inner needs padding `p-6` - currently `.sched-panel-inner` has padding `0.75rem 0.25rem 1.25rem`, need to update CSS or override. Better to update CSS.
- Details list: change `space-y-1` to `space-y-2`
- Between main session descriptions and requirements blocks need consistent spacing - add proper margins
- Requirements divider: add `border-t border-gray-100/20 pt-3 mt-4` to requirements block

### In css/style.css
- `.schedule-day` needs margin-bottom (mb-6) - add `margin-bottom: 1.5rem;`
- `.sched-panel-inner` needs padding `1.5rem` - change padding

### Changes needed
1. css/style.css:
   - `.schedule-day { border-left: 2px solid var(--sage); padding-left: 1rem; position: relative; margin-bottom: 1.5rem; }`
   - `.sched-panel-inner { padding: 1.5rem 0.25rem 1.5rem; }` or just `padding: 1.5rem;` - need to ensure proper padding

2. js/ui.js renderSchedule:
   - Change details ul to `space-y-2`
   - Update requirements block: add divider classes `border-t border-gray-100/20 pt-3 mt-4` and ensure spacing
