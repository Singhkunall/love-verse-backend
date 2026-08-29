const express = require('express');
const router = express.Router();

router.post('/token', async (req, res) => {
  try {
    const { channelName, uid } = req.body;
    
    const appId = process.env.AGORA_APP_ID || process.env.VITE_AGORA_APP_ID || "a5839042b3224b1a8d052b610c666579";
    const appCertificate = process.env.AGORA_APP_CERTIFICATE || "";

    if (!appCertificate) {
      return res.json({ success: true, token: null, appId });
    }

    try {
      const { RtcTokenBuilder, RtcRole } = require('agora-token');
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const numericUid = typeof uid === 'number' ? uid : (parseInt(uid, 10) || 0);

      const token = RtcTokenBuilder.buildTokenWithUid(
        appId, appCertificate, channelName, numericUid, role, privilegeExpiredTs, privilegeExpiredTs
      );

      return res.json({ success: true, token, appId });
    } catch (tokenErr) {
      console.warn("RtcTokenBuilder warning:", tokenErr.message);
      return res.json({ success: true, token: null, appId });
    }
  } catch (err) {
    console.error("Agora Token Route Error:", err.message);
    res.json({ success: true, token: null, appId: "a5839042b3224b1a8d052b610c666579" });
  }
});

module.exports = router;