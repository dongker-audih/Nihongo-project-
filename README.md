# Nihongo Quest

Web app belajar bahasa Jepang untuk pemula, dengan fondasi JLPT N5.

## Fitur versi awal
- Login username tanpa password
- Simpan progres di server (`data/progress.json`)
- Jalur Hiragana, Katakana, Kosakata, Kanji, dan Tata Bahasa
- Latihan pilihan ganda
- XP, level, progres kategori
- Catatan materi sulit

## Menjalankan lokal
Butuh Node.js 18 atau lebih baru.
```bash
npm start
```
Lalu buka `http://localhost:3000`.

## Deploy ke Pterodactyl
1. Upload/commit seluruh isi folder ini ke repository Git.
2. Buat server Node.js di panel dan hubungkan repository.
3. Pastikan startup command menjalankan `npm start` atau `node index.js`.
4. Pastikan panel mengatur environment `PORT` sesuai port alokasi. Aplikasi mendengarkan `0.0.0.0`.
5. Buka alamat server yang diberikan panel.

Tidak memakai dependency npm eksternal. Folder `data` harus dapat ditulis oleh proses Node.js dan sebaiknya berada pada storage persisten.

## Catatan penting tentang login
Login username-only bukan autentikasi aman. Siapa pun yang mengetahui username dapat membuka dan mengubah progres akun tersebut. Jangan gunakan username yang sama dengan akun pribadi penting dan jangan simpan informasi sensitif. Untuk versi publik/multi-pengguna, sebaiknya tambahkan password atau autentikasi lain.

## Rencana pengembangan
- Lebih banyak baris hiragana/katakana, dakuten, handakuten, dan kombinasi yōon
- Kosakata dan kanji N5 yang ditinjau berdasarkan daftar belajar yang dipilih
- Penjelasan partikel lengkap (は, が, を, に, で, の, へ, と, も, から, まで, dll.)
- Review materi sulit yang benar-benar membuat kuis khusus
- Audio pelafalan, streak harian, dan sinkronisasi lintas perangkat
