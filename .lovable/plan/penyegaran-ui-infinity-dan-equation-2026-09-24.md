# Penyegaran UI Infinity dan Equation

## Hasil yang dibangun
- Menata ulang kanvas utama mengikuti komposisi referensi: judul terpusat, papan Ask Infinity berbentuk kartu oval, aksi cepat di sekelilingnya, lalu empat kartu kategori yang rapi.
- Mempertahankan identitas Infinity dengan soft mint, deep teal, tipografi editorial, dan ikon Lucide—tanpa menyalin ikon atau bentuk khas SciSpace.
- Menyeragamkan ikon fitur dalam lingkaran 36px berwarna mint dengan ikon deep teal.
- Menghapus Google Workspace dari menu Plus; menu hanya menampilkan Foto/Gambar, Dokumen, dan Video.
- Memastikan setiap aksi cepat dan item pada empat kategori memasukkan chip konteks ke papan pencarian.
- Mengganti penamaan terkait menjadi “Equation” dan meningkatkan alatnya menjadi kalkulator bergaya Photomath: input rumus, keypad ilmiah, pratinjau persamaan, langkah penyelesaian, dan hasil.

## Struktur konten
- Empat kategori: **RISET**, **MENULIS**, **DATA**, dan **ALAT AI**.
- Ikon dipetakan ke Lucide sesuai instruksi: PenTool/FileText/Code2/LayoutTemplate/BarChart3/LineChart/Quote/Database/Calculator/CloudUpload.
- Kartu kategori putih, border tipis, item interaktif dengan latar mint saat diarahkan atau dipilih.

## Detail teknis
- Tetap client-side memakai state dan penyimpanan lokal yang sudah ada.
- Kalkulator Equation memakai parser matematika aman yang kompatibel dengan browser; tidak mengeksekusi kode pengguna.
- Menjaga alur AI, navigasi, tema, dan fitur yang sudah ada.
- Memvalidasi desktop dan mobile, interaksi menu lampiran, chip konteks, Equation, serta hasil build tanpa error TypeScript.
