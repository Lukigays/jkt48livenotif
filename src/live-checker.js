/**
 * Module untuk mengecek status live JKT48 dari Showroom dan IDN Live
 */

import fetch from "node-fetch";
import { CONFIG } from "./config.js";

// Daftar member JKT48 (akan di-load dari JSON)
let memberDirectory = {
  members: [],
  idnIds: new Set(),
  showroomKeys: new Set(),
  showroomIds: new Set()
};

/**
 * Load daftar member dari GitHub
 */
export async function loadMemberDirectory() {
  try {
    console.log("📥 Loading member directory...");
    const response = await fetch(CONFIG.MEMBERS_JSON_URL);
    const data = await response.json();
    const members = data?.members ?? [];
    
    memberDirectory = {
      members,
      idnIds: new Set(members.map(m => m.media_idn_id).filter(Boolean)),
      showroomKeys: new Set(members.map(m => m.media_showroom).filter(Boolean)),
      showroomIds: new Set(members.map(m => String(m.media_showroom_id)).filter(Boolean))
    };
    
    console.log(`✅ Loaded ${members.length} members`);
    return true;
  } catch (error) {
    console.error("❌ Gagal load member directory:", error.message);
    return false;
  }
}

/**
 * Format nama member (hapus suffix JKT48)
 */
function formatName(name) {
  return (name ?? "")
    .replace(/\s*JKT48$/i, "")
    .replace(/\s*\/.*$/, "")
    .replace(/\s+\(JKT48\)$/i, "")
    .trim();
}

/**
 * Konversi timestamp ke format yang bisa dibaca
 */
function formatTimestamp(value) {
  if (!value) return "Tidak diketahui";
  
  let timestamp;
  if (typeof value === "number") {
    timestamp = value > 1e12 ? value : value * 1000;
  } else {
    timestamp = new Date(value).getTime();
  }
  
  if (isNaN(timestamp)) return "Tidak diketahui";
  
  const date = new Date(timestamp);
  return date.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short"
  });
}

/**
 * Format angka viewers
 */
function formatViewers(count) {
  if (!count) return "0";
  return new Intl.NumberFormat("id-ID").format(count);
}

/**
 * Cek live dari Showroom
 */
async function fetchShowroomLives() {
  try {
    console.log("🔍 Checking Showroom...");
    const response = await fetch(CONFIG.SHOWROOM_API, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const onlives = data?.onlives ?? [];
    const allLives = onlives.flatMap(group => group.lives ?? []);
    
    // Filter hanya member JKT48
    const jkt48Lives = allLives.filter(item => {
      const roomId = String(item?.room_id ?? "");
      const roomKey = item?.room_url_key ?? "";
      return memberDirectory.showroomIds.has(roomId) || memberDirectory.showroomKeys.has(roomKey);
    });
    
    console.log(`📺 Showroom: ${jkt48Lives.length} member live`);
    
    return jkt48Lives.map(item => ({
      id: `showroom:${item.room_id ?? item.room_url_key}`,
      platform: "Showroom",
      platformKey: "showroom",
      memberName: formatName(item.main_name || "Unknown"),
      title: item.genre_name ? `Showroom · ${item.genre_name}` : "Showroom Live",
      startedAt: formatTimestamp(item.started_at),
      viewers: item.view_num ?? 0,
      viewersFormatted: formatViewers(item.view_num ?? 0),
      thumbnail: item.image_square ?? item.image ?? "",
      roomUrl: item.room_url_key 
        ? `https://www.showroom-live.com/r/${item.room_url_key}` 
        : "https://www.showroom-live.com/",
      roomKey: item.room_url_key ?? "",
      creatorId: String(item.room_id ?? "")
    }));
  } catch (error) {
    console.error("❌ Gagal fetch Showroom:", error.message);
    return [];
  }
}

/**
 * Cek live dari IDN Live (GraphQL)
 */
async function fetchIdnLives() {
  try {
    console.log("🔍 Checking IDN Live...");
    
    const gqlBody = {
      query: `query SearchLivestream {
        searchLivestream(query: "", limit: 500) {
          next_cursor
          result {
            slug
            title
            image_url
            view_count
            playback_url
            room_identifier
            status
            live_at
            end_at
            scheduled_at
            gift_icon_url
            category { name slug }
            creator {
              uuid username name avatar bio_description
              following_count follower_count is_follow
            }
          }
        }
      }`
    };
    
    const response = await fetch(CONFIG.IDN_GRAPHQL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      },
      body: JSON.stringify(gqlBody)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const items = data?.data?.searchLivestream?.result ?? [];
    
    // Filter hanya yang sedang live dan member JKT48
    const activeItems = items.filter(item => {
      // Cek status live
      const playbackUrl = item?.playback_url ?? "";
      if (!playbackUrl) return false;
      
      const status = String(item?.status ?? "").toLowerCase();
      if (status === "end" || status === "ended" || status === "offline") return false;
      if (item?.end_at) return false;
      
      // Cek member JKT48
      const creatorId = item?.creator?.uuid;
      return memberDirectory.idnIds.has(creatorId);
    });
    
    console.log(`📺 IDN Live: ${activeItems.length} member live`);
    
    return activeItems.map(item => {
      const creator = item?.creator ?? {};
      const slug = item?.slug ?? item?.room_identifier ?? "";
      const username = creator?.username ?? "";
      
      return {
        id: `idn:${item.room_identifier ?? slug}`,
        platform: "IDN Live",
        platformKey: "idn",
        memberName: formatName(creator?.name ?? "Unknown"),
        title: item?.title?.trim() || "Live sekarang",
        startedAt: formatTimestamp(item?.live_at),
        viewers: item?.view_count ?? 0,
        viewersFormatted: formatViewers(item?.view_count ?? 0),
        thumbnail: item?.image_url ?? creator?.avatar ?? "",
        roomUrl: slug && username
          ? `https://www.idn.app/${username}/live/${slug}`
          : `https://www.idn.app/live/${slug}`,
        roomKey: slug,
        creatorId: creator?.uuid ?? ""
      };
    });
  } catch (error) {
    console.error("❌ Gagal fetch IDN Live:", error.message);
    return [];
  }
}

/**
 * Cek semua platform live
 */
export async function checkAllLives() {
  const [showroomLives, idnLives] = await Promise.all([
    fetchShowroomLives(),
    fetchIdnLives()
  ]);
  
  const allLives = [...showroomLives, ...idnLives];
  
  // Deduplicate berdasarkan member name
  const uniqueLives = new Map();
  for (const live of allLives) {
    const key = live.memberName.toLowerCase();
    if (!uniqueLives.has(key) || live.viewers > uniqueLives.get(key).viewers) {
      uniqueLives.set(key, live);
    }
  }
  
  const result = [...uniqueLives.values()].sort((a, b) => b.viewers - a.viewers);
  
  console.log(`\n📊 Total live: ${result.length} member`);
  if (result.length > 0) {
    result.forEach(live => {
      console.log(`   • ${live.memberName} (${live.platform}) - ${live.viewersFormatted} viewers`);
    });
  }
  
  return result;
}