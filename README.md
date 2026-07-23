# 🚀 AskPDF

### RAG-Based Multimodal AI Document Intelligence System

> **An AI-powered document intelligence platform that enables users to interact with PDFs using Retrieval-Augmented Generation (RAG), OCR, Semantic Search, Voice Queries, AI Summarization, and Intelligent Redaction.**

---

## 🌐 Live Demo

**https://ai-document-intelligence-mu.vercel.app**

---

# 📖 Overview

AskPDF is an end-to-end AI-powered Document Intelligence Platform designed to transform static PDF documents into interactive knowledge sources.

Unlike traditional PDF readers, AskPDF understands both **text-based** and **scanned documents**, allowing users to:

* 💬 Chat with PDFs using natural language
* 🎤 Ask questions using voice
* 📝 Generate AI-powered summaries
* 🔒 Automatically redact sensitive information
* 🔍 Perform semantic document search
* 📄 Process scanned PDFs using OCR
* ⚡ Retrieve context-aware answers using Retrieval-Augmented Generation (RAG)

The system combines modern NLP, Vector Search, OCR, and Large Language Models to provide accurate, context-aware document understanding.

---

# ✨ Key Features

## 📂 Intelligent PDF Upload

* Upload text-based PDFs
* Upload scanned PDFs
* Automatic document ingestion
* Automatic vector index generation
* Thumbnail generation
* Cloud storage using Supabase Storage

---

## 💬 AI Document Chat

Ask questions in natural language.

Examples:

* What is this document about?
* Explain Chapter 3.
* What are the eligibility criteria?
* Who signed this agreement?

Powered using:

* Retrieval-Augmented Generation (RAG)
* Semantic Search
* Context Retrieval
* Conversation Memory

---

## 🎤 Voice-Based Question Answering

Users can interact using voice instead of typing.

Pipeline:

Speech → Whisper → RAG → Groq LLM → Response

---

## 🧠 AI Summarization

Generate concise summaries of entire documents using LLMs.

Supports:

* Research Papers
* Reports
* Agreements
* Books
* Technical Documentation

---

## 🔒 Intelligent PDF Redaction

Automatically detect and redact sensitive information.

Supports:

* Email IDs
* Phone Numbers
* Aadhaar Numbers
* PAN Numbers
* Credit Card Numbers
* Dates
* Names
* Custom User Keywords

Produces a downloadable redacted PDF.

---

## 📄 OCR Support

Scanned PDFs are automatically detected.

If text extraction fails:

PDF Images

↓

Mistral OCR

↓

Extracted Text

↓

Chunking

↓

Embeddings

↓

Vector Store

---

## 🔍 Semantic Search

Instead of keyword matching, AskPDF retrieves information using semantic similarity.

Even if the exact wording doesn't exist, the system understands user intent.

Example:

Query:

> "How can I reset my password?"

Document contains:

> "Users may change their credentials through Account Settings."

The system still retrieves the correct section.

---

## 🧩 Retrieval-Augmented Generation (RAG)

The platform follows a production-ready RAG pipeline.

PDF

↓

Text Extraction

↓

Cleaning

↓

Chunking

↓

Sentence Embeddings

↓

FAISS Vector Database

↓

Similarity Search

↓

Cross Encoder Re-ranking

↓

Groq LLM

↓

Final Response

---

# 🏗️ System Architecture

```text
                +----------------------+
                |      User Upload     |
                +----------+-----------+
                           |
                           v
                 PDF Text Extraction
            (pdfplumber / Mistral OCR)
                           |
                           v
                  Text Cleaning
                           |
                           v
                Intelligent Chunking
                           |
                           v
            SentenceTransformer Embeddings
                           |
                           v
                 FAISS Vector Database
                           |
                           v
               Semantic Similarity Search
                           |
                           v
               Cross Encoder Re-ranking
                           |
                           v
                  Groq Large Language Model
                           |
                           v
              Context-Aware AI Response
```

---

# 🛠️ Tech Stack

## Frontend

* React.js
* Tailwind CSS
* Vercel

---

## Backend

* FastAPI
* Railway

---

## Database

* Supabase PostgreSQL
* Supabase Storage

---

## AI / Machine Learning

* Sentence Transformers
* Cross Encoder Re-ranking
* FAISS
* spaCy
* Groq LLM
* Mistral OCR
* Faster Whisper

---

## PDF Processing

* PyMuPDF
* pdfplumber

---

## Deployment

* Frontend → Vercel
* Backend → Railway
* Database → Supabase

---

# ⚙️ AI Pipeline

### 1. Document Upload

* Upload PDF
* Store in Supabase
* Save metadata

---

### 2. Document Processing

* Detect scanned or text PDF
* OCR (if required)
* Clean text
* Chunk document

---

### 3. Embedding Generation

Each chunk is converted into dense vector embeddings using Sentence Transformers.

---

### 4. Vector Storage

Embeddings are stored in a FAISS Vector Index for efficient similarity search.

---

### 5. Retrieval

When a user asks a question:

* Query Embedding
* Similarity Search
* Top-K Retrieval
* Cross Encoder Re-ranking

---

### 6. Response Generation

The retrieved context is passed to Groq LLM to generate a context-aware answer.

---

# 📊 Highlights

✅ Retrieval-Augmented Generation (RAG)

✅ Semantic Search

✅ Cross Encoder Re-ranking

✅ OCR for Scanned PDFs

✅ AI Summarization

✅ AI Redaction

✅ Voice-Based Queries

✅ Conversation Memory

✅ Cloud Storage

✅ Production Deployment

---

# 🚀 Future Improvements

* Multi-document querying
* Image understanding inside PDFs
* Table extraction
* Citation-aware responses
* Multi-language document support
* Role-based document access
* Document comparison
* Knowledge Graph generation
* Fine-tuned domain-specific models

---

# 📸 Screenshots

> Add screenshots of:
>
> * Home Page
> * Dashboard
> * PDF Chat
> * AI Summary
> * AI Redaction
> * Voice Search
> * OCR Processing

---

# 👩‍💻 Author

**Shweta Tiwari**

Built with ❤️ using Retrieval-Augmented Generation, NLP, OCR, Semantic Search, and Generative AI.
