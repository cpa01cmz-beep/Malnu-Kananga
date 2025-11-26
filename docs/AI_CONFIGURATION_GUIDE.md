# 🤖 AI Configuration Guide - MA Malnu Kananga

## 🌟 Overview

This guide covers the complete configuration and optimization of the AI system in MA Malnu Kananga School Portal, including vector database setup, similarity tuning, and AI model configuration.

---

**AI Configuration Guide Version: 1.3.1**  
**Last Updated: November 24, 2024**  
**AI System Status: Production Ready**

## 🏗️ AI System Architecture

### Core Components
- **Google Gemini AI**: Language model for chat responses
- **Cloudflare Vectorize**: Vector database for semantic search
- **Embedding Model**: @cf/baai/bge-base-en-v1.5 for text embeddings
- **RAG System**: Retrieval-Augmented Generation for context-aware responses

### Data Flow
1. User sends message → Worker receives request
2. Generate embedding for user query
3. Search vector database for relevant documents
4. Combine context with user message
5. Send to Gemini AI for response generation
6. Return response to user

---

## 🔧 Vector Database Configuration

### 1. Vectorize Index Setup

#### Create Vector Index
```bash
# Create vector database with correct dimensions
wrangler vectorize create malnu-kananga-index \
  --dimensions=768 \
  --metric=cosine \
  --description="MA Malnu Kananga AI Knowledge Base"
```

#### Verify Index Configuration
```bash
# Check index details
wrangler vectorize describe malnu-kananga-index

# Expected output:
# Index: malnu-kananga-index
# Dimensions: 768
# Metric: cosine
# Description: MA Malnu Kananga AI Knowledge Base
```

#### Update Worker Configuration
```toml
# wrangler.toml
[[vectorize]]
binding = "VECTORIZE_INDEX"
index_name = "malnu-kananga-index"

# AI model binding
ai = { binding = "AI" }
```

### 2. Embedding Model Configuration

#### Model Specifications
- **Model**: @cf/baai/bge-base-en-v1.5
- **Dimensions**: 768
- **Language**: Multilingual (optimized for English, supports Indonesian)
- **Use Case**: Semantic similarity and document retrieval

#### Embedding Generation
```javascript
// In worker.js - embedding generation
const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
  text: userMessage
});

// Result: Array of 768 float values
```

### 3. Document Seeding

#### Seed Vector Database
```bash
# Seed with school information (run once after deployment)
curl https://your-worker-url.workers.dev/seed

# Expected response:
# Successfully seeded 10 documents.
```

#### Document Structure
```javascript
// Each document in worker.js documents array:
{
  id: "doc_001",
  text: "Profil Sekolah: Madrasah Aliyah MALNU Kananga...",
  metadata: {
    category: "profile",
    title: "Profil Sekolah",
    priority: "high"
  }
}
```

#### Current Document Categories
- **Profile**: School information and history
- **Programs**: Academic and extracurricular programs
- **PPDB**: New student admission information
- **Location**: School address and contact information
- **Contact**: Communication channels

---

## ⚙️ Similarity Configuration

### 1. Similarity Thresholds

#### Default Thresholds
```javascript
// In worker.js - similarity thresholds
const SIMILARITY_THRESHOLDS = {
  chat: 0.75,        // Standard chat queries
  student_support: 0.7,  // Lower for support queries
  monitoring: 0.6   // Lowest for monitoring resources
};
```

#### Threshold Optimization
- **0.75+**: High confidence, very relevant documents
- **0.70-0.75**: Good relevance, useful context
- **0.60-0.70**: Moderate relevance, supplementary context
- **<0.60**: Low relevance, typically excluded

#### Adjusting Thresholds
```javascript
// For more permissive matching (more results)
const CHAT_THRESHOLD = 0.70;

// For stricter matching (higher quality results)
const CHAT_THRESHOLD = 0.80;

// For testing/debugging
const CHAT_THRESHOLD = 0.50; // Include more results
```

### 2. Top-K Results Configuration

