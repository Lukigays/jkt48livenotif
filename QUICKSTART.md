# 🚀 Quick Start - JKT48 Live WhatsApp Bot

## ⚡ Deploy ke Railway (Paling Mudah - 5 Menit)

### 1. Upload ke GitHub

```bash
# Buat repository baru di GitHub
# Upload semua file dari folder jkt48-live-wa-bot
```

### 2. Deploy ke Railway

1. Buka [railway.app](https://railway.app) → Login dengan GitHub
2. Klik **"New Project"** → **"Deploy from GitHub repo"**
3. Pilih repository `jkt48-live-wa-bot`
4. Railway akan auto-build dan deploy
5. Buka tab **"Logs"** untuk melihat QR code

### 3. Scan QR Code

1. Buka WhatsApp di HP
2. **Settings** → **Linked Devices** → **Link a Device**
3. Scan QR code dari logs Railway

### 4. Atur Target Notifikasi

1. Tambahkan nomor bot ke grup WhatsApp
2. Kirim pesan `/settarget` di grup
3. Selesai! Bot akan kirim notifikasi otomatis 🎉

---

## 💻 Run Lokal (Untuk Testing)

```bash
cd jkt48-live-wa-bot
npm install
npm start
```

Scan QR code, kirim `/settarget` di grup/chat.

---

## 📋 Commands

| Command | Fungsi |
|---------|--------|
| `/status` | Cek status bot |
| `/live` | Cek siapa yang sedang live |
| `/settarget` | Atur chat ini sebagai target notifikasi |
| `/help` | Tampilkan bantuan |

---

## ⚠️ Vercel?

Vercel **tidak cocok** karena bot butuh koneksi persisten. Gunakan:
- **Railway.app** (recommended, gratis)
- **Render.com** (free tier)
- **Koyeb.com** (free tier)
- **Docker di VPS** (kontrol penuh)

Lihat `DEPLOY.md` untuk panduan lengkap semua platform.

---

## 📁 File Penting

| File | Fungsi |
|------|--------|
| `src/index.js` | Bot utama |
| `src/config.js` | Konfigurasi |
| `src/live-checker.js` | Cek live dari API |
| `auth_session/` | Session WhatsApp (jangan dihapus!) |
| `live_state.json` | State live (auto-generated) |