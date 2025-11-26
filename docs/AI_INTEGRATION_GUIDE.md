# 🔍 AI Integration Guide - MA Malnu Kananga

## 🎯 Overview

This guide provides comprehensive documentation for AI integration in the MA Malnu Kananga system, including chat functionality, content editing, and intelligent features.

---

**Guide Version**: 1.0.0  
**Last Updated: November 25, 2025  
**Implementation Status**: ✅ Active  
**Target Audience**: Developers, System Administrators

---

## 🤖 AI Architecture Overview

### Core Components
- **Google Gemini AI**: Primary AI model for responses
- **RAG System**: Retrieval-Augmented Generation with vector database
- **Cloudflare Worker**: AI processing backend
- **Vector Database**: Context storage for AI responses
- **Chat Interface**: User interaction layer

### AI Features
- **AI Assistant**: Context-aware chat assistant
- **Content Editor**: AI-powered content modification
- **Intelligent Search**: Semantic search capabilities
- **Automated Responses**: Smart response generation

---

## 🔧 Setup and Configuration

### Environment Variables
```bash
# AI Configuration
API_KEY=your-google-gemini-api-key
AI_MODEL=gemini-1.5-flash
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2048

# Vector Database Configuration
VECTOR_SIMILARITY_CUTOFF=0.75
VECTOR_DB_URL=your-vector-database-url
```

### AI Model Configuration
```typescript
// AI service configuration
const aiConfig = {
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 2048,
  apiKey: process.env.API_KEY
};
```

---

## 🧠 RAG System Implementation

### Vector Database Setup
The RAG system uses a vector database to store and retrieve context:

```typescript
// Document storage in worker.js
const documents = [
  {
    id: 'doc1',
    content: 'School policies and procedures...',
    embedding: await generateEmbedding(content),
    metadata: { category: 'policy', lastUpdated: '2025-11-25' }
  }
];
```

### Similarity Search
```typescript
// Vector similarity search
async function findRelevantContext(query: string, cutoff = 0.75) {
  const queryEmbedding = await generateEmbedding(query);
  
  return documents
    .map(doc => ({
      ...doc,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    }))
    .filter(doc => doc.similarity >= cutoff)
    .sort((a, b) => b.similarity - a.similarity);
}
```

---

## 💬 Chat System Integration

### Chat Component Architecture
```typescript
// ChatWindow component
const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Get AI response
    const aiResponse = await getAIResponse(userMessage);
    
    // Add AI response
    setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
  };
};
```

### AI Response Generation
```typescript
// Generate AI response with context
async function getAIResponse(userQuery: string): Promise<string> {
  // Find relevant context
  const context = await findRelevantContext(userQuery);
  
  // Generate response with Gemini
  const response = await generateGeminiResponse({
    prompt: userQuery,
    context: context.map(doc => doc.content).join('\n'),
    language: 'id-ID' // Indonesian language
  });
  
  return response;
}
```

---

## ✏️ AI Content Editor

### SiteEditor Component
The AI-powered content editor allows structured content modification:

```typescript
// SiteEditor component
const SiteEditor: React.FC = () => {
  const [content, setContent] = useState({
    featuredPrograms: [],
    latestNews: []
  });
  
  const handleAIEdit = async (editRequest: string) => {
    const aiResponse = await callAIAPI({
      action: 'edit_content',
      currentContent: content,
      editRequest: editRequest,
      schema: CONTENT_SCHEMA
    });
    
    if (aiResponse.success) {
      setContent(aiResponse.updatedContent);
    }
  };
};
```

### Content Schema Validation
```typescript
// Content schema for AI responses
const CONTENT_SCHEMA = {
  type: 'object',
  properties: {
    featuredPrograms: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          image: { type: 'string' }
        }
      }
    },
    latestNews: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          date: { type: 'string' }
        }
      }
    }
  }
};
```

---

## 🔌 API Integration

### Cloudflare Worker Backend
AI processing is handled by Cloudflare Worker:

```typescript
// worker.js - AI API endpoints
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/api/chat':
        return handleChatRequest(request);
      case '/api/edit-content':
        return handleContentEdit(request);
      case '/api/search':
        return handleSemanticSearch(request);
      default:
        return new Response('Not Found', { status: 404 });
    }
  }
};
```

### Chat API Endpoint
```typescript
// Handle chat requests
async function handleChatRequest(request) {
  const { message, context } = await request.json();
  
  // Get relevant context from vector database
  const relevantDocs = await findRelevantContext(message);
  
  // Generate AI response
  const response = await generateAIResponse({
    message,
    context: relevantDocs,
    language: 'id-ID'
  });
  
  return Response.json({ response });
}
```

---

## 🌐 Language Support

### Indonesian Language Configuration
All AI interactions are configured for Indonesian (Bahasa Indonesia):

```typescript
// Language configuration
const languageConfig = {
  default: 'id-ID',
  fallback: 'en-US',
  prompts: {
    system: 'Anda adalah asisten AI untuk MA Malnu Kananga...',
    error: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
    greeting: 'Halo! Saya siap membantu Anda.'
  }
};
```

### Multilingual Content
```typescript
// Handle multilingual content
function generateResponse(userMessage: string, language: string = 'id-ID') {
  const systemPrompt = getSystemPrompt(language);
  const response = callGeminiAPI({
    prompt: userMessage,
    systemPrompt: systemPrompt,
    language: language
  });
  
  return response;
}
```

---

## 📊 Performance Optimization