#### Default Settings
```javascript
// Number of documents to retrieve
const TOP_K_RESULTS = {
  chat: 3,              // Standard chat
  student_support: 5,   // More context for support
  monitoring: 10        // Comprehensive monitoring data
};
```

#### Optimization Guidelines
- **3-5 documents**: Good for focused queries
- **5-10 documents**: Better for complex support queries
- **10+ documents**: Only for comprehensive analysis

### 3. Vector Search Parameters

#### Search Configuration
```javascript
// Vector search implementation
const results = await env.VECTORIZE_INDEX.query(embedding, {
  topK: TOP_K_RESULTS.chat,
  namespace: "school-docs",
  includeMetadata: true,
  filter: {
    category: "profile"  // Optional filtering
  }
});
```

#### Advanced Filtering
```javascript
// Filter by document category
const categoryFilter = {
  category: { $eq: "programs" }
};

// Filter by priority
const priorityFilter = {
  priority: { $in: ["high", "medium"] }
};

// Combined filters
const combinedFilter = {
  category: { $eq: "programs" },
  priority: { $in: ["high", "medium"] }
};
```

---

## 🤖 AI Model Configuration

### 1. Gemini AI Setup

#### API Configuration
```bash
# Set Gemini API key as secret
wrangler secret put API_KEY
# Enter your Google Gemini API key
```

#### Model Selection
```javascript
// Available models in worker.js
const AI_MODELS = {
  chat: "@cf/google/gemma-7b-it-lora",      // Main chat model
  embedding: "@cf/baai/bge-base-en-v1.5",   // Embedding model
  support: "@cf/google/gemma-7b-it-lora"    // Support queries
};
```

### 2. Response Generation

#### Prompt Engineering
```javascript
// System prompt for context-aware responses
const SYSTEM_PROMPT = `
Anda adalah asisten AI untuk Madrasah Aliyah MALNU Kananga.
Jawab pertanyaan berdasarkan konteks yang diberikan.
Gunakan bahasa Indonesia yang sopan dan informatif.
Jika konteks tidak relevan, jawab dengan "Maaf, saya tidak memiliki informasi tersebut."
`;

// User prompt with context
const userPrompt = `
Konteks:
${contextDocuments.map(doc => doc.text).join('\n\n')}

Pertanyaan: ${userMessage}

Jawaban:
`;
```

#### Response Parameters
```javascript
// AI model configuration
const aiResponse = await env.AI.run('@cf/google/gemma-7b-it-lora', {
  prompt: userPrompt,
  max_tokens: 500,
  temperature: 0.7,
  top_p: 0.9,
  frequency_penalty: 0.5,
  presence_penalty: 0.5
});
```

### 3. Response Optimization

#### Temperature Settings
- **0.1-0.3**: Very focused, factual responses
- **0.5-0.7**: Balanced creativity and accuracy (recommended)
- **0.8-1.0**: More creative, varied responses

#### Token Limits
```javascript
// Configure based on use case
const TOKEN_LIMITS = {
  chat: 500,           // Standard responses
  support: 300,        // Concise support answers
  detailed: 800        // Comprehensive explanations
};
```

---

## 📊 Performance Optimization

### 1. Vector Database Optimization

#### Index Maintenance
```bash
# Monitor index size and performance
wrangler vectorize describe malnu-kananga-index

# Check query performance
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test query"}' \
  -w "Time: %{time_total}s\n"
```

#### Document Optimization
```javascript
// Optimize document length for better embeddings
const MAX_DOCUMENT_LENGTH = 1000; // characters

// Chunk long documents
function chunkDocument(text, maxLength = 1000) {
  const chunks = [];
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}
```

### 2. Caching Strategy

#### Response Caching
```javascript
// Cache frequent queries
const CACHE_TTL = 300; // 5 minutes
const CACHE_KEY = `chat:${hashQuery(userMessage)}`;

// Check cache first
const cached = await env.CACHE.get(CACHE_KEY);
if (cached) {
  return JSON.parse(cached);
}

// Cache new responses
await env.CACHE.put(CACHE_KEY, JSON.stringify(response), {
  expirationTtl: CACHE_TTL
});
```

