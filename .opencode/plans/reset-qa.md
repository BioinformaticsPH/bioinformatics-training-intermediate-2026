# Plan: Reset qa.html to clean state

## Context
User requested: "for qa.html. just reset."

The user wants qa.html reverted to a clean state. Based on recent changes, qa.html has accumulated header refinements, branding changes (logo removed from brand, "BT" → "Bioinformatics Training"), partner logos moved to footer, etc.

## Recommended approach
Reset qa.html to its state before the recent header/partner logo changes. Let us identify a clean baseline - before commit a0414ed (Clean up partner logo integration) which started modifying qa.html heavily.

The changes span multiple commits. To reset to a clean state, we could revert qa.html to commit before these modifications started, or restore from a known good state.

Alternatively, look up the state from commit earlier - maybe e707cf8 (header refinement) and before? Or go back to when we first modified it.

But in plan mode, I must not execute. I need to ask user: do they want to reset qa.html to discard all recent header/branding changes (revert to the state before these modifications)? Or reset something else?

Also need to be precise about what gets reset. The safest is to present options and clarify.
