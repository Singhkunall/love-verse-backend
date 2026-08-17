const express = require('express');
const router = express.Router();

router.post('/token', async (req, res) => {
  try {
    const { channelName, uid } = req.body;
    
    const appId = process.env.AGORA_APP_ID || process.env.VITE_AGORA_APP_ID || "a5839042b3224b1a8d052b610c666579";
    const appCertificate = process.env.AGORA_APP_CERTIFICATE || "";

    if (!appCertificate) {
      return res.json({ success: true, token: null });
    }

    try {
      const { RtcTokenBuilder, RtcRole } = require('agora-token');
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        appId, appCertificate, channelName, uid, role, privilegeExpiredTs, privilegeExpiredTs
      );

      return res.json({ success: true, token });
    } catch (tokenErr) {
      console.warn("RtcTokenBuilder warning:", tokenErr.message);
      return res.json({ success: true, token: null });
    }
  } catch (err) {
    console.error("Agora Token Route Error:", err.message);
    res.json({ success: true, token: null });
  }
});

module.exports = router;