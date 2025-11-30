
# Arsitektur Sistem

Dokumen ini menjelaskan rancangan teknis tingkat tinggi dari aplikasi Website & Portal Pintar MA Malnu Kananga.

## Diagram Alir Data (High Level)

```mermaid
graph TD
    User[Pengguna] --> |Akses Web| Frontend[React App (Vite)]
    
    subgraph "Frontend Layer"
        Frontend --> |State Management| AppState[React State]
        AppState --> |Persistence Strategy| CustomHooks[Custom Hooks]
        CustomHooks --> |Logic| UseLocalStorage[useLocalStorage.ts]
        UseLocalStorage --> |Storage| BrowserStorage[LocalStorage (JSON)]
        
        Frontend --> |Render UI| Components[Komponen UI]
    end
    
    subgraph "AI Services Layer"
        Frontend --> |Chat & Edit Prompt| GeminiAPI[Google Gemini API]
        GeminiAPI --> |Response (Text/JSON)| Frontend
    end
    
    subgraph "Backend Layer (Cloudflare)"
        Frontend --> |Request Login| WorkerAuth[Worker: Auth Endpoint]
        WorkerAuth --> |Verifikasi| D1[Cloudflare D1 (SQL)]
        WorkerAuth --> |Kirim Email| MailChannels
        
        Frontend --> |Cari Konteks Chat| WorkerRAG[Worker: RAG Endpoint]
        WorkerRAG --> |Vector Search| Vectorize[Cloudflare Vectorize]
        WorkerRAG --> |Embeddings| CFAi[Cloudflare Workers AI]
    end
```

## Komponen Utama

### 1. State Management & Persistence (`src/hooks/useLocalStorage.ts`)
*   **Peran**: Mengelola sinkronisasi antara React State dan LocalStorage browser.
*   **Fungsi**: Memastikan data seperti User Session, Nilai Siswa, dan Konten Website tetap tersimpan (persist) meskipun halaman di-refresh.
*   **Kunci Penyimpanan**: Dikelola secara terpusat di `src/constants.ts` untuk mencegah duplikasi dan kesalahan pengetikan key.

### 2. App.tsx (The Orchestrator)
*   Mengatur routing halaman berdasarkan state autentikasi (`isLoggedIn`) dan peran pengguna (`userRole`).
*   Menginisialisasi state global aplikasi.

### 3. geminiService.ts (The AI Bridge)
*   **`getAIResponseStream`**: Menangani chat. Menggabungkan konteks RAG (Backend) + Konteks Lokal (State React terbaru) agar AI tahu perubahan terkini di website.
*   **`getAIEditorResponse`**: Memaksa output JSON yang valid dari Gemini untuk mengubah struktur konten website secara programatik.

### 4. Cloudflare Worker (The Backpack)
*   **Auth**: Menangani pengiriman magic link email.
*   **RAG**: Endpoint pencarian vektor untuk memberikan pengetahuan dasar sekolah kepada AI.

## Struktur Direktori

*   `src/components`: Komponen UI (Atomic & Organism).
*   `src/hooks`: Custom React Hooks (`useLocalStorage`).
*   `src/services`: Integrasi API eksternal (Gemini, Fetch).
*   `src/data`: Data inisial/default jika LocalStorage kosong.
*   `src/types.ts`: Definisi tipe TypeScript global.
*   `src/constants.ts`: Konstanta global sistem.
