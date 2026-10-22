# Duit Gua: Aplikasi Pengelola Keuangan Pribadi (Mobile First)

Aplikasi pencatatan dan pengelolaan keuangan pribadi modern dengan antarmuka mobile-first, responsif, dan offline-first (seluruh data tersimpan aman di browser perangkat).

## Fitur Utama

1. **Ringkasan Saldo & Arus Kas (Dashboard)**
   - Total kekayaan bersih dari semua akun/dompet.
   - Perhitungan otomatis pemasukan, pengeluaran, dan surplus/defisit bulan berjalan.
   - Grafik proporsi pengeluaran per kategori (SVG Donut Chart) dengan persentase real-time.
   - Riwayat transaksi terkini dengan akses cepat ubah dan hapus.

2. **Pencatatan Transaksi Cepat (+)**
   - Tombol mengambang (Floating Action Button) di navigasi bawah untuk catat pengeluaran dan pemasukan seketika.
   - Input nominal Rupiah otomatis dengan tombol pintas nominal (+10k, +50k, +100k, +500k).
   - Pemilihan kategori dengan ikon semantik dan warna penanda.
   - Pemilihan dompet/rekening sumber pembayaran.
   - Catatan transaksi opsional dan tanggal fleksibel.

3. **Pindah Saldo Antar Dompet (Transfer)**
   - Pindahkan saldo antar akun (misal: Tarik tunai dari BCA ke Dompet Tunai, atau Top Up GoPay dari Rekening Bank).
   - Validasi saldo mencukupi dan pencatatan riwayat transfer otomatis.

4. **Daftar & Penyaringan Transaksi**
   - Pencarian berdasarkan catatan, nama kategori, atau nama dompet.
   - Filter tipe: Semua, Pengeluaran, Pemasukan, Transfer.
   - Filter per dompet dan periode bulan.
   - Pengelompokan daftar transaksi berdasarkan tanggal (Hari ini, Kemarin, dst).

5. **Perencanaan & Batas Anggaran (Budgeting)**
   - Pasang batas maksimal pengeluaran bulanan per kategori.
   - Indikator progres visual dengan peringatan warna (Hijau: Aman, Kuning: Mendekati limit, Merah: Overbudget).

6. **Manajemen Dompet & Akun Keuangan**
   - Tambah berbagai jenis akun: Uang Tunai, Rekening Bank, E-Wallet, dan Investasi.
   - Penyesuaian saldo awal dan warna aksen kartu.

7. **Cadangkan & Pulihkan Data (Backup & Restore)**
   - Ekspor data transaksi ke file format JSON.
   - Impor kembali file cadangan JSON kapan saja.
   - Pilihan reset ke data demo atau bersihkan data untuk mulai dari awal.

8. **Aksesibilitas & Tema**
   - Dukungan penuh Mode Gelap (Dark Mode) dan Mode Terang (Light Mode).
   - Navigasi keyboard (Tab, Enter, Escape).
   - Desain ramah sentuhan (touch-friendly) dengan area sentuh minimal 44px.

## Cara Menjalankan Aplikasi

```bash
# Jalankan development server
npm run dev

# Atau jalankan build produksi
npm run build
npm run preview
```
Aplikasi dapat diakses melalui browser di `http://localhost:3000` atau `http://localhost:3001`.
