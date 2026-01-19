import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
  });
}

export const sendPushNotification = async (
  tokens: string[],
  title: string,
  body: string
) => {
  if (tokens.length === 0) return;

  const message = {
    tokens,
    notification: {
      title,
      body
    }
  };

  // ✅ CORRECT METHOD
  const response = await admin.messaging().sendEachForMulticast(message);

  console.log(`✅ Notifications sent: ${response.successCount}`);//
};
