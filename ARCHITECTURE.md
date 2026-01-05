
# Arsitektur Sistem

Dokumen ini menjelaskan rancangan teknis tingkat tinggi dari aplikasi Website & Portal Pintar MA Malnu Kananga.

## Diagram Alir Data (High Level)

```mermaid
graph TD
    User[Pengguna] --> |Akses Web| Frontend[React App (Vite)]
    
    subgraph "Frontend Layer"
        Frontend --> |State Management| AppState[React State]
        AppState --> |Persistence Strategy| CustomHooks[Custom Hooks]
        CustomHooks --> |Logic| ApiService[apiService.ts]
        ApiService --> |HTTP Requests| Backend[Cloudflare Workers]
        
        Frontend --> |Render UI| Components[Komponen UI]
    end
    
    subgraph "AI Services Layer"
        Frontend --> |Chat & Edit Prompt| GeminiAPI[Google Gemini API]
        GeminiAPI --> |Response (Text/JSON)| Frontend
    end
    
    subgraph "Backend Layer (Cloudflare)"
        Frontend --> |Auth Request| WorkerAuth[Worker: JWT Auth]
        WorkerAuth --> |Verify & Store| Sessions[JWT Sessions]
        WorkerAuth --> |Query Users| D1[Cloudflare D1 Database]
        
        Frontend --> |CRUD Operations| WorkerAPI[Worker: API Endpoints]
        WorkerAPI --> |SQL Operations| D1
        
        Frontend --> |Cari Konteks Chat| WorkerRAG[Worker: RAG Endpoint]
        WorkerRAG --> |Vector Search| Vectorize[Cloudflare Vectorize]
        WorkerRAG --> |Embeddings| CFAi[Cloudflare Workers AI]
    end
    
    subgraph "Storage Layer"
        D1 -->|Relational Data| Tables[15+ Tables]
        WorkerAPI -->|File Upload| R2[Cloudflare R2 Storage]
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

### 4. Cloudflare Worker (The Backend Server)
*   **Authentication**: JWT-based authentication dengan session management
*   **API Endpoints**: CRUD operations untuk users, ppdb_registrants, inventory, school_events, dll
*   **RAG**: Endpoint pencarian vektor untuk memberikan pengetahuan dasar sekolah kepada AI
*   **Security**: CORS protection, input validation, audit logging

## Struktur Direktori

*   `src/components`: Komponen UI (Atomic & Organism).
*   `src/hooks`: Custom React Hooks (`useLocalStorage`, `useAPI`).
*   `src/services`:
    *   `apiService.ts`: Backend API client (Users, PPDB, Inventory, Events, Auth)
    *   `geminiService.ts`: Integrasi AI (Gemini, Fetch)
*   `src/data`: Data inisial/default untuk seeding.
*   `src/types.ts`: Definisi tipe TypeScript global.
*   `src/config.ts`: Konfigurasi API dan feature flags.
*   `worker.js`: Cloudflare Worker backend server.
*   `schema.sql`: D1 Database schema SQL.
*   `BACKEND_GUIDE.md`: Panduan lengkap integrasi backend.
