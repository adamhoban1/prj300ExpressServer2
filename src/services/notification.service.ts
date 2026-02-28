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
  const usersNear = collections.users?.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates },
        $maxDistance: radius
      }
    }
  });
  const users = await usersNear?.toArray();
  if (!users) return;
  for (const user of users) {
    if (user.fcmToken) {
      await sendFCMNotification(user.fcmToken, title, body, customData);
    }
  }
}

