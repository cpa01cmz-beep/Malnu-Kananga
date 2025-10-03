# Memory Bank

Sistem memory bank yang komprehensif untuk menyimpan dan mengelola memori percakapan, fakta, preferensi, dan konteks dalam aplikasi AI.

## Fitur Utama

- **Penyimpanan Fleksibel**: Dukungan untuk localStorage dan cloud storage
- **Pencarian Cerdas**: Algoritma pencarian berbasis relevansi dengan skor similaritas
- **Auto-cleanup**: Pembersihan otomatis memori lama/rendah pentingnya
- **Event System**: Sistem event untuk monitoring operasi memory
- **TypeScript**: Full type safety dengan interface yang komprehensif
- **React Hook**: Hook khusus untuk integrasi mudah dengan React

## Struktur

```
src/memory/
├── types.ts              # Interface dan tipe TypeScript
├── MemoryBank.ts         # Kelas utama memory bank
├── config.ts             # Konfigurasi default dan preset
├── index.ts              # Export utama
├── services/
│   └── MemoryService.ts  # Business logic layer
├── storage/
│   ├── LocalStorageAdapter.ts   # Adapter localStorage
│   └── CloudStorageAdapter.ts   # Adapter cloud storage
├── utils/
│   └── memoryUtils.ts    # Utility functions
└── README.md             # Dokumentasi ini
```

## Penggunaan Dasar

### 1. Menggunakan MemoryBank secara langsung

```typescript
import { MemoryBank, schoolMemoryBankConfig } from './memory';

const memoryBank = new MemoryBank(schoolMemoryBankConfig);

// Menambah memori
const memory = await memoryBank.addMemory(
  'Informasi tentang pendaftaran siswa baru',
  'fact',
  { category: 'admission', priority: 'high' }
);

// Mencari memori
const results = await memoryBank.searchMemories({
  keywords: ['pendaftaran'],
  type: 'fact',
  limit: 10
});

// Mendapatkan memori relevan
const relevant = await memoryBank.getRelevantMemories('pertanyaan pengguna', 5);
```

### 2. Menggunakan React Hook

```typescript
import { useMemoryBank } from '../hooks/useMemoryBank';

function MyComponent() {
  const {
    memories,
    isLoading,
    addMemory,
    searchMemories,
    deleteMemory
  } = useMemoryBank();

  const handleAddMemory = async () => {
    await addMemory('Konten memori baru', 'conversation');
  };

  return (
    <div>
      {memories.map(memory => (
        <div key={memory.id}>
          {memory.content}
          <button onClick={() => deleteMemory(memory.id)}>
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Tipe Memori

- **conversation**: Percakapan antara user dan AI
- **fact**: Fakta atau informasi penting
- **preference**: Preferensi pengguna
- **context**: Konteks tambahan
- **system**: Pengaturan sistem

## Konfigurasi

### Konfigurasi Default (Sekolah)

```typescript
import { schoolMemoryBankConfig } from './memory';

const config = schoolMemoryBankConfig;
// Config untuk konteks sekolah dengan optimasi khusus
```

### Konfigurasi Custom

```typescript
const customConfig = {
  maxMemories: 2000,
  defaultImportance: 0.6,
  storageAdapter: new LocalStorageAdapter('custom_storage'),
  enableAutoCleanup: true,
  cleanupThreshold: 0.85
};
```

## Storage Adapters

### LocalStorage Adapter

```typescript
import { LocalStorageAdapter } from './memory/storage/LocalStorageAdapter';

const adapter = new LocalStorageAdapter('my_memories');
// Data disimpan di browser's localStorage
```

### Cloud Storage Adapter

```typescript
import { CloudStorageAdapter } from './memory/storage/CloudStorageAdapter';

const adapter = new CloudStorageAdapter({
  baseUrl: 'https://api.example.com',
  apiKey: 'your-api-key',
  timeout: 10000
});
// Data disimpan di cloud melalui REST API
```

## Event System

```typescript
memoryBank.on('memoryAdded', (memory) => {
  console.log('Memori baru ditambahkan:', memory);
});

memoryBank.on('cleanupPerformed', (deletedCount) => {
  console.log(`${deletedCount} memori dihapus`);
});
```

## Utility Functions

```typescript
import { calculateImportance, extractKeywords, formatMemoryForDisplay } from './memory';

// Hitung importance otomatis
const importance = calculateImportance(content, 'fact', metadata);

// Ekstrak keywords
const keywords = extractKeywords(content, 10);

// Format untuk display
const displayText = formatMemoryForDisplay(memory);
```

## Integrasi dengan Gemini Service

Memory bank sudah terintegrasi dengan `geminiService.ts`:

```typescript
import { getAIResponseStream, getConversationHistory } from './services/geminiService';

// AI response otomatis menyimpan percakapan
const response = getAIResponseStream(userMessage, history);

// Ambil history percakapan
const history = await getConversationHistory(10);
```

## Best Practices

1. **Importance Scoring**: Gunakan importance yang sesuai untuk tipe konten
2. **Metadata**: Manfaatkan metadata untuk kategori dan filtering
3. **Cleanup**: Aktifkan auto-cleanup untuk performa optimal
4. **Error Handling**: Selalu handle error saat operasi memory
5. **Type Safety**: Gunakan TypeScript types untuk development yang aman

## Troubleshooting

### Common Issues

1. **Memory tidak tersimpan**: Pastikan storage adapter dikonfigurasi dengan benar
2. **Search tidak bekerja**: Periksa keywords dan query parameters
3. **Performance issues**: Kurangi maxMemories atau aktifkan auto-cleanup
4. **TypeScript errors**: Pastikan import types dengan benar

### Debug Tips

```typescript
// Cek stats memory bank
const stats = await memoryBank.getStats();
console.log(stats);

// Monitor events
memoryBank.on('memoryAdded', (memory) => {
  console.log('Memory added:', memory.id);
});