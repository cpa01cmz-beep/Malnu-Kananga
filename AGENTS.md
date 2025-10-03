# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Architecture Patterns
- **RAG AI System**: Chat functionality uses Retrieval-Augmented Generation with vector database in worker.js - AI responses depend on context fetched from deployed Cloudflare Worker
- **Dual File Structure**: Files exist in both root and src/ directories - ALWAYS use src/ versions for development (App.tsx, components/, services/)
- **Cloudflare Worker Backend**: AI chat, authentication, and content editing require deployed worker.js - local development won't have full AI functionality without deployment

## Essential Environment Setup
- **API_KEY**: Google Gemini AI key required in .env - without it, all AI features (chat, content editing) will fail silently
- **Worker Deployment**: Deploy worker.js to Cloudflare and run /seed endpoint ONCE to populate vector database for AI context

## Authentication & Security
- **Magic Link Auth**: Login system uses temporary tokens (15min expiry) sent via MailChannels API - no persistent sessions
- **CORS Configuration**: Worker handles cross-origin requests for web app communication

## Content Management
- **AI Content Editor**: SiteEditor component uses structured AI to modify featuredPrograms/latestNews arrays - responses must maintain exact JSON schema
- **Vector Database Context**: AI assistant knowledge comes from documents array in worker.js - add new information there, not in client code

## Development Workflow
- **Vite Dev Server**: Standard React + TypeScript setup with Hot Module Replacement
- **Indonesian Language**: All AI interactions and content are in Indonesian (Bahasa Indonesia) - maintain language consistency
- **Image URLs**: Use Unsplash placeholder URLs for new content items when users don't provide specific images

## Critical Gotchas
- Vector similarity cutoff is 0.75 - lower scores won't provide context to AI
- Authentication fails silently if worker isn't deployed
- Content changes in SiteEditor are temporary until page reload
- AI editor requires specific JSON schema with featuredPrograms/latestNews structure