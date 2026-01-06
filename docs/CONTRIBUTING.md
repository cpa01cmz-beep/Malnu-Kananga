# Panduan Kontribusi

**Created**: 2025-01-01  
**Last Updated**: 2026-01-05  
**Version**: 2.1.0  
**Status**: Active

Terima kasih atas minat Anda untuk berkontribusi pada proyek Website MA Malnu Kananga! Kontribusi Anda sangat kami hargai.

## Cara Berkontribusi

### Melaporkan Bug

-   Jika Anda menemukan bug, silakan buat "Issue" baru di repositori GitHub.
-   Jelaskan bug tersebut secara rinci, termasuk langkah-langkah untuk mereproduksinya, apa yang Anda harapkan terjadi, dan apa yang sebenarnya terjadi.
-   Sertakan tangkapan layar atau video jika memungkinkan.

### Menyarankan Fitur Baru

-   Untuk menyarankan fitur baru, buat "Issue" baru dengan label `enhancement`.
-   Jelaskan ide Anda sejelas mungkin dan mengapa fitur tersebut akan bermanfaat bagi proyek.

### Proses Pull Request (PR)

1.  **Fork Repositori**: Buat salinan (fork) dari repositori ini ke akun GitHub Anda.
2.  **Buat Branch Baru**: Buat branch baru dari `main` untuk perubahan Anda. Gunakan nama branch yang deskriptif (misalnya, `fitur/tambah-halaman-galeri` atau `perbaikan/bug-modal-login`).
3.  **Lakukan Perubahan**: Tulis kode Anda di branch yang baru dibuat.
4.  **Commit Perubahan**: Buat commit untuk setiap perubahan logis yang Anda buat. Gunakan pesan commit yang jelas dan deskriptif.
5.  **Push ke Fork**: Push perubahan Anda ke repositori fork Anda.
6.  **Buat Pull Request**: Buka Pull Request dari branch Anda ke branch `main` repositori ini. Pastikan untuk menjelaskan perubahan yang Anda buat di deskripsi PR.

## Panduan Gaya & Konvensi

### Pesan Commit

Kami mendorong penggunaan [Conventional Commits](https://www.conventionalcommits.org/). Ini membantu menjaga riwayat commit tetap terorganisir. Contoh:

-   `fitur: Menambahkan halaman galeri foto`
-   `perbaikan: Memperbaiki masalah tampilan header di mobile`
-   `dok: Memperbarui README dengan instruksi backend`
-   `gaya: Merapikan format kode di komponen Footer`
-   `refactor: Mengubah cara state dikelola di App.tsx`

### Gaya Kode

-   **TypeScript/React**: Ikuti praktik terbaik React modern, seperti menggunakan *functional components* dan *hooks*. Gunakan TypeScript untuk semua komponen baru.
-   **Styling**: Gunakan kelas utilitas dari **Tailwind CSS** untuk semua styling. Hindari penulisan CSS kustom kecuali benar-benar diperlukan.
-   **Keterbacaan**: Tulis kode yang bersih dan mudah dibaca. Tambahkan komentar jika Anda menulis logika yang kompleks.

## Keamanan Pemindaian Rahasia (Secrets Scanning)

Proyek ini menggunakan **detect-secrets** untuk memindahi potensi kredensial dan rahasia dalam kode berkas.

### Prasyarat

Sebelum menjalankan pemindaian rahasia, pastikan Anda memiliki Python dan pip diinstal:

```bash
# Instal detect-secrets (Python)
pip3 install detect-secrets==1.5.0

# Jalankan pemindaian rahasia
npm run secrets:scan
```

### Memperbarui Baseline

Jika Anda menambahkan file baru yang mengandung string yang terlihat seperti rahasia tapi sebenarnya bukan (seperti contoh API key token), Anda perlu memperbarui baseline:

```bash
# Scan ulang dan perbarui baseline
detect-secrets scan --baseline .secrets.baseline
```

### Praktik Terbaik

- Jangan pernah commit kredensial nyata ke repositori
- Gunakan environment variables untuk konfigurasi sensitif
- Jalankan `npm run secrets:scan` sebelum membuat pull request

Terima kasih sekali lagi atas kontribusi Anda!