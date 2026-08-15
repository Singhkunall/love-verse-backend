const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
// --- FIX: '../' ko hata kar './' kiya kyunki server.js aur models same level par hain ---
const Message = require("./models/Message");
const eventRoutes = require("./routes/event.routes");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://love-verse-frontend.vercel.app",
  /\.vercel\.app$/,
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const server = http.createServer(app);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const wishlistRoutes = require("./routes/wishlistRoutes");
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/auth", authRoutes);

const rouletteRoute = require("./routes/roulette");
app.use("/api/roulette", rouletteRoute);

const voiceNoteRoutes = require("./routes/voiceNoteRoutes");
app.use("/api/voice-notes", voiceNoteRoutes);

const routineRoutes = require("./routes/routineRoutes");
app.use("/api/routine", routineRoutes);

const agoraRoutes = require("./routes/agoraRoutes");
app.use("/api/agora", agoraRoutes);

const universeRoute = require("./routes/universe");
app.use("/api/universe", universeRoute);

app.use("/api/events", eventRoutes);

// --- WATCH TOGETHER STREAM PROXY ROUTE (BYPASSES X-FRAME-OPTIONS) ---
app.get("/api/stream-proxy", async (req, res) => {
  const targetUrl = req.query.url || "https://net77.cc/home";
  try {
    const axios = require("axios");
    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://net77.cc/"
      },
      maxRedirects: 5,
      validateStatus: () => true
    });

    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    if (response.status === 200 && typeof response.data === "string" && response.data.length > 100) {
      res.send(response.data);
    } else {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; background: #09051d; color: white; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 24px; box-sizing: border-box; }
            .card { background: rgba(255,255,255,0.05); padding: 32px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); max-width: 450px; }
            .btn { background: #f43f5e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 16px; font-weight: bold; margin-top: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(244,63,94,0.3); }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🍿 NetMirror Streaming Portal</h2>
            <p>NetMirror requires direct browser verification. Click below to launch NetMirror or use Love-Verse Screen Share during call!</p>
            <a href="${targetUrl}" target="_blank" class="btn">Launch NetMirror Streamer 🍿</a>
          </div>
        </body>
        </html>
      `);
    }
  } catch (err) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; background: #09051d; color: white; font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 24px; box-sizing: border-box; }
          .card { background: rgba(255,255,255,0.05); padding: 32px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); max-width: 450px; }
          .btn { background: #f43f5e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 16px; font-weight: bold; margin-top: 16px; display: inline-block; box-shadow: 0 10px 20px rgba(244,63,94,0.3); }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>🍿 NetMirror Streaming Portal</h2>
          <p>NetMirror requires direct browser verification. Click below to launch NetMirror or use Love-Verse Screen Share during call!</p>
          <a href="${targetUrl}" target="_blank" class="btn">Launch NetMirror Streamer 🍿</a>
        </div>
      </body>
      </html>
    `);
  }
});

app.get("/api/chat/history/:roomId", async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId }).sort({
      createdAt: 1,
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Chat load nahi ho payi" });
  }
});

