/**
 * Health check script
 * Bisa digunakan oleh platform hosting untuk memeriksa status bot
 */

import { existsSync, readFileSync } from "fs";

const STATE_FILE = process.env.STATE_FILE || "./live_state.json";

try {
  if (existsSync(STATE_FILE)) {
    const state = JSON.parse(readFileSync(STATE_FILE, "utf-8"));
    const lastCheck = state.lastCheck ? new Date(state.lastCheck) : null;
    const minutesAgo = lastCheck ? Math.floor((Date.now() - lastCheck.getTime()) / 60000) : null;
    
    console.log(JSON.stringify({
      status: "ok",
      lastCheck: state.lastCheck,
      minutesAgo,
      membersLive: Object.keys(state.currentlyLive).length,
      notificationsSent: Object.keys(state.notificationsSent).length
    }));
    process.exit(0);
  } else {
    console.log(JSON.stringify({ status: "initializing", message: "State file not found yet" }));
    process.exit(0);
  }
} catch (error) {
  console.error(JSON.stringify({ status: "error", message: error.message }));
  process.exit(1);
}