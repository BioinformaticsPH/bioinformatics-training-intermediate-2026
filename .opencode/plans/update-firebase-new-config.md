# Plan: Update Firebase config with new project

## New Firebase config
```js
const firebaseConfig = {
  apiKey: "AIzaSyDbT8D_kK-RbKPntN01OuGNpNtmvlU-Zsg",
  authDomain: "bi-intermediate-training-57787.firebaseapp.com",
  projectId: "bi-intermediate-training-57787",
  storageBucket: "bi-intermediate-training-57787.firebasestorage.app",
  messagingSenderId: "554200937484",
  appId: "1:554200937484:web:0d2c4f42a3bcd3570daa29",
  measurementId: "G-Q8NV83684K"
};
```

## Current config (js/firebase-config.js)
```js
export const firebaseConfig = {
  apiKey: "AIzaSyDIpo1NewXV4RDJ7F_FpS7w2Cko2Xhd0TY",
  authDomain: "bi-intermediate-training.firebaseapp.com",
  projectId: "bi-intermediate-training",
  storageBucket: "bi-intermediate-training.firebasestorage.app",
  messagingSenderId: "156416689241",
  appId: "1:156416689241:web:163ce44d4b2a14378f9d48"
};
```

## Changes needed
Update the firebaseConfig object in `js/firebase-config.js` with the new values. Also need to update any references - the projectId changed from `bi-intermediate-training` to `bi-intermediate-training-57787`.

Also need to update:
- README.md has hardcoded `FIREBASE_PROJECT_ID` example (`bi-intermediate-training`) and other references
- Firebase rules in README.md
- Apps Script needs to use new project ID and API key

But the main config to update is js/firebase-config.js. The system reminder says plan mode - we need to get approval first. The user wants to update Firebase with the new config.
