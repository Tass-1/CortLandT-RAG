# Orvan

An enterprise-grade, asynchronous **Retrieval-Augmented Generation (RAG)** platform for parsing, indexing, and analyzing complex SEC Form 10-K filings.

Orvan pairs a **Next.js** front end with a decoupled **FastAPI + Celery** ingestion architecture, running hybrid dense and sparse search against **Qdrant**. **MongoDB** acts as the source-of-truth document store, so LLM responses stay grounded in the original filing and hallucinations are kept to a minimum.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Core Capabilities](#core-capabilities)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Local Development Setup](#local-development-setup)
- [Production Deployment Notes](#production-deployment-notes)
- [License](#license)

---

## Architecture Overview

The platform has two main data flows: **Data Ingestion** and **Chat / Query Retrieval**.

### 1. Data Ingestion Pipeline

Designed to handle massive SEC filings (often 300+ pages) asynchronously, without blocking the main FastAPI thread or timing out frontend requests.

<p align="center">
  <img src="docs/assets/ingestion-architecture.png" alt="Orvan ingestion architecture" width="800">
</p>

1. **Frontend to Backend:** The Next.js UI sends an ingestion request to the FastAPI backend over HTTP/REST.
2. **Database routing:**
   - User authentication and chat history go to **PostgreSQL**.
   - Company metrics and hierarchical metadata go to **MongoDB**.
3. **Asynchronous queue:** FastAPI pushes the ingestion task to the **Redis** broker.
4. **Celery workers:**
   - **Worker 1 (`sec_queue`):** Calls the SEC EDGAR API, fetches the raw 10-K data, saves the raw text and metadata to MongoDB, then passes the payload to the next queue.
   - **Worker 2 (`embed_queue`):** Fetches the pre-processed data, chunks it, and generates vector embeddings.
5. **Vector DB:** The final dense and sparse embeddings are indexed into **Qdrant**.

### 2. Chat & Retrieval (Anti-Hallucination) Flow

Orvan enforces strict grounding by cross-referencing vector search results against immutable source documents in MongoDB.

<p align="center">
  <img src="docs/assets/chat-rag-architecture.png" alt="Orvan chat and retrieval architecture" width="800">
</p>

1. **Search execution:** A chat request hits the FastAPI `/chat` endpoint, which runs a hybrid search against Qdrant.
2. **Context grounding:** Qdrant returns the most relevant chunk IDs.
3. **Metadata enrichment:** The system queries MongoDB for the exact parent sections, metrics, and raw metadata tied to those chunks.
4. **LLM synthesis:** The verified context and metadata are passed to **Gemini**, so the final response is tied to the original SEC filing.

---

## Core Capabilities

- **Hallucination mitigation:** Qdrant handles semantic and keyword retrieval, while MongoDB serves as the immutable source of truth. Injecting raw MongoDB context into the LLM prompt keeps answers verifiable.
- **Asynchronous processing:** A decoupled Celery + Redis architecture prevents timeouts during heavy document processing.
- **Hybrid vector and lexical search:** Dense embeddings (`bge-small-en-v1.5`) combined with sparse keyword search (BM25) via FastEmbed.
- **Memory-optimized worker lifecycle:** Strict process recycling (`--max-tasks-per-child`) and concurrency limits keep memory under 1 GB on constrained cloud VMs.
- **Interactive dashboard:** Built with Next.js, Tailwind CSS, Zustand, and Recharts for ticker management and dynamic Q&A.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js, React, Tailwind CSS, Zustand, Recharts, Lucide Icons |
| **Backend** | FastAPI, Uvicorn, Python |
| **Task Queue & Cache** | Celery, Redis |
| **Databases** | Qdrant (vector), MongoDB (documents/metadata), PostgreSQL (relational) |
| **Embeddings** | FastEmbed (`bge-small-en-v1.5`, BM25 sparse) |
| **LLM** | Google Gemini |
| **Deployment** | Vercel (web), Oracle Cloud Infrastructure Ubuntu VM (API & workers) |

---

## Repository Structure

```text
.
├── apps
│   ├── api                  # FastAPI backend and Celery worker routines
│   │   ├── routers/         # API endpoints (ingest, chat, tickers)
│   │   ├── services/        # Celery task definitions (sec_queue, embed_queue)
│   │   └── main.py          # FastAPI application entrypoint
│   └── web                  # Next.js frontend application
│       ├── app/             # Application routes and pages
│       ├── components/      # UI components (shadcn/ui, charts)
│       └── package.json     # Web dependencies
├── docs
│   └── assets               # Architecture diagrams (PNGs)
├── pnpm-lock.yaml           # Frontend workspace lockfile
├── pnpm-workspace.yaml      # Monorepo configuration
└── README.md
```

---

## Local Development Setup

### Prerequisites

- Node.js (v18+) and `pnpm`
- Python 3.10+ and `uv` or `venv`
- Running instances of Redis, PostgreSQL, and MongoDB
- Access to a Qdrant vector database instance

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/Orvan.git
cd Orvan
```

### 2. Frontend setup

```bash
pnpm install
cd apps/web
pnpm dev
```

The frontend runs on <http://localhost:3000>.

### 3. Backend setup

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 4. Environment variables

Create a `.env` file inside `apps/api/`:

```env
# Application Settings
PORT=8000
HOST=0.0.0.0

# Redis & Broker
REDIS_URL=redis://localhost:6379/1

# Databases
DATABASE_URL=postgresql://user:password@localhost:5432/orvan
MONGO_URI=mongodb://localhost:27017/orvan
QDRANT_URL=https://<your-cluster>.qdrant.tech:6333
QDRANT_API_KEY=<your-qdrant-api-key>

# LLM & SEC API
GEMINI_API_KEY=<your-gemini-key>
SEC_EDGAR_USER_AGENT=YourName (your-email@example.com)
```

### 5. Run the API and Celery workers

Start the FastAPI backend:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

In separate terminal tabs (or tmux), launch the isolated Celery workers:

```bash
# Worker 1: SEC extraction
celery -A services.celery worker -Q sec_queue -c 1 --max-tasks-per-child=10 --loglevel=info

# Worker 2: Chunking, embeddings, & indexing
celery -A services.celeryt2 worker -Q embed_queue -c 1 --max-tasks-per-child=1 --loglevel=info
```

---

## Production Deployment Notes

When deploying workers on memory-constrained Linux VMs (e.g., OCI, EC2):

- **Persistent execution:** Run workers inside `tmux` sessions so they survive SSH disconnections.
- **Preventing memory leaks:** Embedding models consume a lot of RAM. Running Celery with `-c 1` (single concurrency) and `--max-tasks-per-child=1` kills and recycles the child process after every document, freeing ONNX runtime buffers back to the OS.

---

## License

This project is licensed under the [MIT License](LICENSE).
