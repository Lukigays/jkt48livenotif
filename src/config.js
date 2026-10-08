/**
 * Konfigurasi Bot JKT48 Live WhatsApp
 * Bisa di-override via environment variables
 */

export const CONFIG = {
  // Pengaturan polling
  POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS) || 2 * 60 * 1000,
  
  // Target notifikasi WhatsApp (bisa diatur via /settarget atau env)
  CHANNEL_JID: process.env.WA_CHANNEL_JID || "",
  
  // Pengaturan Baileys - session disimpan di folder ini
  SESSION_DIR: process.env.SESSION_DIR || "./auth_session",
  
  // State file
  STATE_FILE: process.env.STATE_FILE || "./live_state.json",
  
  // API endpoints
  SHOWROOM_API: "https://www.showroom-live.com/api/live/onlives",
  IDN_GRAPHQL_API: "https://api.idn.app/graphql",
  
  // Members JSON URL
  MEMBERS_JSON_URL: process.env.MEMBERS_JSON_URL || "https://raw.githubusercontent.com/JKT48Live/players/main/assets/members.json",
  
  // Log level
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  
  // Template pesan
  MESSAGE_TEMPLATE: {
    LIVE_NOTIFICATION: `🔴 *{memberName} sedang LIVE!*

📺 *Platform:* {platform}
📝 *Judul:* {title}
👥 *Viewers:* {viewers}
⏰ *Mulai:* {startTime}

🔗 *Tonton di sini:*
{roomUrl}

---
🤖 JKT48 Live Notifier Bot`
  }
};