app.get("/", (req, res) => {
  res.send("Love-Verse Server is Flying on Render! ❤️");
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setup", (userId) => {
    socket.join(userId);
    console.log("User joined personal room:", userId);
  });

  socket.on("join_chat", (roomId) => {
    socket.join(roomId);
    console.log(`User joined chat room: ${roomId}`);
  });

  socket.on("leave_chat", (roomId) => {
    socket.leave(roomId);
    console.log(`User left chat room: ${roomId}`);
  });

  socket.on("send_message", async (data) => {
    try {
      if (typeof data.message === "string" && data.message.startsWith("http")) {
        data.isImage = true;
      }
      const newMessage = new Message(data);
      await newMessage.save();
      socket.to(data.room).emit("receive_message", data);
    } catch (err) {
      console.log("DB Error:", err);
    }
  });

  socket.on("update_task", (data) => {
    io.to(data.roomId).emit("task_updated");
  });

  socket.on("new_wishlist_item", (data) => {
    socket.to(data.roomId).emit("wishlist_updated", {
      message: "Partner ne Wishlist mein kuch naya dala hai! 🎁",
      item: data.item,
    });
  });

  socket.on("delete_wishlist_item", (data) => {
    socket.to(data.roomId).emit("wishlist_updated");
  });

  socket.on("initiate_typing_game", (data) => {
    io.to(data.roomId).emit("start_typing_game", { sentence: data.sentence });
  });

  socket.on("typing_progress", (data) => {
    socket.to(data.roomId).emit("partner_typing_progress", data);
  });

  socket.on("initiate_reaction_game", (data) => {
    io.to(data.roomId).emit("start_reaction_game");
  });

  socket.on("send_reaction_score", (data) => {
    socket.to(data.roomId).emit("partner_reaction_score", data);
  });

  socket.on("new_voice_note", (data) => {
    socket.to(data.roomId).emit("receive_voice_note", data);
  });

  socket.on("voice_note_reaction", (data) => {
    socket.to(data.roomId).emit("voice_reaction_update", data);
  });

  socket.on("initiate_memory_game", (data) => {
    io.to(data.roomId).emit("start_memory_game", {
      cards: data.cards,
      starter: data.starter,
    });
  });

  socket.on("card_flip", (data) => {
    socket.to(data.roomId).emit("partner_card_flip", { cardId: data.cardId });
  });

  socket.on("no_match_turn_change", (data) => {
    socket.to(data.roomId).emit("turn_change");
  });

  socket.on("universe_pin_added", (data) => {
    socket.to(data.roomId).emit("universe_pin_added");
  });

  socket.on("memory_score_update", (data) => {
    socket.to(data.roomId).emit("partner_score_sync", {
      score: data.score,
      matchedIds: data.matchedIds,
    });
  });

  socket.on("send_chess_move", (data) => {
    if (
      !data ||
      !data.roomId ||
      !data.move ||
      !data.move.from ||
      !data.move.to
    ) {
      return;
    }
    socket.to(data.roomId).emit("receive_chess_move", data.move);
  });

  socket.on("restart_chess_request", (data) => {
    if (!data || !data.roomId) return;
    io.to(data.roomId).emit("restart_chess_game");
  });

  socket.on("send_call_signal", (data) => {
    io.to(data.to).emit("incoming_call_signal", {
      from: data.from,
      type: data.type,
    });
  });

  socket.on("end_call_signal", (data) => {
    io.to(data.to).emit("call_ended_signal");
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("display_typing", data);
  });

  socket.on("new_calendar_event", (data) => {
    socket.to(data.roomId).emit("calendar_updated");
  });

  socket.on("send_nudge", (data) => {
    socket.to(data.roomId).emit("receive_nudge", {
      senderName: data.senderName,
    });
  });

  socket.on("update_location", (data) => {
    socket.to(data.roomId).emit("location_updated", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
  socket.on("avatar_updated", (data) => {
    socket.to(data.partnerId).emit("partner_avatar_updated");
  });

  socket.on("mood_updated", (data) => {
    socket.to(data.roomId).emit("partner_mood_updated");
    socket.to(data.partnerId).emit("partner_mood_updated");
  });

  socket.on("anniversary_updated", (data) => {
    socket.to(data.roomId).emit("partner_mood_updated");
    socket.to(data.partnerId).emit("partner_mood_updated");
  });

  // LUDO EVENTS
  socket.on("ludo_roll", (data) => {
    socket.to(data.roomId).emit("ludo_rolled", {
      color: data.color,
      value: data.value,
      movable: data.movable,
    });
  });

  socket.on("ludo_move", (data) => {
    socket
      .to(data.roomId)
      .emit("ludo_moved", { tokens: data.tokens, turn: data.turn });
  });

  socket.on("ludo_winner", (data) => {
    socket.to(data.roomId).emit("ludo_winner", { color: data.color });
  });

  socket.on("ludo_reset", (data) => {
    io.to(data.roomId).emit("ludo_reset");
  });

  socket.on("join_ludo", (data) => {
    socket.join(data.roomId);
  });
  socket.on("register_peer", (data) => {
    // Store peer ID for this user
    socket.peerId = data.peerId;
    socket.userId = data.userId;
  });

  socket.on("get_peer_id", (data) => {
    // Find partner's socket and get their peer ID
    const partnerSocket = [...io.sockets.sockets.values()].find(
      (s) => s.userId === data.partnerId,
    );

    if (partnerSocket) {
      socket.emit("partner_peer_id", { peerId: partnerSocket.peerId });
    } else {
      socket.emit("partner_peer_id", { peerId: null });
    }
  });

  // 👇 YOUTUBE EVENTS KO ANDAR (UPAR) MOVE KAR DIYA 👇
  socket.on("change_video", (data) => {
    socket.to(data.roomId).emit("video_changed", data);
  });

  socket.on("play_video", (data) => {
    socket.to(data.roomId).emit("video_played", data);
  });

  socket.on("pause_video", (data) => {
    socket.to(data.roomId).emit("video_paused");
  });

  socket.on("seek_video", (data) => {
    socket.to(data.roomId).emit("video_seeked", data);
  });

  socket.on("start_cinema_stream", (data) => {
    socket.to(data.roomId).emit("cinema_stream_started", data);
  });

  socket.on("end_cinema_stream", (data) => {
    socket.to(data.roomId).emit("cinema_stream_ended", data);
  });

  socket.on("change_filter", (data) => {
    socket.to(data.roomId).emit("partner_filter_changed", data);
  });

  socket.on('order_placed', (data) => {
    socket.to(data.roomId).emit('order_placed', { 
      placedBy: data.placedBy,
      platform: data.platform,
      items: data.items
    });
  });

  // --- COUPLE QUIZ EVENTS ---
  socket.on("send_quiz_answer", (data) => {
    socket.to(data.roomId).emit("partner_quiz_answer", {
      userId: data.userId,
      optionIndex: data.optionIndex
    });
  });

  socket.on("sync_quiz_round", (data) => {
    socket.to(data.roomId).emit("quiz_round_sync", {
      myScore: data.partnerScore,
      partnerScore: data.myScore
    });
  });

  socket.on("trigger_next_quiz_round", (data) => {
    socket.to(data.roomId).emit("quiz_next_round_trigger", {
      nextRound: data.nextRound
    });
  });

  socket.on("quiz_game_over", (data) => {
    socket.to(data.roomId).emit("quiz_game_over_sync");
  });

  socket.on("trigger_quiz_reset", (data) => {
    socket.to(data.roomId).emit("quiz_reset_trigger");
  });

  // --- COUPLE BEATS MUSIC EVENTS ---
  socket.on("beats_play", (data) => {
    socket.to(data.roomId).emit("beats_play_sync", {
      trackIdx: data.trackIdx,
      currentTime: data.currentTime
    });
  });

  socket.on("beats_pause", (data) => {
    socket.to(data.roomId).emit("beats_pause_sync");
  });

  socket.on("beats_change_track", (data) => {
    socket.to(data.roomId).emit("beats_track_sync", {
      trackIdx: data.trackIdx
    });
  });

  // --- VIRTUAL TOUCH EVENTS ---
  socket.on("touch_move", (data) => {
    socket.to(data.roomId).emit("partner_touch_move", {
      userId: data.userId,
      nx: data.nx,
      ny: data.ny
    });
  });

  socket.on("touch_end", (data) => {
    socket.to(data.roomId).emit("partner_touch_end");
  });
}); // <-- YAHAN PAR io.on('connection') BLOCK BAND HOGA

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});

module.exports = { io };
