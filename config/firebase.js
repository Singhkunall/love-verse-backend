const admin = require("firebase-admin");

let serviceAccount = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
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

  if (serviceAccount && !admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK successfully initialized! 🔥");
  }
} catch (err) {
  console.error("Firebase Admin initialization error:", err.message);
}

module.exports = admin;
