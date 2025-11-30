
# Standar Pengkodean (Coding Standards)

## 1. TypeScript & React
- **Interface Explicit**: Selalu gunakan `interface` untuk mendefinisikan props komponen dan struktur data. Hindari penggunaan `any`.
  ```ts
  // Benar
  interface UserProps { name: string; age: number; }
  // Salah
  const User = (props: any) => ...
  ```
- **Functional Components**: Gunakan `React.FC<Props>` untuk komponen.
- **Named Exports**: Gunakan named exports untuk utilitas, default exports untuk komponen utama (Page/Container).

## 2. Styling (Tailwind CSS)
- **Utility-First**: Gunakan kelas utility Tailwind. Hindari membuat file CSS kustom (`.css`) kecuali untuk animasi global `@keyframes`.
- **Dark Mode**: Selalu sertakan varian `dark:` untuk setiap warna latar belakang atau teks utama.
  ```tsx
  <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  ```

## 3. Struktur Folder
- `/components`: Komponen UI yang dapat digunakan kembali (Button, Card, Modal).
- `/components/icons`: Ikon SVG murni.
- `/components/sections`: Bagian-bagian besar halaman landing page.
- `/services`: Logika bisnis dan pemanggilan API (Gemini, Fetch).
- `/data`: Data statis atau konfigurasi default.
- `/types`: Definisi tipe TypeScript global.

## 4. AI Prompting
- **System Instructions**: Saat memanggil Gemini, selalu sertakan `systemInstruction` yang jelas untuk membatasi ruang lingkup jawaban AI.
- **JSON Mode**: Gunakan `responseMimeType: "application/json"` saat membutuhkan output data terstruktur dari AI.
