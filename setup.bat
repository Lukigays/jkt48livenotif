@echo off
title JKT48 Live WhatsApp Bot - Setup

echo ╔═══════════════════════════════════════════╗
echo ║   🤖 JKT48 Live Notifier Bot Setup       ║
echo ╚═══════════════════════════════════════════╝
echo.

:: Cek Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js belum terinstall!
    echo 📥 Download dari: https://nodejs.org
    echo    Pilih versi LTS ^(18 atau lebih baru^)
    pause
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node -v') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:v=%

if %NODE_MAJOR% lss 18 (
    echo ❌ Node.js versi terlalu lama! Minimal v18
    node -v
    pause
    exit /b 1
)

echo ✅ Node.js terdeteksi
node -v
echo.

:: Install dependencies
echo 📦 Menginstall dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Gagal install dependencies!
    pause
    exit /b 1
)

echo.
echo ✅ Dependencies berhasil diinstall!
echo.
echo 🚀 Untuk menjalankan bot:
echo    npm start
echo.
echo 📱 Setelah bot berjalan:
echo    1. Scan QR code yang muncul
echo    2. Kirim /settarget di grup/chat tujuan
echo    3. Bot akan otomatis mengirim notifikasi
echo.
echo 📖 Baca README.md untuk informasi lengkap
echo.
pause