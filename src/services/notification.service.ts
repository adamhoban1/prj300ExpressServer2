import { collections } from "../database";
import admin from "../config/firebase";

// send a push notification to a specific FCM token using FCM HTTP v1 API
export async function sendFCMNotification(
  token: string,
  title: string,
  body: string,
  data: { [key: string]: string } = {}
): Promise<any> {
  const message = {
    token,
    notification: { title, body },
    data
  };
  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error("FCM send error:", error);
    throw error;
  }
}

// send a push notification to all users within a certain radius of given coordinates
export async function notifyNearbyUsers(
  coordinates: [number, number],
  radius: number,
  title: string,
  body: string,
  customData: { [key: string]: string } = {}
): Promise<void> {
  const BATCH_SIZE = 500; // FCM sendAll max batch size
  const usersCursor = collections.users?.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: radius
      }
    }
  }, { projection: { fcmToken: 1 } });
  if (!usersCursor) return;

  let batch: any[] = [];
  while (await usersCursor.hasNext()) {
    const user = await usersCursor.next();
    if (user?.fcmToken) {
      batch.push({ userId: user._id, token: user.fcmToken });
    }
    if (batch.length === BATCH_SIZE) {
      await sendBatch(batch, title, body, customData);
      batch = [];
    }
  }
  if (batch.length > 0) {
    await sendBatch(batch, title, body, customData);
  }
}

async function sendBatch(
  batch: { userId: any, token: string }[],
  title: string,
  body: string,
  data: { [key: string]: string }
) {
  const registrationTokens = batch.map(({ token }) => token);
  const message = {
    tokens: registrationTokens,
    notification: { title, body },
    data
  };
  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    if (response.failureCount > 0) {
      for (let i = 0; i < response.responses.length; i++) {
        const res = response.responses[i];
        if (!res.success && res.error &&
          (res.error.code === 'messaging/invalid-registration-token' ||
           res.error.code === 'messaging/registration-token-not-registered')) {
          // Remove the invalid token from the user
          const userId = batch[i].userId;
          await collections.users?.updateOne({ _id: userId }, { $unset: { fcmToken: "" } });
          console.log(`Removed invalid FCM token for user ${userId}`);
        }
      }
    }
  } catch (err) {
    console.error('FCM sendEachForMulticast batch error:', err);
  }
}

