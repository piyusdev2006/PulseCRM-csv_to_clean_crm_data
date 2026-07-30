# 🚀 PulseCRM AI-Powered CSV Importer

An intelligent CSV importer that uses AI (Google Gemini) to automatically map and extract CRM lead information from **any** CSV format — Facebook Lead Exports, Google Ads, Real Estate CRMs, manually created spreadsheets, and more.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express-4-green?style=flat-square&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-orange?style=flat-square&logo=google)

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Sample CSV Files](#-sample-csv-files)
- [Docker Setup](#-docker-setup)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)

---

## ✨ Features

### Core
- 🤖 **AI-Powered Field Mapping** — Automatically maps any CSV column structure to GrowEasy CRM format using Google Gemini
- 📤 **Drag & Drop Upload** — Beautiful file upload with drag & drop support
- 📊 **CSV Preview** — Virtualized table for previewing uploaded CSV data (handles 10k+ rows)
- 📋 **CRM Results** — Structured display of extracted CRM records with status badges
- 📈 **Import Summary** — Statistics dashboard showing imported/skipped records

### UI/UX
- 🌙 **Dark Mode** — Premium dark-mode-first design with light mode toggle
- 🪟 **Glassmorphism** — Modern frosted glass UI effects
- ✨ **Micro-Animations** — Smooth transitions and hover effects with Framer Motion
- 📱 **Responsive** — Works beautifully on mobile, tablet, and desktop
- 🔄 **Loading States** — Progress indicators during AI processing
- 🎨 **Sticky Headers** — Tables with sticky headers and horizontal/vertical scrolling

### Engineering
- 🔁 **Retry Mechanism** — Exponential backoff for failed AI batches
- 📦 **Batch Processing** — Records processed in batches for optimal AI performance
- 🛡️ **Type Safety** — Full TypeScript with Zod runtime validation
- 🐳 **Docker Ready** — Multi-stage Docker builds with docker-compose
- 🧪 **Unit Tests** — Backend services tested with Vitest
- 🔒 **Security** — Helmet, CORS, rate limiting, input validation

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 15)                        │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Upload   │→│  Preview  │→│ Confirm  │→│  Results Table    │ │
│  │ Drag&Drop │  │  Table   │  │  Import  │  │  + Summary Cards │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│       CSV parsed client-side      │                              │
│       with PapaParse              │ POST /api/import             │
└───────────────────────────────────┼──────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                           │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Multer   │→│  Parse   │→│  Batch   │→│  Return JSON     │ │
│  │  Upload   │  │  CSV     │  │  AI      │  │  CRM Records     │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│                                    │                             │
│                          ┌─────────┴─────────┐                   │
│                          │   Gemini 2.0 Flash │                   │
│                          │   AI Extraction    │                   │
│                          └───────────────────┘                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **Tables** | @tanstack/react-table + @tanstack/react-virtual |
| **Upload** | react-dropzone |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Express.js, TypeScript |
| **CSV Parsing** | PapaParse |
| **AI** | Google Gemini 2.0 Flash |
| **Validation** | Zod |
| **Testing** | Vitest |
| **DevOps** | Docker, docker-compose |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+
- **Google Gemini API Key** — Get one free at [ai.google.dev](https://ai.google.dev)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/groweasy-csv-importer.git
cd groweasy-csv-importer
```

### 2. Set up environment variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_key_here
```

### 3. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend will start at **http://localhost:3001**

### 4. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at **http://localhost:3000**

### 5. Try it out!

1. Open http://localhost:3000
2. Upload one of the sample CSV files from `sample-csvs/`
3. Preview the data
4. Click "Confirm Import"
5. View the AI-extracted CRM records

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | — | Google Gemini API key |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment |
| `FRONTEND_URL` | No | `http://localhost:3000` | CORS allowed origin |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | No | `http://localhost:3001` | Backend API URL |

---

## 📡 API Documentation

### Health Check

```
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-09T10:00:00.000Z"
}
```

### Import CSV

```
POST /api/import
Content-Type: multipart/form-data
```

**Request Body:**
- `file` — CSV file (max 10MB)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "created_at": "2026-05-13 14:20:48",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "country_code": "+91",
        "mobile_without_country_code": "9876543210",
        "company": "GrowEasy",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "lead_owner": "",
        "crm_status": "GOOD_LEAD_FOLLOW_UP",
        "crm_note": "Interested in property investment",
        "data_source": "",
        "possession_time": "",
        "description": ""
      }
    ],
    "skipped": [
      {
        "rowIndex": 4,
        "originalData": { "name": "No Contact Person" },
        "reason": "No email or mobile number found"
      }
    ],
    "summary": {
      "totalRows": 10,
      "imported": 9,
      "skipped": 1,
      "processingTimeMs": 4523
    }
  }
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": {
    "message": "No file uploaded",
    "code": "NO_FILE"
  }
}
```

---

## 📄 Sample CSV Files

The `sample-csvs/` directory contains 5 diverse test files:

| File | Description | Columns |
|------|-------------|---------|
| `facebook_leads.csv` | Facebook Lead Ads export | full_name, email, phone_number, city, ad_name, etc. |
| `google_ads.csv` | Google Ads lead form export | First Name, Last Name, Phone Number, Campaign, etc. |
| `real_estate_crm.csv` | Property CRM with real estate fields | Buyer Name, Property Type, Budget, Possession Timeline, etc. |
| `messy_spreadsheet.csv` | Manually created with semicolons, missing data | Person Name, Email ID, Mobile No., Organisation, etc. |
| `minimal_data.csv` | Minimal valid data | name, email, phone |

---

## 🐳 Docker Setup

### Using Docker Compose

```bash
# Set your API key
export GEMINI_API_KEY=your_key_here

