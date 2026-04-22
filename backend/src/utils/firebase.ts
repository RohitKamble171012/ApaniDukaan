import * as admin from 'firebase-admin';

let initialized = false;

export function initFirebase(): void {
  if (initialized) return;

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  });

  initialized = true;
  console.log('✅ Firebase Admin initialized');
}

export async function verifyFirebaseToken(token: string): Promise<admin.auth.DecodedIdToken> {
  const decoded = await admin.auth().verifyIdToken(token);
  return decoded;
}

export { admin };
