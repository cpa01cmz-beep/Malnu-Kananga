
# Arsitektur Sistem

Dokumen ini menjelaskan rancangan teknis tingkat tinggi dari aplikasi Website & Portal Pintar MA Malnu Kananga.

## Diagram Alir Data (High Level)

```mermaid
graph TD
    User[Pengguna] --> |Akses Web| Frontend[React App (Vite)]
    
    subgraph "Frontend Layer"
        Frontend --> |State Lokal| AppState[React State (App.tsx)]
        AppState --> |Render| Components[UI Components]
        Frontend --> |Simpan Konten| LocalStorage[Browser Storage]
    end
    
    subgraph "AI Services Layer"
        Frontend --> |Chat & Edit Prompt| GeminiAPI[Google Gemini API]
        GeminiAPI --> |JSON/Markdown| Frontend
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

### 1. App.tsx (The Brain)
- Bertindak sebagai *central store* sederhana.
- Menyimpan state global: `userRole`, `isLoggedIn`, `theme`, `featuredPrograms`, `latestNews`.
- Mengatur routing halaman berdasarkan state (Conditional Rendering).

### 2. geminiService.ts (The AI Bridge)
- **`getAIResponseStream`**: Menangani chat dengan pengguna. Menggabungkan konteks dari Backend (RAG) dan konteks Lokal (State React) untuk akurasi maksimal.
- **`getAIEditorResponse`**: Menangani perintah edit konten. Memaksa output JSON yang valid dari Gemini untuk merubah state aplikasi.

### 3. Cloudflare Worker (The Backpack)
- **Auth**: Menangani pengiriman magic link dan validasi token.
- **RAG**: Menerima pertanyaan, mengubahnya menjadi vektor, mencari dokumen mirip di Vectorize, dan mengembalikan teks konteks ke frontend.

## Pola Desain (Design Patterns)

- **Component-Based**: UI dipecah menjadi bagian kecil (`Header`, `ProgramCard`, `StudentPortal`).
- **Service Layer**: Logika pemanggilan API dipisah ke folder `services/` agar komponen UI tetap bersih.
- **Generative UI**: UI tidak hanya statis, tapi bisa berubah struktur kontennya berdasarkan output JSON dari AI.
