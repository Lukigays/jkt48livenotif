# 🤖 JKT48 Live Notifier Bot

Bot WhatsApp otomatis yang mengirim notifikasi ketika member JKT48 sedang live di **Showroom** atau **IDN Live**.

## ✨ Fitur

- ✅ **Auto-detect live** - Mengecek setiap 2 menit
- ✅ **Multi-platform** - Showroom & IDN Live
- ✅ **Notifikasi detail** - Nama member, platform, viewers, link
- ✅ **Anti-duplikat** - Hanya kirim notifikasi sekali per sesi live
- ✅ **Command bot** - Cek status, cek live manual, dll
- ✅ **Persistent state** - State tersimpan di file, tidak hilang saat restart

## 📋 Commands

| Command | Fungsi |
|---------|--------|
| `/status` | Cek status bot |
| `/live` | Cek siapa yang sedang live sekarang |
| `/settarget` | Atur chat ini sebagai target notifikasi |
| `/help` | Tampilkan bantuan |

## 🚀 Cara Install & Jalankan

### 1. Prerequisites

Pastikan sudah terinstall:
- **Node.js** v18 atau lebih baru (download dari https://nodejs.org)
- **npm** atau **yarn**

### 2. Install Dependencies

```bash
cd jkt48-live-wa-bot
npm install
```

### 3. Jalankan Bot

```bash
npm start
```

### 4. Scan QR Code

Setelah bot berjalan, akan muncul QR code di terminal:
1. Buka WhatsApp di HP
2. Masuk ke **Settings → Linked Devices**
3. Pilih **Link a Device**
4. Scan QR code yang muncul

### 5. Atur Target Notifikasi

Setelah bot terhubung:
1. Tambahkan bot ke grup yang ingin menerima notifikasi
2. Kirim pesan `/settarget` di grup tersebut
3. Bot akan mengkonfirmasi target sudah diatur

## 📁 Struktur Project

```
jkt48-live-wa-bot/
├── src/
│   ├── index.js           # Main bot file
│   ├── config.js          # Konfigurasi
│   ├── live-checker.js    # Module cek live
│   ├── state-manager.js   # Manajemen state
│   └── message-formatter.js # Format pesan
├── package.json
├── README.md
└── auth_session/          # Auto-generated saat scan QR
```

## ⚙️ Konfigurasi

Edit file `src/config.js` untuk mengubah:

```javascript
export const CONFIG = {
  // Interval pengecekan (dalam milidetik)
  POLL_INTERVAL_MS: 2 * 60 * 1000, // 2 menit
  
  // Template pesan notifikasi
  MESSAGE_TEMPLATE: {
    LIVE_NOTIFICATION: `🔴 *{memberName} sedang LIVE!*
...`
  }
};
```

## 📝 Contoh Notifikasi

```
🔴 *Christy sedang LIVE!*

📺 *Platform:* Showroom
📝 *Judul:* Showroom · Lagu & Dance
👥 *Viewers:* 1.234
⏰ *Mulai:* 8 Okt 2026 14.30

🔗 *Tonton di sini:*
https://www.showroom-live.com/r/JKT48_Christy

---
🤖 JKT48 Live Notifier Bot
```

## 🔧 Troubleshooting

### Bot tidak bisa connect
- Pastikan koneksi internet stabil
- Hapus folder `auth_session` dan scan ulang QR

### Tidak ada notifikasi terkirim
- Pastikan sudah menjalankan `/settarget`
- Cek status bot dengan `/status`
- Pastikan bot masih terhubung (cek terminal)

### Error saat install
```bash
# Bersihkan cache dan install ulang
rm -rf node_modules package-lock.json
npm install
```

## 🛠️ Development

```bash
# Jalankan dengan auto-restart saat ada perubahan
npm run dev
```

## 📌 Catatan Penting

- Bot ini menggunakan **Baileys** (unofficial WhatsApp Web API)
- WhatsApp bisa memblokir nomor yang terdeteksi spam
- Gunakan dengan bijak dan jangan terlalu sering mengirim pesan
- Simpan folder `auth_session` untuk tidak perlu scan QR lagi

## 🤝 Support

Jika ada masalah atau pertanyaan:
1. Cek troubleshooting di atas
2. Pastikan semua dependencies terinstall dengan benar
3. Gunakan Node.js v18+

---

Made with ❤️ for JKT48 Fans