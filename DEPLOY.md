# 🚀 Panduan Deploy JKT48 Live Bot

## ⚠️ Tentang Vercel

**Vercel TIDAK cocok untuk bot WhatsApp** karena:
- Vercel menggunakan **serverless functions** (mati setelah selesai request)
- Bot WhatsApp butuh **koneksi persisten** (WebSocket terus hidup)
- Tidak bisa maintain state/session WhatsApp

**Gunakan platform yang mendukung long-running process:**

---

## 🥇 Railway.app (Recommended - Mudah & Gratis)

### Cara Deploy:

1. **Daftar** di [railway.app](https://railway.app) (gratis, login dengan GitHub)

2. **Buat repository GitHub baru**, upload semua file project ini

3. **Klik "New Project" → "Deploy from GitHub repo"**

4. **Pilih repository** yang baru dibuat

5. **Railway akan auto-detect** Dockerfile dan build otomatis

6. **Buka tab "Logs"** untuk melihat QR code

7. **Scan QR code** dari HP

8. **Set environment variables** (opsional):
   ```
   WA_CHANNEL_JID = 120363XXXX@g.us
   ```

### Selesai! Bot akan berjalan 24/7 ✅

---

## 🥈 Render.com (Free Tier)

### Cara Deploy:

1. **Daftar** di [render.com](https://render.com)

2. **Buat repository GitHub** dengan semua file

3. **Klik "New" → "Background Worker"**

4. **Pilih repository** GitHub kamu

5. **Konfigurasi:**
   - **Runtime:** Docker
   - **Plan:** Free

6. **Deploy** dan buka Logs untuk QR code

7. **Scan QR** dari HP

### Catatan:
- Render free tier akan sleep setelah 15 menit tidak aktif
- Bot akan restart otomatis saat ada request baru
- Untuk always-on, upgrade ke plan $7/bulan

---

## 🥉 Koyeb.com (Free Tier)

### Cara Deploy:

1. **Daftar** di [koyeb.com](https://koyeb.com)

2. **Klik "Create App" → "Docker"**

3. **Masukkan GitHub repository URL**

4. **Konfigurasi:**
   - Dockerfile location: `./Dockerfile`
   - Instance type: Nano (free)

5. **Deploy** dan buka Logs

6. **Scan QR** dari HP

---

## 🐳 Deploy dengan Docker (VPS/Server)

### Di VPS manapun (DigitalOcean, Vultr, Hetzner, dll):

```bash
# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Clone repository
git clone https://github.com/USERNAME/jkt48-live-wa-bot.git
cd jkt48-live-wa-bot

# 3. Build dan jalankan
docker compose up -d

# 4. Lihat logs untuk QR code
docker compose logs -f

# 5. Scan QR dari HP

# 6. Bot berjalan di background!
```

### Perintah berguna:
```bash
# Lihat status
docker compose ps

# Lihat logs
docker compose logs -f

# Restart bot
docker compose restart

# Stop bot
docker compose down

# Update ke versi terbaru
git pull
docker compose up -d --build
```

---

## 💻 Deploy di VPS Tanpa Docker

```bash
# 1. Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Clone repository
git clone https://github.com/USERNAME/jkt48-live-wa-bot.git
cd jkt48-live-wa-bot

# 3. Install dependencies
npm install

# 4. Jalankan dengan PM2 (process manager)
sudo npm install -g pm2
pm2 start src/index.js --name jkt48-bot

# 5. Lihat logs
pm2 logs jkt48-bot

# 6. Auto-start saat reboot
pm2 startup
pm2 save
```

---

## 📱 Cara Mendapatkan JID Target

### Untuk Grup WhatsApp:
1. Tambahkan bot ke grup
2. Kirim `/settarget` di grup tersebut
3. Bot akan otomatis mengatur target

### Untuk Chat Pribadi:
1. Kirim pesan `/settarget` ke nomor bot
2. Bot akan mengatur chat pribadi sebagai target

### Secara Manual (opsional):
- Grup JID format: `120363XXXX@g.us`
- Set via environment variable: `WA_CHANNEL_JID=120363XXXX@g.us`

---

## ⚙️ Environment Variables

| Variable | Default | Keterangan |
|----------|---------|------------|
| `WA_CHANNEL_JID` | _(kosong)_ | JID target notifikasi |
| `POLL_INTERVAL_MS` | `120000` | Interval cek live (ms) |
| `SESSION_DIR` | `./auth_session` | Folder session WhatsApp |
| `LOG_LEVEL` | `info` | Level log (debug/info/warn/error) |
| `NODE_ENV` | `development` | Mode (production/development) |

---

## 🆓 Perbandingan Platform Gratis

| Platform | Always On | RAM | Storage | Kemudahan |
|----------|-----------|-----|---------|-----------|
| **Railway** | ✅ | 512MB | 1GB | ⭐⭐⭐⭐⭐ |
| **Render** | ❌ (sleep) | 512MB | - | ⭐⭐⭐⭐ |
| **Koyeb** | ✅ | 256MB | - | ⭐⭐⭐⭐ |
| **Fly.io** | ✅ | 256MB | 1GB | ⭐⭐⭐ |
| **Docker/VPS** | ✅ | Sesuai | Sesuai | ⭐⭐ |

**Recommendation:** Gunakan **Railway.app** untuk kemudahan, atau **Docker di VPS** untuk kontrol penuh.

---

## 🔧 Troubleshooting

### Bot disconnect terus
- Pastikan koneksi internet stabil di server
- Cek logs untuk error message
- Hapus folder `auth_session` dan scan ulang QR

### Tidak bisa scan QR
- Pastikan terminal/output bisa melihat QR code
- Gunakan `docker compose logs -f` untuk melihat QR

### Bot tidak kirim notifikasi
- Kirim `/status` ke bot untuk cek status
- Pastikan target sudah diatur dengan `/settarget`
- Cek apakah ada member yang sedang live dengan `/live`

---

## 📌 Tips

1. **Gunakan nomor WhatsApp khusus** untuk bot (bukan nomor pribadi)
2. **Simpan folder `auth_session`** agar tidak perlu scan QR lagi
3. **Monitor logs** secara berkala untuk memastikan bot berjalan
4. **Set environment variables** di platform hosting untuk konfigurasi