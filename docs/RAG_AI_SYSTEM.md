# 🤖 RAG AI System Documentation - MA Malnu Kananga

## 🌟 Overview

MA Malnu Kananga implements a sophisticated Retrieval-Augmented Generation (RAG) AI system that provides intelligent responses to user queries by combining vector search with large language model capabilities. This system serves as the core intelligence behind the AI assistant feature.

---

**RAG System Documentation Version: 1.0.1**  
**Last Updated: November 25, 2025**  
**Implementation Status: Production Ready**  
**Documentation Audit: Completed - Aligned with AGENTS.md requirements**

---

## 🏗️ RAG Architecture

### Core Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Query    │───►│  Vector Search  │───►│  Context        │
│   (Indonesian)  │    │  (Similarity)   │    │  Retrieval      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Response   │◄───│  Google Gemini  │◄───│  Prompt +       │
│   (Indonesian)  │    │  LLM            │    │  Context        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technical Stack

- **Vector Database**: Cloudflare Vectorize (768-dimensional embeddings)
- **Embedding Model**: @cf/baai/bge-base-en-v1.5
- **Language Model**: Google Gemini AI
- **Backend**: Cloudflare Worker (worker.js)
- **Frontend**: React ChatWindow component

---

## 🔍 Vector Database System

### Document Storage

The vector database stores embeddings of school-related documents:

```javascript
// Document categories in vector database
const documentCategories = [
  "School Profile & Vision",
  "Academic Programs", 
  "PPDB Information",
  "School Facilities",
  "Extracurricular Activities",
  "Student Achievement",
  "Teacher Information",
  "School Rules & Policies",
  "Contact Information",
  "School History"
];
```

### Search Configuration

- **Similarity Threshold**: 0.75 (minimum relevance score)
- **Top K Results**: 3 most relevant documents
- **Embedding Dimensions**: 768
- **Distance Metric**: Cosine similarity

### Seeding Process

```bash
# One-time setup after worker deployment
curl https://your-worker.workers.dev/seed

# Expected response
Successfully seeded 10 documents.
```

---

## 🧠 AI Response Generation

### Prompt Engineering

The system uses structured prompts to ensure consistent Indonesian responses:

```javascript
const promptTemplate = `
Berdasarkan konteks berikut, jawab pertanyaan dalam Bahasa Indonesia:

Konteks:
${retrievedContext}

Pertanyaan: ${userMessage}

Jawaban dalam Bahasa Indonesia:
`;
```

### Response Characteristics

- **Language**: Indonesian (Bahasa Indonesia) only
- **Context Awareness**: Uses retrieved documents for accuracy
- **Fallback**: Graceful handling when no relevant context found
- **Consistency**: Maintains school's tone and terminology

---

## 💬 Chat Flow Implementation

### User Interaction Flow

1. **Input**: User types question in Indonesian
2. **Embedding**: Query converted to vector embedding
3. **Search**: Vector similarity search in database
4. **Context**: Top 3 most relevant documents retrieved
5. **Generation**: Context sent to Google Gemini with prompt
6. **Response**: AI generates Indonesian response
7. **Display**: Response shown in chat interface

### Memory System

Multi-turn conversation support through:

```javascript
// Conversation memory structure
const conversationMemory = {
  sessionId: "uuid",
  messages: [
    { role: "user", content: "question", timestamp: "ISO" },
    { role: "assistant", content: "answer", timestamp: "ISO" }
  ],
  context: []
};
```

---

## 🔧 Technical Implementation

### Worker.js Integration

```javascript
// Main RAG endpoint in worker.js
app.post('/api/chat', async (request, env) => {
  // 1. Authenticate user
  // 2. Generate query embedding
  // 3. Search vector database
  // 4. Filter by similarity threshold
  // 5. Generate AI response
  // 6. Return response
});
```

### Frontend Integration

```typescript
// src/services/geminiService.ts
export class GeminiService {
  async chatWithRAG(message: string): Promise<string> {
    // 1. Send to worker /api/chat
    // 2. Handle streaming response
    // 3. Update chat interface
    // 4. Store in conversation memory
  }
}
```

---

## 📚 Knowledge Base Management

### Document Sources

Current knowledge base includes:

1. **School Information**
   - Vision, mission, and values
   - School history and achievements
   - Contact information and location

