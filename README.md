# ETERNAL Band — Website Pemesanan

Website statis satu halaman untuk pemesanan ETERNAL Band. Client mengisi form,
lalu WhatsApp terbuka dengan pesan yang sudah tersusun rapi — tinggal tekan kirim.

**Tanpa server, tanpa database, tanpa proses build.** Cukup upload isi folder ini.

---

## ⚠️ Aturan paling penting

**Jangan pernah menambahkan nomor rekening / e-wallet ke file mana pun di
folder ini.** Detail pembayaran hanya dikirim lewat chat WhatsApp resmi.
Nomor rekening yang dipublikasikan terbuka rawan disalahgunakan orang lain
untuk menipu calon client.

Harga paket, harga tambahan player, diskon, dan DP minimal **sekarang
ditampilkan** di website sebagai daya tarik (sejak November 2026). Kalau
harga berubah, ubah di semua tempat yang tercantum di bagian
*Ubah harga* di bawah.

---

## Isi folder

```
index.html          seluruh isi halaman (teks, form, FAQ, ketentuan)
style.css           seluruh tampilan
script.js           validasi form + penyusun pesan WhatsApp
assets/
  logo.svg          wordmark ETERNAL (outline, ikut warna teks)
  favicon.svg       ikon tab browser
  og-image.png      gambar preview saat link dibagikan di WhatsApp
  fonts/            Anton + Inter (self-hosted, tidak perlu internet)
.nojekyll           wajib ada, biar GitHub Pages tidak mengubah struktur folder
```

---

## Cara upload ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `eternal-band`.
2. Upload **seluruh isi folder ini** ke repository (bukan foldernya, tapi isinya —
   `index.html` harus berada di paling atas).
3. Buka tab **Settings → Pages**.
4. Bagian *Source*, pilih **Deploy from a branch**.
5. Pilih branch **main**, folder **/ (root)**, lalu **Save**.
6. Tunggu 1–2 menit. Website aktif di
   `https://eternalband.github.io/eternal-band/`

Setiap kali Anda mengubah file dan menyimpannya di GitHub, website otomatis
ter-update dalam 1–2 menit.

---

## Cara mengubah isi website

### Ganti nomor WhatsApp

Buka `script.js`, baris paling atas:

```js
var CONFIG = {
  waNumber: '62882003195388',
```

Tulis dengan format internasional: kode negara `62`, **tanpa** tanda `+`,
**tanpa** angka `0` di depan, dan tanpa spasi. Nomor `0882-0031-95388`
menjadi `62882003195388`.

Nomor juga muncul di dua tempat lain di `index.html` — cari `wa.me` dengan
Ctrl+F dan ganti semuanya.

### Ubah harga

Harga dasar dihitung **per 1 jam tampil**. Rumusnya (dari dokumen harga internal):
`harga = biaya kehadiran + jam × jumlah player × Rp100.000`.

Angka harga muncul di beberapa tempat di `index.html` — cari dengan Ctrl+F `Rp`
dan `000`:

- `<meta name="description">` dan `og:description` (mulai Rp1,5 juta)
- hero (`hero-price`)
- kartu paket (`pkg-price`) dan tabel *Harga per durasi* (`price-table`)
- *Tambahan player* (`addons`), *Diskon & DP* (`deals`)
- pilihan paket & tambahan player di form (`rc-sub`)
- FAQ dan Syarat & ketentuan

Harga Orgen Tunggal saat ini masih "Harga via WhatsApp".

### Ubah isi paket

Buka `index.html`, cari bagian `<!-- ================= PAKET -->`.
Setiap paket ada di dalam satu blok `<article class="card card--pkg">`.
Ubah nama paket, angka jumlah player, dan daftar instrumennya langsung di situ.

Paket Orgen Tunggal ada di blok `<article class="card card--orgen">`.

Kalau menambah atau mengganti nama paket, jangan lupa ubah juga pilihannya
di form — cari `<div class="radio-cards" id="paketCards">`. Nama paket di kedua
tempat harus **persis sama**, karena tombol "Pilih paket ini" mencocokkannya
lewat atribut `data-package`.

### Ubah FAQ, syarat & ketentuan, atau teks lain

Semua teks ada di `index.html` sebagai tulisan biasa. Cari kalimat yang ingin
diubah dengan Ctrl+F, lalu tulis ulang. Jangan menghapus tanda `<` dan `>`
di sekitarnya.

### Ubah pesan penutup WhatsApp

Di `script.js`, bagian `CONFIG.closing`.

---

## Cara mengetes sebelum upload

Klik dua kali `index.html` — halaman terbuka di browser. Semua fitur berfungsi,
kecuali font yang mungkin tampil sebagai font cadangan (ini normal saat dibuka
langsung dari folder, dan akan benar setelah di-upload).

**Yang perlu dites:**

- Kosongkan form lalu tekan kirim → harus muncul peringatan merah di tiap kolom wajib.
- Isi lengkap lalu tekan kirim → WhatsApp terbuka dengan pesan sudah tersusun.
- Kosongkan "Request Lagu" → baris itu harus **hilang total** dari pesan, tidak
  menyisakan label kosong.
- Pilih jenis event "Pensi" → durasi terkunci 1 jam, Orgen Tunggal tidak bisa dipilih,
  dan catatan rider muncul.
- Pilih paket Platinum → pilihan tambahan Saxophone hilang (sudah termasuk).
- Tes di HP, bukan cuma di laptop — mayoritas client membuka dari HP.

---

## Setelah punya foto & video panggung

Bagian yang paling layak ditambahkan berikutnya adalah **galeri**. Foto live
adalah bukti terkuat untuk jasa band, dan saat ini website sengaja dirancang
kuat hanya dengan tipografi karena belum ada dokumentasi. Sisipkan section baru
di antara `#layanan` dan `#paket`.

---

## Domain sendiri (opsional)

Kalau nanti punya domain seperti `eternalband.id`:

1. Buat file bernama `CNAME` (tanpa ekstensi) berisi satu baris: nama domain Anda.
2. Di penyedia domain, arahkan DNS ke GitHub Pages.
3. Di **Settings → Pages**, isi kolom *Custom domain*, lalu centang
   **Enforce HTTPS**.

Setelah domain aktif, perbarui juga baris `<link rel="canonical">` dan
`<meta property="og:image">` di `index.html` agar memakai alamat domain penuh —
ini membuat preview link di WhatsApp tampil dengan benar.
