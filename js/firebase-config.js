// ============================================
// FIREBASE CONFIGURATION
// ============================================
// 
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project called "QuestBorne"
// 3. Enable Authentication > Email/Password
// 4. Create a Firestore Database
// 5. Replace the config below with your project's config
//
// Firestore Rules (paste in Firebase Console > Firestore > Rules):
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /users/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//     match /users/{userId}/{subcollection}/{docId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//     }
//   }
// }

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence().catch((err) => {
    console.log('Persistence error:', err.code);
});
