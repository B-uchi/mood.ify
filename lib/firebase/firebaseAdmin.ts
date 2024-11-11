import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
  throw new Error("Credentials not found");
}

const credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);

if (!getApps().length) {
  initializeApp({
    credential: cert(credentials),
    // Optional: specify database URL or other configs
  });
}

console.log("Firebase initialized");

export const adminDb = getFirestore();