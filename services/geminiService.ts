
// This is a MOCK service to simulate a Cloudflare Worker AI endpoint.
// In a real application, this would make an API call to your Worker.
// The business logic (RAG, Vectorize, System Prompt) lives in the Worker.

const SYSTEM_PROMPT = `Anda adalah 'Asisten MA Malnu Kananga', chatbot yang ramah, sopan, dan membantu. Gunakan bahasa Indonesia yang baik dan benar. Prioritaskan keamanan dan privasi siswa dalam setiap jawaban. Jika tidak tahu, sarankan untuk menghubungi pihak sekolah secara langsung melalui kontak di website.`;

const responses: Record<string, string> = {
  "default": "Tentu, saya akan coba bantu. Ada yang bisa ditanyakan mengenai MA Malnu Kananga?",
  "ppdb": "PPDB (Penerimaan Peserta Didik Baru) biasanya dibuka sekitar bulan Mei-Juni. Untuk informasi paling akurat, silakan kunjungi halaman PPDB di website kami atau hubungi panitia PPDB. Ada lagi yang bisa dibantu?",
  "acara": "Untuk jadwal acara sekolah, cara terbaik adalah melihat Kalender Acara di website. Acara terdekat adalah Lomba Cerdas Cermat antar kelas pada tanggal 25 bulan ini.",
  "lokasi": "MA Malnu Kananga berlokasi di Jl. Pendidikan No. 1, Kananga. Anda dapat menemukan peta detail di halaman Kontak & Lokasi.",
  "fallback": "Mohon maaf, saya kurang mengerti pertanyaan Anda atau tidak memiliki informasi tersebut. Untuk pertanyaan yang lebih spesifik, silakan hubungi pihak sekolah melalui informasi kontak yang tersedia di website.",
};

function getResponseKey(message: string): string {
  const lowerCaseMessage = message.toLowerCase();
  if (lowerCaseMessage.includes('ppdb') || lowerCaseMessage.includes('daftar')) {
    return 'ppdb';
  }
  if (lowerCaseMessage.includes('acara') || lowerCaseMessage.includes('kegiatan') || lowerCaseMessage.includes('event')) {
    return 'acara';
  }
  if (lowerCaseMessage.includes('lokasi') || lowerCaseMessage.includes('alamat')) {
    return 'lokasi';
  }
  return 'fallback';
}

// Simulates a streaming response from the AI
async function* streamText(text: string) {
  const words = text.split(' ');
  for (const word of words) {
    yield `${word} `;
    // simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
  }
}

// This function simulates `chat.sendMessageStream`
export async function* getAIResponseStream(message: string): AsyncGenerator<string> {
    const responseKey = getResponseKey(message);
    const responseText = responses[responseKey];

    // In a real implementation, you would be iterating over the stream from the Worker endpoint.
    // for await (const chunk of workerResponse) { yield chunk.text; }
    yield* streamText(responseText);
}

export const initialGreeting = "Assalamualaikum! Saya Asisten AI MA Malnu Kananga. Ada yang bisa saya bantu terkait informasi sekolah, pendaftaran, atau kegiatan?";

