#!/bin/bash

# JKT48 Live WhatsApp Bot - Setup Script
# Untuk Linux/Mac

echo "╔═══════════════════════════════════════════╗"
echo "║   🤖 JKT48 Live Notifier Bot Setup       ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Cek Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js belum terinstall!"
    echo "📥 Download dari: https://nodejs.org"
    echo "   Pilih versi LTS (18 atau lebih baru)"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js versi terlalu lama! Minimal v18"
    echo "   Versi saat ini: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) terdeteksi"
echo ""

# Install dependencies
echo "📦 Menginstall dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Gagal install dependencies!"
    exit 1
fi

echo ""
echo "✅ Dependencies berhasil diinstall!"
echo ""
echo "🚀 Untuk menjalankan bot:"
echo "   npm start"
echo ""
echo "📱 Setelah bot berjalan:"
echo "   1. Scan QR code yang muncul"
echo "   2. Kirim /settarget di grup/chat tujuan"
echo "   3. Bot akan otomatis mengirim notifikasi"
echo ""
echo "📖 Baca README.md untuk informasi lengkap"
echo ""