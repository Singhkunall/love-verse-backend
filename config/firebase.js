const admin = require("firebase-admin");

let serviceAccount = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
      serviceAccount = JSON.parse(decoded);
    } catch (e) {
      console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT_BASE64:", e.message);
    }
  }

  if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      if (!raw.startsWith("{")) {
        raw = Buffer.from(raw, "base64").toString("utf8");
      }
      serviceAccount = JSON.parse(raw);
    } catch (e) {
      console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT env string:", e.message);
    }
  }

  if (!serviceAccount) {
    try {
      serviceAccount = require("./firebase-service-account.json");
    } catch (e) {
      console.warn("firebase-service-account.json not found:", e.message);
    }
  }

  const apps = typeof admin.getApps === "function" ? admin.getApps() : (admin.apps || []);
  if (serviceAccount && apps.length === 0) {
    admin.initializeApp({
      credential: admin.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK successfully initialized! 🔥 (Project: " + (serviceAccount.project_id || "love-verse-b17be") + ")");
  }
} catch (err) {
  console.error("Firebase Admin initialization error:", err.message);
}

module.exports = admin;