#### Embedding Caching
```javascript
// Cache embeddings for repeated queries
const embeddingCache = new Map();

function getCachedEmbedding(text) {
  const hash = hashText(text);
  if (embeddingCache.has(hash)) {
    return embeddingCache.get(hash);
  }
  
  const embedding = generateEmbedding(text);
  embeddingCache.set(hash, embedding);
  return embedding;
}
```

### 3. Query Optimization

#### Preprocessing
```javascript
// Optimize user queries for better matching
function preprocessQuery(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ');    // Normalize whitespace
}
```

#### Query Expansion
```javascript
// Expand queries with synonyms
const SYNONYMS = {
  "sekolah": ["madrasah", "institusi", "lembaga"],
  "program": ["kegiatan", "aktivitas", "fasilitas"],
  "ppdb": ["pendaftaran", "penerimaan", "admission"]
};

function expandQuery(text) {
  const words = text.toLowerCase().split(' ');
  const expanded = [...words];
  
  words.forEach(word => {
    if (SYNONYMS[word]) {
      expanded.push(...SYNONYMS[word]);
    }
  });
  
  return expanded.join(' ');
}
```

---

## 🔍 Monitoring & Analytics

### 1. Performance Metrics

#### Key Indicators
```javascript
// Track these metrics in your monitoring system
const METRICS = {
  queryLatency: "Time from request to response",
  similarityScore: "Average similarity of retrieved documents",
  contextRelevance: "User feedback on response quality",
  cacheHitRate: "Percentage of queries served from cache",
  errorRate: "Percentage of failed AI responses"
};
```

#### Logging Configuration
```javascript
// Structured logging for AI operations
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  operation: "ai_chat",
  queryLength: userMessage.length,
  contextCount: contextDocuments.length,
  similarityScore: results[0]?.score || 0,
  responseTime: Date.now() - startTime,
  success: true
}));
```

### 2. Quality Assurance

#### Response Validation
```javascript
// Validate AI responses before sending
function validateResponse(response) {
  const checks = {
    notEmpty: response.trim().length > 0,
    notTooLong: response.length < 2000,
    containsIndonesian: /[a-z]/i.test(response),
    noProfanity: !containsProfanity(response)
  };
  
  return Object.values(checks).every(Boolean);
}
```

#### Fallback Mechanisms
```javascript
// Fallback responses for various failure scenarios
const FALLBACK_RESPONSES = {
  noContext: "Maaf, saya tidak memiliki informasi tersebut. Silakan hubungi admin sekolah.",
  aiError: "Maaf, terjadi kesalahan pada sistem AI. Silakan coba lagi nanti.",
  timeout: "Maaf, permintaan Anda terlalu lama. Silakan coba lagi dengan pertanyaan yang lebih singkat."
};
```

---

## 🛠️ Advanced Configuration

### 1. Custom Document Categories

#### Adding New Categories
```javascript
// Extend document metadata structure
const DOCUMENT_CATEGORIES = {
  profile: { priority: "high", weight: 1.0 },
  programs: { priority: "high", weight: 1.0 },
  ppdb: { priority: "medium", weight: 0.8 },
  academics: { priority: "medium", weight: 0.8 },
  facilities: { priority: "low", weight: 0.6 },
  news: { priority: "low", weight: 0.5 }
};
```

#### Category-Based Filtering
```javascript
// Filter results by category priority
function filterByPriority(results, userRole = "student") {
  const priorities = {
    student: ["profile", "programs", "academics"],
    teacher: ["profile", "programs", "facilities"],
    parent: ["profile", "programs", "ppdb"]
  };
  
  return results.filter(doc => 
    priorities[userRole].includes(doc.metadata.category)
  );
}
```

### 2. Multi-Language Support

