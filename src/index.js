/**
 * JKT48 Live WhatsApp Bot
 * Bot untuk mengirim notifikasi otomatis ketika member JKT48 live
 * Siap deploy ke Railway, Render, Koyeb, Fly.io, atau Docker
 */

import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import pino from "pino";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { CONFIG } from "./config.js";
import { loadMemberDirectory, checkAllLives } from "./live-checker.js";
import {
  loadState,
  saveState,
  getNewLives,
  getEndedLives,
  updateState,
  markNotificationSent,
} from "./state-manager.js";
import { formatNewLiveNotification, formatEndLiveNotification } from "./message-formatter.js";

// Logger - pretty print di development, JSON di production
const logger = pino({
  level: process.env.LOG_LEVEL || CONFIG.LOG_LEVEL,
  transport: process.env.NODE_ENV !== "production" ? { target: "pino-pretty" } : undefined,
});

// State
let currentState = loadState();
let isConnected = false;
let sock = null;
let targetJID = process.env.WA_CHANNEL_JID || CONFIG.CHANNEL_JID;
let pollInterval = null;

/**
 * Kirim pesan ke target
 */
async function sendMessage(message) {
  if (!sock || !isConnected) {
    logger.warn("Bot belum terhubung, pesan tidak terkirim");
    return false;
  }

  if (!targetJID) {
    logger.warn("Target JID belum diatur! Kirim perintah /settarget di grup");
    return false;
  }

  try {
    await sock.sendMessage(targetJID, { text: message });
    logger.info(`Pesan terkirim ke ${targetJID}`);
    return true;
  } catch (error) {
    logger.error({ err: error }, "Gagal kirim pesan");
    return false;
  }
}

/**
 * Polling loop untuk cek live
 */
async function pollLoop() {
  logger.info("Memulai pengecekan live...");

  try {
    const currentLives = await checkAllLives();
    const newLives = getNewLives(currentLives, currentState);
    const endedLives = getEndedLives(currentLives, currentState);

    // Kirim notifikasi untuk live baru
    if (newLives.length > 0) {
      logger.info(`${newLives.length} member baru live!`);
      const message = formatNewLiveNotification(newLives);
      if (message) {
        const sent = await sendMessage(message);
        if (sent) {
          for (const live of newLives) {
            currentState = markNotificationSent(currentState, live.id);
          }
        }
      }
    }

    // Info member selesai live
    if (endedLives.length > 0) {
      const endedMembers = endedLives
        .map((id) => currentState.currentlyLive[id])
        .filter(Boolean);
      logger.info(`${endedMembers.length} member selesai live`);
    }

    // Update state
    currentState = updateState(currentLives, currentState);
    saveState(currentState);

    logger.info(`Pengecekan selesai. Berikutnya dalam ${CONFIG.POLL_INTERVAL_MS / 1000}s`);
  } catch (error) {
    logger.error({ err: error }, "Error saat polling");
  }
}

/**
 * Handle pesan masuk (untuk command)
 */
async function handleMessage(msg) {
  const message = msg.message;
  if (!message) return;

  const text =
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    "";

  const command = text.toLowerCase().trim();
  const from = msg.key.remoteJid;

  if (command === "/status") {
    const liveCount = Object.keys(currentState.currentlyLive).length;
    const lastCheck = currentState.lastCheck || "Belum pernah";

    await sock.sendMessage(from, {
      text: `📊 *Status Bot*\n\n🟢 Bot: ${isConnected ? "Online" : "Offline"}\n📺 Member live: ${liveCount}\n🕐 Cek terakhir: ${lastCheck}\n🎯 Target: ${targetJID || "Belum diatur"}\n⏰ Interval: ${CONFIG.POLL_INTERVAL_MS / 1000}s\n\nKetik /help untuk bantuan`,
    });
  }

  if (command === "/live") {
    const lives = await checkAllLives();
    if (lives.length === 0) {
      await sock.sendMessage(from, { text: "📺 Tidak ada member yang sedang live saat ini." });
    } else {
      const message = formatNewLiveNotification(lives);
      await sock.sendMessage(from, { text: message });
    }
  }

  if (command === "/settarget") {
    targetJID = from;
    await sock.sendMessage(from, {
      text: `✅ Target notifikasi diatur ke:\n${targetJID}\n\nBot akan mengirim notifikasi live ke chat ini.`,
    });
    logger.info(`Target JID diatur: ${targetJID}`);
  }

  if (command === "/help") {
    await sock.sendMessage(from, {
      text: `🤖 *JKT48 Live Notifier Bot*\n\n📋 *Commands:*\n• /status - Cek status bot\n• /live - Cek siapa yang sedang live\n• /settarget - Atur chat ini sebagai target notifikasi\n• /help - Tampilkan bantuan\n\n📌 *Cara Penggunaan:*\n1. Tambahkan bot ke grup atau chat\n2. Kirim /settarget untuk mengatur target\n3. Bot otomatis kirim notifikasi saat ada member live\n\n⏰ Interval cek: ${CONFIG.POLL_INTERVAL_MS / 1000} detik`,
    });
  }
}

/**
 * Koneksi ke WhatsApp
 */
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(CONFIG.SESSION_DIR);

  sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false,
    browser: ["JKT48 Live Bot", "Chrome", "1.0.0"],
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
  });

  // Event: QR Code
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      logger.info("Scan QR Code berikut untuk login:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === "close") {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      isConnected = false;

      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }

      if (reason === DisconnectReason.loggedOut) {
        logger.error("Logged out! Hapus folder auth_session dan restart");
        process.exit(1);
      } else {
        logger.warn(`Terputus (reason: ${reason}), reconnecting dalam 5s...`);
        setTimeout(connectToWhatsApp, 5000);
      }
    }

    if (connection === "open") {
      isConnected = true;
      logger.info("Bot terhubung ke WhatsApp!");

      if (targetJID) {
        logger.info(`Target JID: ${targetJID}`);
      } else {
        logger.info("Menunggu target JID... Kirim /settarget di grup/chat");
      }

      // Mulai polling
      await pollLoop();
      pollInterval = setInterval(pollLoop, CONFIG.POLL_INTERVAL_MS);
    }
  });

  // Event: Credentials update
  sock.ev.on("creds.update", saveCreds);

  // Event: Messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.key.fromMe) {
        await handleMessage(msg);
      }
    }
  });

  return sock;
}

/**
 * Graceful shutdown
 */
async function shutdown(signal) {
  logger.info(`Menerima ${signal}, shutting down gracefully...`);

  if (pollInterval) {
    clearInterval(pollInterval);
  }

  if (sock) {
    sock.end();
  }

  saveState(currentState);
  logger.info("State tersimpan. Bye!");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

/**
 * Main function
 */
async function main() {
  logger.info("JKT48 Live Notifier Bot starting...");

  // Load member directory
  const loaded = await loadMemberDirectory();
  if (!loaded) {
    logger.error("Gagal load data member! Pastikan koneksi internet aktif.");
    process.exit(1);
  }

  // Load state sebelumnya
  currentState = loadState();
  logger.info(`State loaded: ${Object.keys(currentState.currentlyLive).length} member sebelumnya live`);

  // Koneksi ke WhatsApp
  logger.info("Menghubungkan ke WhatsApp...");
  await connectToWhatsApp();
}

// Handle process errors
process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught Exception");
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error({ err: error }, "Unhandled Rejection");
});

main().catch((err) => {
  logger.fatal({ err }, "Fatal error saat startup");
  process.exit(1);
});