# Plan: Add bioinformaticsph@gmail.com as admin for announcements

## Goal
Add bioinformaticsph@gmail.com to the instructor/admin allowlist so they can add announcements.

## Changes needed
1. **js/firebase-config.js** - Add to INSTRUCTOR_EMAILS array
2. **README.md** - Update the Firestore rules example to include the new email in the INSTRUCTOR_EMAILS references
3. **Firebase Security Rules** (external) - Need to update in Firebase Console to match; documented in README

Current INSTRUCTOR_EMAILS:
```js
export const INSTRUCTOR_EMAILS = [
  "lhendrixbarboza@gmail.com",
  "nikkiborj@gmail.com",
  "vjmulat@gmail.com"
];
```

Add "bioinformaticsph@gmail.com"

Also need to update the rules example in README.md line ~111 and other places where the instructor list appears.

The Firebase rules need to be updated in the Firebase Console as well - the README documents this.
