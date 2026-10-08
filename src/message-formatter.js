/**
 * Module untuk memformat pesan WhatsApp
 */

import { CONFIG } from "./config.js";

/**
 * Format pesan notifikasi live
 */
export function formatLiveNotification(live) {
  let message = CONFIG.MESSAGE_TEMPLATE.LIVE_NOTIFICATION;
  
  // Replace semua placeholder
  message = message.replace("{memberName}", live.memberName);
  message = message.replace("{platform}", live.platform);
  message = message.replace("{title}", live.title);
  message = message.replace("{viewers}", live.viewersFormatted);
  message = message.replace("{startTime}", live.startedAt);
  message = message.replace("{roomUrl}", live.roomUrl);
  
  return message;
}

/**
 * Format pesan multiple live (ringkasan)
 */
export function formatMultipleLiveSummary(lives) {
  if (lives.length === 0) return null;
  
  let message = `🔴 *JKT48 Live Update!*\n\n`;
  message += `📊 *${lives.length} member sedang live:*\n\n`;
  
  for (let i = 0; i < lives.length; i++) {
    const live = lives[i];
    const emoji = live.platform === "Showroom" ? "🟣" : "🔵";
    
    message += `${i + 1}. ${emoji} *${live.memberName}*\n`;
    message += `   📺 ${live.platform}\n`;
    message += `   👥 ${live.viewersFormatted} viewers\n`;
    message += `   🔗 ${live.roomUrl}\n\n`;
  }
  
  message += `⏰ Update: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}\n`;
  message += `---\n🤖 JKT48 Live Notifier Bot`;
  
  return message;
}

/**
 * Format pesan member baru live
 */
export function formatNewLiveNotification(lives) {
  if (lives.length === 0) return null;
  
  // Jika hanya 1 member, gunakan template detail
  if (lives.length === 1) {
    return formatLiveNotification(lives[0]);
  }
  
  // Jika multiple, gunakan summary
  let message = `🔴 *${lives.length} Member JKT48 Baru Live!*\n\n`;
  
  for (const live of lives) {
    const emoji = live.platform === "Showroom" ? "🟣" : "🔵";
    
    message += `${emoji} *${live.memberName}*\n`;
    message += `📺 ${live.platform} • 👥 ${live.viewersFormatted} viewers\n`;
    message += `🔗 ${live.roomUrl}\n\n`;
  }
  
  message += `⏰ ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}\n`;
  message += `---\n🤖 JKT48 Live Notifier Bot`;
  
  return message;
}

/**
 * Format pesan member selesai live
 */
export function formatEndLiveNotification(endedMembers) {
  if (endedMembers.length === 0) return null;
  
  let message = `⚫ *Update: Member Selesai Live*\n\n`;
  message += `${endedMembers.length} member sudah offline:\n`;
  
  for (const member of endedMembers) {
    message += `• ${member.memberName} (${member.platform})\n`;
  }
  
  message += `\n⏰ ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}`;
  
  return message;
}