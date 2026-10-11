Orvan

An enterprise-grade, asynchronous Retrieval-Augmented Generation (RAG) platform designed to parse, index, and analyze complex SEC Form 10-K filings. Orvan pairs a Next.js front end with a decoupled FastAPI and Celery ingestion architecture, running hybrid vector and sparse search against Qdrant, while leveraging MongoDB as a truth-source document store to strictly ground LLM responses and eliminate hallucinations.

Architecture Overview

The platform is divided into two primary data flows: Data Ingestion and Chat/Query Retrieval.

1. Data Ingestion Pipeline

This pipeline is designed to asynchronously handle massive SEC filings (often 300+ pages) without blocking the main FastAPI thread or timing out frontend requests.

Frontend to Backend: The Next.js UI sends an ingestion request to the FastAPI Backend via HTTP/REST.

Database Routing:

User authentication and chat history are routed to PostgreSQL.

Company metrics and hierarchical metadata are saved directly to MongoDB.

Asynchronous Queues: FastAPI pushes the ingestion task to the Redis Broker.

Celery Workers:

Worker 1 (sec_queue): Makes API calls to the SEC EDGAR database, fetches the raw 10-K data, saves the raw text/metadata to MongoDB, and passes the payload to the next queue.

Worker 2 (embed_queue): Fetches the pre-processed data, chunks it, and generates vector embeddings.

Vector DB: The final dense and sparse embeddings are indexed into Qdrant.

2. Chat & Retrieval (Anti-Hallucination) Flow

To prevent LLM hallucinations, Orvan enforces a strict grounding mechanism by cross-referencing vector search results with immutable source documents in MongoDB.

Search Execution: A chat request hits the FastAPI /Chat endpoint, which performs a hybrid search against the Qdrant Vector DB.

Context Grounding: Qdrant returns the most relevant chunk IDs (Search Results).

Metadata Enrichment: The system queries MongoDB for the exact parent sections, metrics, and raw metadata tied to those chunks.

LLM Synthesis: The verified context and metadata are passed to the LLM (Gemini), ensuring the final response sent back to the backend is strictly factual and tied to the original SEC filing.

Core Capabilities

Hallucination Mitigation: Qdrant handles semantic/keyword retrieval, but MongoDB acts as the immutable source of truth. By injecting raw MongoDB context into the LLM prompt, answers are strictly verifiable.

Asynchronous Processing: Decoupled architecture using Celery and Redis prevents timeouts during heavy document processing.

Hybrid Vector & Lexical Search: Uses dense embeddings (bge-small-en-v1.5) alongside sparse keyword search (BM25) via FastEmbed.

Memory-Optimized Worker Lifecycle: Configured with strict process recycling (--max-tasks-per-child) and concurrency limits to maintain sub-1GB memory footprints on constrained cloud VMs.

Interactive Dashboard: Built with Next.js, Tailwind CSS, Zustand, and Recharts for ticker management and dynamic Q&A.

Repository Structure

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


Tech Stack

Frontend: Next.js, React, Tailwind CSS, Zustand, Recharts, Lucide Icons

Backend: FastAPI, Uvicorn, Python

Task Queue & Cache: Celery, Redis

Databases: Qdrant (Vector DB), MongoDB (Document/Metadata Store), PostgreSQL (Relational Data)

Embeddings: FastEmbed (bge-small-en-v1.5, BM25 sparse)

Deployment: Vercel (Web), Oracle Cloud Infrastructure Ubuntu VM (API & Workers)

Local Development Setup

Prerequisites

Node.js (v18+) and pnpm

Python 3.10+ and uv or venv

Running instances of Redis, PostgreSQL, and MongoDB

Access to a Qdrant vector database instance

1. Clone the Repository

git clone https://github.com/<your-username>/Orvan.git
cd Orvan


2. Frontend Setup

pnpm install
cd apps/web
pnpm dev


Frontend runs on http://localhost:3000.

3. Backend Setup

cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt


4. Environment Variables

Create a .env file inside apps/api/:

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


5. Running the API and Celery Workers

Start the FastAPI backend:

uvicorn main:app --host 0.0.0.0 --port 8000 --reload


In separate terminal tabs (or tmux), launch the isolated Celery workers:

# Worker 1: SEC extraction
celery -A services.celery worker -Q sec_queue -c 1 --max-tasks-per-child=10 --loglevel=info

# Worker 2: Chunking, embeddings, & indexing
celery -A services.celeryt2 worker -Q embed_queue -c 1 --max-tasks-per-child=1 --loglevel=info


Production Deployment Notes

When deploying workers on memory-constrained Linux VMs (e.g., OCI, EC2):

Persistent Execution: Run workers inside tmux sessions so they survive SSH disconnections.

Preventing Memory Leaks: Embedding models consume massive RAM. Running Celery with -c 1 (single concurrency) and --max-tasks-per-child=1 ensures the child process is killed and recycled after every document, instantly freeing ONNX runtime buffers back to the OS.

License

This project is licensed under the MIT License.