#### Language Detection
```javascript
// Detect language of user query
function detectLanguage(text) {
  const indonesianWords = ["yang", "dan", "di", "ke", "dari", "untuk"];
  const words = text.toLowerCase().split(' ');
  const indonesianCount = words.filter(word => 
    indonesianWords.includes(word)
  ).length;
  
  return indonesianCount / words.length > 0.3 ? "id" : "en";
}
```

#### Language-Specific Responses
```javascript
// Adjust responses based on detected language
const LANGUAGE_PROMPTS = {
  id: "Jawab dalam bahasa Indonesia yang sopan dan informatif.",
  en: "Answer in polite and informative English."
};

function getSystemPrompt(language) {
  return BASE_PROMPT + " " + LANGUAGE_PROMPTS[language];
}
```

### 3. Context-Aware Routing

#### Query Classification
```javascript
// Classify queries for specialized handling
function classifyQuery(text) {
  const patterns = {
    admission: /ppdb|pendaftaran|daftar|penerimaan/i,
    academic: /nilai|jadwal|pelajaran|ujian/i,
    facility: /fasilitas|gedung|ruangan|laboratorium/i,
    contact: /kontak|telepon|email|alamat/i,
    general: /.*/
  };
  
  for (const [category, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return category;
  }
  return "general";
}
```

#### Specialized Handlers
```javascript
// Route queries to specialized handlers
const QUERY_HANDLERS = {
  admission: handleAdmissionQuery,
  academic: handleAcademicQuery,
  facility: handleFacilityQuery,
  contact: handleContactQuery,
  general: handleGeneralQuery
};

function routeQuery(query, category) {
  return QUERY_HANDLERS[category](query);
}
```

---

## 🧪 Testing & Validation

### 1. Unit Testing

#### Test Vector Search
```javascript
// Test vector similarity search
describe('Vector Search', () => {
  test('should find relevant documents', async () => {
    const query = "program unggulan sekolah";
    const results = await searchDocuments(query);
    
    expect(results).toHaveLength(3);
    expect(results[0].score).toBeGreaterThan(0.75);
    expect(results[0].metadata.category).toBe("programs");
  });
});
```

#### Test AI Responses
```javascript
// Test AI response generation
describe('AI Response Generation', () => {
  test('should generate relevant responses', async () => {
    const query = "Apa saja program unggulan sekolah?";
    const response = await generateAIResponse(query);
    
    expect(response).toContain("Tahfidz");
    expect(response).toContain("Bahasa Arab");
    expect(response.length).toBeGreaterThan(50);
  });
});
```

### 2. Integration Testing

#### End-to-End Testing
```bash
# Test complete AI pipeline
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa saja program unggulan sekolah?"}' \
  | jq '.response'

# Expected: Relevant information about school programs
```

#### Performance Testing
```bash
# Load test AI endpoints
for i in {1..100}; do
  curl -X POST https://your-worker-url.workers.dev/api/chat \
    -H "Content-Type: application/json" \
    -d '{"message": "test query"}' \
    -w "Time: %{time_total}s\n" \
    -o /dev/null \
    -s
done
```

---

## 📈 Scaling & Maintenance

### 1. Database Scaling

#### Monitoring Index Size
```bash
# Check current index usage
wrangler vectorize describe malnu-kananga-index

# Monitor document count growth
curl https://your-worker-url.workers.dev/health | jq '.vectorize.documentCount'
```

#### Index Optimization
```javascript
// Periodic cleanup of old documents
async function cleanupOldDocuments() {
  const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  
  // Remove documents older than 90 days
  await env.VECTORIZE_INDEX.delete({
    filter: {
      created: { $lt: cutoffDate.toISOString() }
    }
  });
}
```

### 2. Model Updates

#### Model Versioning
```javascript
// Configure model versions for easy updates
const MODEL_VERSIONS = {
  "v1": "@cf/google/gemma-7b-it-lora",
  "v2": "@cf/google/gemma-7b-it-lora-v2",  // Future model
  "embedding": "@cf/baai/bge-base-en-v1.5"
};

// Use environment variable for model selection
const MODEL = MODEL_VERSIONS[process.env.AI_MODEL_VERSION || "v1"];
```