### Caching Strategy
```typescript
// Response caching
const responseCache = new Map();

async function getCachedResponse(query: string) {
  const cacheKey = generateCacheKey(query);
  
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }
  
  const response = await generateAIResponse(query);
  responseCache.set(cacheKey, response);
  
  // Cache expiration
  setTimeout(() => {
    responseCache.delete(cacheKey);
  }, 300000); // 5 minutes
  
  return response;
}
```

### Batch Processing
```typescript
// Batch embedding generation
async function generateEmbeddingsBatch(texts: string[]) {
  const batchSize = 10;
  const embeddings = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchEmbeddings = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );
    embeddings.push(...batchEmbeddings);
  }
  
  return embeddings;
}
```

---

## 🔒 Security Considerations

### API Key Management
```typescript
// Secure API key handling
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}

// Rate limiting
const rateLimiter = new Map();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientRequests = rateLimiter.get(clientId) || [];
  
  // Remove old requests (older than 1 minute)
  const recentRequests = clientRequests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 30) { // 30 requests per minute
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(clientId, recentRequests);
  return true;
}
```

### Content Filtering
```typescript
// Content safety filtering
function filterContent(content: string): string {
  // Remove inappropriate content
  const filteredContent = content
    .replace(/inappropriate|pattern/gi, '[FILTERED]')
    .trim();
  
  return filteredContent;
}
```

---

## 🧪 Testing AI Features

### Unit Testing
```typescript
// Test AI response generation
describe('AI Service', () => {
  test('should generate Indonesian response', async () => {
    const response = await generateAIResponse('Halo', 'id-ID');
    expect(response).toContain('Halo');
    expect(response).toMatch(/[\u0600-\u06FF]/); // Indonesian characters
  });
  
  test('should find relevant context', async () => {
    const context = await findRelevantContext('jadwal pelajaran');
    expect(context.length).toBeGreaterThan(0);
    expect(context[0].similarity).toBeGreaterThanOrEqual(0.75);
  });
});
```

### Integration Testing
```typescript
// Test chat integration
describe('Chat Integration', () => {
  test('should handle complete chat flow', async () => {
    const userMessage = 'Bagaimana cara melihat nilai?';
    const response = await handleChatRequest({
      body: JSON.stringify({ message: userMessage })
    });
    
    const data = await response.json();
    expect(data.response).toBeDefined();
    expect(data.response).toContain('nilai');
  });
});
```

---

## 📈 Monitoring and Analytics

### AI Performance Metrics
```typescript
// Performance monitoring
const metrics = {
  responseTime: [],
  successRate: 0,
  errorCount: 0,
  requestCount: 0
};

function trackPerformance(startTime: number, success: boolean) {
  const responseTime = Date.now() - startTime;
  metrics.responseTime.push(responseTime);
  metrics.requestCount++;
  
  if (!success) {
    metrics.errorCount++;
  }
  
  metrics.successRate = (metrics.requestCount - metrics.errorCount) / metrics.requestCount;
}
```

### Usage Analytics
```typescript
// Track AI usage patterns
function trackUsage(query: string, response: string, userId: string) {
  const analytics = {
    timestamp: new Date().toISOString(),
    userId: userId,
    queryLength: query.length,
    responseLength: response.length,
    language: 'id-ID',
    category: categorizeQuery(query)
  };
  
  // Send to analytics service
  sendAnalytics(analytics);
}
```

---

## 🚀 Deployment

### Production Configuration
```typescript
// Production AI configuration
const prodConfig = {
  apiKey: process.env.PROD_API_KEY,
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  maxTokens: 2048,
  rateLimit: {
    requestsPerMinute: 30,
    requestsPerHour: 500
  },
  caching: {
    enabled: true,
    ttl: 300 // 5 minutes
  }
};
```

### Environment Setup
1. **Development**: Use test API key and mock responses
2. **Staging**: Use staging API key with limited quota
3. **Production**: Use production API key with full monitoring

---

## 🔧 Troubleshooting

### Common Issues

#### API Key Issues
- **Problem**: API key not working
- **Solution**: Verify API key validity and permissions
- **Code**: Check environment variables

#### Response Quality
- **Problem**: AI responses not relevant
- **Solution**: Update vector database with better context
- **Code**: Adjust similarity cutoff threshold

#### Performance Issues
- **Problem**: Slow response times
- **Solution**: Implement caching and optimize queries
- **Code**: Monitor response times and optimize

### Debug Tools
- AI response logging
- Performance metrics dashboard
- Error tracking and alerting

---

## 📚 Additional Resources

### Documentation
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vector Database Best Practices](https://www.pinecone.io/learn/)

### Best Practices
- Implement proper error handling
- Use appropriate temperature settings
- Monitor API usage and costs
- Regularly update context database

---

## 🔄 Future Enhancements

### Planned Features
- **Multi-language Support**: Expand beyond Indonesian
- **Voice Integration**: Add voice chat capabilities
- **Advanced Analytics**: Deeper usage insights
- **Custom Models**: Train domain-specific models

### Improvement Roadmap
1. **Q1 2026**: Enhanced context understanding
2. **Q2 2026**: Voice interaction support
3. **Q3 2026**: Advanced personalization
4. **Q4 2026**: Multi-modal AI capabilities

---

## 📞 Support

### Getting Help
- **Documentation**: Refer to this guide and API docs
- **Community**: Join AI developer communities
- **Issues**: Report bugs via GitHub issues
- **Support**: Contact development team for critical issues

### Contributing
- Follow AI ethics guidelines
- Test thoroughly before deployment
- Document new features and improvements
- Monitor for bias and fairness

---

**🔍 AI Integration Guide - MA Malnu Kananga**

*Comprehensive guide for AI system integration*

---

*Last Updated: November 25, 2025*  
*Next Review: February 25, 2026*  
*Maintainer: MA Malnu Kananga Development Team*