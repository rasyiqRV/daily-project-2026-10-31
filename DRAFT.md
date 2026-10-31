# Pomodoro Timer Web App

## Deskripsi
Aplikasi web Pomodoro Timer dengan antarmuka modern dan gelap. Membantu pengguna mengatur waktu fokus dan istirahat menggunakan teknik Pomodoro. Dilengkapi dengan fitur daftar tugas, statistik sesi, dan pengaturan yang dapat dikustomisasi.

## Teknologi
- **HTML5** — Struktur halaman
- **CSS3** — Styling modern dengan CSS variables, flexbox, grid, animasi, dan SVG progress ring
- **JavaScript (Vanilla)** — Logika timer, Web Audio API untuk alarm, Notification API, dan localStorage

## Fitur
- Timer Pomodoro dengan 3 mode: Fokus, Istirahat Pendek, Istirahat Panjang
- Progress ring animasi (SVG)
- Daftar tugas terintegrasi (CRUD, tersimpan di localStorage)
- Statistik sesi (jumlah sesi selesai dan total waktu fokus)
- Pengaturan durasi yang dapat dikustomisasi
- Notifikasi browser dan audio beep saat timer selesai
- Keyboard shortcuts (Space = mulai/jeda, R = reset)
- Dark mode by default
- Responsive design

## Cara Menjalankan
1. Buka file `index.html` langsung di browser, atau
2. Gunakan live server:
   ```bash
   npx serve .
   ```

## Tingkat Kompleksitas
**Menengah** — Melibatkan SVG progress ring, Web Audio API, Notification API, state management, dan localStorage.

---
*Dibuat oleh Daily Project Builder — 31 Oktober 2026*
