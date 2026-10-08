/**
 * Module untuk menyimpan state live sebelumnya
 * Mencegah notifikasi duplikat
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { CONFIG } from "./config.js";

const STATE_FILE = CONFIG.STATE_FILE;

/**
 * Load state dari file
 */
export function loadState() {
  try {
    if (existsSync(STATE_FILE)) {
      const data = readFileSync(STATE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("⚠️ Gagal load state, menggunakan state kosong:", error.message);
  }
  
  return {
    currentlyLive: {},
    lastCheck: null,
    notificationsSent: {}
  };
}

/**
 * Simpan state ke file
 */
export function saveState(state) {
  try {
    const backup = { ...state, savedAt: new Date().toISOString() };
    writeFileSync(STATE_FILE, JSON.stringify(backup, null, 2));
  } catch (error) {
    console.error("❌ Gagal simpan state:", error.message);
  }
}

/**
 * Cek member mana yang baru mulai live
 */
export function getNewLives(currentLives, previousState) {
  const previousLiveIds = new Set(Object.keys(previousState.currentlyLive));
  const newLives = [];
  
  for (const live of currentLives) {
    if (!previousLiveIds.has(live.id)) {
      newLives.push(live);
    }
  }
  
  return newLives;
}

/**
 * Cek member mana yang sudah selesai live
 */
export function getEndedLives(currentLives, previousState) {
  const currentLiveIds = new Set(currentLives.map(l => l.id));
  const endedIds = [];
  
  for (const id of Object.keys(previousState.currentlyLive)) {
    if (!currentLiveIds.has(id)) {
      endedIds.push(id);
    }
  }
  
  return endedIds;
}

/**
 * Update state dengan data live terbaru
 */
export function updateState(currentLives, previousState) {
  const newState = {
    currentlyLive: {},
    lastCheck: new Date().toISOString(),
    notificationsSent: { ...previousState.notificationsSent }
  };
  
  for (const live of currentLives) {
    newState.currentlyLive[live.id] = {
      memberName: live.memberName,
      platform: live.platform,
      startedAt: live.startedAt,
      lastSeen: new Date().toISOString()
    };
  }
  
  // Bersihkan notifikasi lama (lebih dari 24 jam)
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  for (const [key, value] of Object.entries(newState.notificationsSent)) {
    if (new Date(value).getTime() < oneDayAgo) {
      delete newState.notificationsSent[key];
    }
  }
  
  return newState;
}

/**
 * Tandai bahwa notifikasi sudah dikirim untuk live ini
 */
export function markNotificationSent(state, liveId) {
  state.notificationsSent[liveId] = new Date().toISOString();
  return state;
}

/**
 * Cek apakah notifikasi sudah dikirim untuk live ini
 */
export function isNotificationSent(state, liveId) {
  return !!state.notificationsSent[liveId];
}