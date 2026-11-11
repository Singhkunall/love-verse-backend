const admin = require("../config/firebase");
const { getMessaging } = require("firebase-admin/messaging");
const User = require("../models/User");

/**
 * Send an FCM push notification to a user by their MongoDB _id
 * @param {Object} params
 * @param {string} params.toUserId - Recipient's User ID
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body
 * @param {Object} [params.data] - Custom data payload (strings only)
 */
async function sendPushNotification({ toUserId, title, body, data = {} }) {
  if (!toUserId) return;
  try {
    const apps = typeof admin.getApps === "function" ? admin.getApps() : (admin.apps || []);
    if (!apps || !apps.length) {
      console.warn("PushService: Firebase Admin not initialized, skipping push notification.");
      return;
    }

    const user = await User.findById(toUserId);
    if (!user || !user.fcmToken) {
      console.log(`PushService: User ${toUserId} has no fcmToken registered in DB.`);
      return;
    }

    // Convert all values in data to string (FCM requirement: Map<string, string>)
    // And ensure no FCM reserved keys ('from', 'notification', 'message_type') crash the send
    const stringifiedData = {};
    for (const [key, value] of Object.entries(data)) {
      let safeKey = key;
      if (key === "from") safeKey = "callerId";
      if (key === "notification") safeKey = "notificationData";
      if (key === "message_type") safeKey = "msgType";
      stringifiedData[safeKey] = value !== undefined && value !== null ? String(value) : "";
    }

    const isCall = stringifiedData.type === "call";

    let message;
    if (isCall) {
      // DATA-ONLY high-priority message for incoming calls:
      // When a message has NO `notification` payload, Google Play Services is forced
      // to wake up LoveVerseMessagingService.onMessageReceived() in the background,
      // which acquires the wake lock and launches the full-screen IncomingCallActivity!
      message = {
        token: user.fcmToken,
        data: {
          ...stringifiedData,
          title: title || "Incoming Call",
          body: body || "Partner is calling you!"
        },
        android: {
          priority: "high"
        }
      };
    } else {
      // Standard notification message for regular chats
      message = {
        token: user.fcmToken,
        notification: {
          title: title || "Love-Verse",
          body: body || "You have a new update!"
        },
        data: stringifiedData,
        android: {
          priority: "high",
          notification: {
            channelId: "love_verse_channel",
            sound: "default",
            icon: "ic_launcher",
            color: "#F43F5E"
          }
        }
      };
    }

    const messaging = getMessaging();
    const response = await messaging.send(message);
    console.log(`Push notification sent successfully to ${toUserId}:`, response);
    return response;
  } catch (error) {
    console.error("PushService error sending notification:", error.message);
    // If the token is invalid or uninstalled, clear it from DB
    if (
      error.code === "messaging/invalid-registration-token" ||
      error.code === "messaging/registration-token-not-registered"
    ) {
      console.log(`Clearing invalid FCM token for user ${toUserId}`);
      await User.findByIdAndUpdate(toUserId, { fcmToken: null });
    }
  }
}

module.exports = {
  sendPushNotification
};
