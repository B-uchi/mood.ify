const admin = require("firebase-admin")

if (!process.env.FIREBASE_ADMIN_CREDENTIALS){
  throw new Error("Credentials not found")
}

const credentials = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
    // Optional: specify database URL or other configs
  });
}

console.log("Firebase initialized")

export const adminDb = admin.firestore();