# Build and run
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Building Individually

```bash
# Backend
docker build -f Dockerfile.backend -t groweasy-backend ./backend

# Frontend
docker build -f Dockerfile.frontend -t groweasy-frontend ./frontend \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
```

### Manual Testing

1. Start both frontend and backend
2. Upload each sample CSV from `sample-csvs/`
3. Verify AI correctly maps columns to CRM fields
4. Check skipped records have proper reasons
5. Test edge cases: empty CSV, large file, wrong file type

---

## 📁 Project Structure

```
├── frontend/               # Next.js 15 frontend
│   └── src/
│       ├── app/            # Pages and layouts
│       ├── components/     # React components
│       │   ├── ui/         # Reusable UI primitives
│       │   ├── upload/     # File upload components
│       │   ├── preview/    # CSV preview table
│       │   └── results/    # CRM results display
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities and API client
│       └── types/          # TypeScript types
│
├── backend/                # Express.js backend
│   ├── src/
│   │   ├── config/         # Environment configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── prompts/        # AI prompt templates
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Helpers
│   │   └── validators/     # Zod schemas
│   └── tests/              # Unit tests
│
├── sample-csvs/            # Test CSV files
├── docker-compose.yml      # Docker orchestration
├── Dockerfile.backend      # Backend Docker build
├── Dockerfile.frontend     # Frontend Docker build
└── README.md               # This file
```

---

## 🚢 Deployment

### Frontend (Vercel)

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set environment variable: `NEXT_PUBLIC_API_URL` = your backend URL
4. Deploy

### Backend (Railway / Render)

1. Push to GitHub
2. Connect repo to [Railway](https://railway.app) or [Render](https://render.com)
3. Set root directory to `backend/`
4. Set environment variables: `GEMINI_API_KEY`, `FRONTEND_URL`
5. Set build command: `npm run build`
6. Set start command: `npm start`
7. Deploy

---

## 📝 AI Prompt Engineering

The system uses carefully engineered prompts to extract CRM fields from any CSV format:

1. **Schema Definition** — The AI receives the complete CRM field schema with descriptions
2. **Allowed Values** — Enum values for `crm_status` and `data_source` are explicitly listed
3. **Field Mapping Hints** — Common column name variations are provided (e.g., "Phone Number" → `mobile_without_country_code`)
4. **Few-Shot Examples** — Sample mappings from different CSV formats are included
5. **Strict Rules** — Handling multiple contacts, date formats, skip criteria
6. **JSON Mode** — Gemini's structured output ensures reliable JSON responses

---

## 📄 License

This project is built as a technical assessment for GrowEasy.

---

Built with ❤️ using Next.js, Express, and Google Gemini AI