2. **Academic Programs**
   - Curriculum details
   - Subject offerings
   - Academic standards

3. **Student Services**
   - PPDB (New Student Admission)
   - Extracurricular activities
   - Student support services

4. **School Policies**
   - Rules and regulations
   - Academic calendar
   - Assessment procedures

### Adding New Knowledge

To add new documents to the knowledge base:

1. **Prepare Document Content**
   ```javascript
   const newDocument = {
     id: "unique_id",
     content: "Document text in Indonesian",
     category: "category_name",
     metadata: { source: "manual", date: "2025-11-25" }
   };
   ```

2. **Update worker.js documents array**
   ```javascript
   // In worker.js, add to documents array
   documents.push(newDocument);
   ```

3. **Re-seed Vector Database**
   ```bash
   curl https://your-worker.workers.dev/seed
   ```

---

## 🚨 Critical Gotchas (from AGENTS.md)

### Vector Similarity Cutoff
- **Threshold**: 0.75 - lower scores won't provide context
- **Impact**: Questions below threshold get generic responses
- **Solution**: Add more relevant documents to improve coverage

### Authentication Dependency
- **Requirement**: Worker must be deployed for AI functionality
- **Local Development**: AI features won't work without deployed worker
- **Testing**: Use deployed worker URL for AI testing

### Language Consistency
- **Requirement**: All AI interactions in Indonesian
- **Implementation**: Prompts enforce Indonesian responses
- **User Experience**: Consistent language throughout chat

### Context Limitations
- **Document Count**: Currently 10 documents in knowledge base
- **Coverage**: Limited to pre-seeded information
- **Expansion**: Requires manual document addition and re-seeding

---

## 🔍 Monitoring & Analytics

### Performance Metrics

- **Response Time**: Target < 3 seconds
- **Similarity Scores**: Monitor average relevance
- **Query Volume**: Track usage patterns
- **Error Rate**: Monitor AI service failures

### Quality Assurance

```javascript
// Response quality checks
const qualityChecks = {
  hasIndonesianText: /[\u007C-\u007E\u00A0-\u024F]/.test(response),
  hasContext: context.length > 0,
  withinLengthLimit: response.length < 1000,
  notEmpty: response.trim().length > 0
};
```

---

## 🛠️ Troubleshooting

### Common Issues

#### AI Not Responding
```bash
# Check if vector database is seeded
curl https://your-worker.workers.dev/health

# Re-seed if needed
curl https://your-worker.workers.dev/seed
```

#### Poor Response Quality
- **Cause**: Low similarity scores or insufficient context
- **Solution**: Add more relevant documents to knowledge base
- **Check**: Review document content and categories

#### Language Issues
- **Problem**: Response not in Indonesian
- **Cause**: Prompt engineering issues
- **Solution**: Verify prompt template in worker.js

### Debug Commands

```bash
# Test vector search directly
curl -X POST https://your-worker.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa program unggulan sekolah?"}'
```

---

## 📈 Future Enhancements

### Planned Improvements

1. **Expanded Knowledge Base**
   - More detailed academic information
   - Historical school data
   - Community involvement information

2. **Advanced Features**
   - Multi-language support (English option)
   - Document upload for admin knowledge management
   - Context-aware conversation continuations

3. **Performance Optimization**
   - Response caching for common queries
   - Parallel vector search
   - Streaming responses

---

## 🔒 Security Considerations

### Data Privacy

- **No Personal Data**: RAG system uses only public school information
- **Query Logging**: Chat queries logged for performance monitoring
- **Context Filtering**: Sensitive information excluded from knowledge base

### Access Control

- **Authentication Required**: All AI endpoints require valid JWT
- **Rate Limiting**: 100 requests per 15 minutes per user
- **Input Validation**: Query sanitization and length limits

---

## 📞 Support & Maintenance

### Regular Maintenance

- **Monthly**: Review and update knowledge base
- **Quarterly**: Performance optimization and tuning
- **Annually**: Comprehensive system review and updates

### Contact for Support

- **Technical Issues**: Check troubleshooting section
- **Knowledge Base Updates**: Contact development team
- **Performance Problems**: Monitor health endpoint

---

**RAG AI System Documentation Version: 1.0.0**  
**Last Updated: November 25, 2025**  
**Next Review: February 25, 2026**  
**Maintainer: MA Malnu Kananga Development Team**