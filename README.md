# Karirfy Web (`karirfy-web`)

Situs web komersial & dokumentasi legal publik untuk aplikasi iOS **Karirfy by Dewantara Project**.

## Halaman

- `/` (`index.html`): Showcase antarmuka iOS, Kurikulum 4 Fase, 6 jalur seleksi, FAQ, dan informasi resmi aplikasi.
- `/privacy` (`privacy.html`): Kebijakan Privasi & panduan penghapusan akun permanen (`#choices` / `#delete-account`).
- `/terms` (`terms.html`): Ketentuan Layanan, lisensi Apple Standard EULA, dan ketentuan perpanjangan otomatis StoreKit 2.
- `/support` (`support.html`): Pusat bantuan pengguna & troubleshooting iOS (`dewantaraproject.id@gmail.com`).

## Deployment (Zero-Build Static)

Proyek ini adalah situs statis murni tanpa langkah build. Arahkan **Output Directory** ke `.` di Cloudflare Pages atau Vercel (`cleanUrls: true` dan `_redirects` sudah dikonfigurasi).