#### A/B Testing
```javascript
// A/B test different models or parameters
function selectModel(userId) {
  const hash = hashUserId(userId);
  return hash % 2 === 0 ? "v1" : "v2";
}
```

---

## 🚨 Troubleshooting

### Common AI Issues

#### Issue: Empty AI Responses
**Symptoms**: AI returns empty or very short responses
**Solutions**:
```bash
# Check API key configuration
wrangler secret list

# Test API key directly
curl -H "x-goog-api-key: YOUR_API_KEY" \
  "https://generativelanguage.googleapis.com/v1beta/models"

# Verify context is being retrieved
curl -X POST https://your-worker-url.workers.dev/api/chat \
  -d '{"message": "test"}' | jq '.context'
```

#### Issue: Low Similarity Scores
**Symptoms**: Vector search returns low scores (< 0.5)
**Solutions**:
```bash
# Re-seed vector database
curl https://your-worker-url.workers.dev/seed

# Check document quality
wrangler vectorize describe malnu-kananga-index

# Adjust similarity threshold temporarily
# Edit worker.js to lower threshold for testing
```

#### Issue: Slow Response Times
**Symptoms**: AI responses take > 10 seconds
**Solutions**:
```bash
# Check worker performance
wrangler tail --format json

# Monitor vector search performance
time curl -X POST https://your-worker-url.workers.dev/api/chat \
  -d '{"message": "test"}'

# Optimize document count or cache frequent queries
```

### Debug Mode
```javascript
// Enable debug logging in worker.js
const DEBUG = process.env.NODE_ENV === "development";

if (DEBUG) {
  console.log("AI Debug:", {
    query: userMessage,
    embedding: embedding.slice(0, 10),
    results: results.map(r => ({ score: r.score, id: r.id })),
    response: aiResponse.slice(0, 100)
  });
}
```

---

## 📚 Best Practices

### 1. Document Management
- Keep documents concise and focused
- Use consistent metadata structure
- Regularly update outdated information
- Remove duplicate or redundant content

### 2. Query Optimization
- Preprocess user queries for better matching
- Use query expansion for synonyms
- Implement caching for frequent queries
- Monitor and optimize similarity thresholds

### 3. Response Quality
- Validate responses before sending
- Implement fallback mechanisms
- Monitor user feedback for quality
- Regularly test and update prompts

### 4. Performance
- Cache embeddings and responses
- Monitor API usage and quotas
- Optimize document count and size
- Use appropriate timeout values

---

## 🔮 Future Enhancements

### Planned Features
- **Multi-modal AI**: Image and document analysis
- **Personalized Responses**: User-specific context
- **Real-time Learning**: Continuous improvement
- **Advanced Analytics**: Detailed usage insights

### Research Areas
- **Fine-tuning**: Custom model training
- **Knowledge Graph**: Structured information relationships
- **Voice Interface**: Speech-to-text integration
- **Translation**: Multi-language support

---

## 📞 Support & Resources

### Documentation
- [API Documentation](./API_DOCUMENTATION.md)
- [System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)

### External Resources
- [Cloudflare Vectorize Documentation](https://developers.cloudflare.com/vectorize/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Embedding Model Documentation](https://huggingface.co/BAAI/bge-base-en-v1.5)

### Community Support
- **GitHub Issues**: [Report AI bugs](https://github.com/sulhi/ma-malnu-kananga/issues)
- **Email Support**: ai-support@ma-malnukananga.sch.id
- **AI Documentation**: ai-docs@ma-malnukananga.sch.id

---

**AI Configuration Guide Version: 1.3.1**  
*Last Updated: November 24, 2024*  
*AI Team: MA Malnu Kananga Technical Department*  
*Next Review: December 2024*

---

*For AI configuration assistance, contact the technical team at ai-support@ma-malnukananga.sch.id*