# 🚀 PulseCRM AI-Powered CSV Importer

An intelligent CSV importer that uses AI (Google Gemini 2.0 Flash) to automatically map and extract CRM lead information from **any** CSV format — Facebook Lead Exports, Google Ads, Real Estate CRMs, manually created spreadsheets, and more.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![Express](https://img.shields.io/badge/Express-4-green?style=flat-square&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-2.0_Flash-orange?style=flat-square&logo=google)

---

## 📌 Overview & Target Audience

> **What it is:**  
> **PulseCRM AI** is an intelligent importer that uses Google Gemini 2.0 Flash to automatically map, extract, and normalize lead data from **any** CSV format (Facebook Ads, Google Ads, messy spreadsheets) into structured CRM records without manual column setup.

> **Whom it helps most:**  
> **Sales teams, marketers, and real estate agencies** looking to eliminate hours of manual data entry and instantly ingest clean lead datasets.

---

## 📋 Table of Contents

- [Overview & Target Audience](#-overview--target-audience)
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
- 🤖 **AI-Powered Field Mapping** — Automatically maps any CSV column structure to PulseCRM format using Google Gemini 2.0 Flash
- 📤 **Drag & Drop Upload** — Resend UI drag & drop dropzone with delimiter auto-detection
- 📊 **Virtualized CSV Preview** — Lightweight preview table capable of rendering 10k+ rows effortlessly (@tanstack/react-virtual)
- 📋 **CRM Lead Dashboard** — High-contrast display of structured lead records with CRM status badges & phone normalization
- 📈 **Import Summary Auditing** — Statistics dashboard detailing total rows, successfully imported leads, and skipped invalid rows

### UI/UX & Design System
- 🌗 **Light & Dark Theme** — Resend UI inspired theme system with seamless toggle between obsidian dark canvas (`#050505`) and clean white canvas (`#FAFAFA`)
- 🪟 **Resend UI Primitives** — Pill tabs, glow cards, custom buttons, and pill status badges
- ✨ **Micro-Animations** — Fluid step transitions and spring physics powered by Framer Motion
- 📱 **Responsive Layout** — Flawless UI scaling across desktop, tablet, and mobile displays
- 🔄 **Live Progress Bar** — Step-by-step loading state feedback during parallel AI batch execution

### Engineering & Reliability
- 🔁 **Exponential Backoff & Rule-Based Fallback** — Resilience engine that automatically retries AI calls and falls back to deterministic rule mapping if API quota is reached
- 📦 **Chunked Batch Processing** — Splits large CSVs into optimized parallel AI request chunks
- 🛡️ **Type Safety & Strict Zod Validation** — Complete end-to-end TypeScript types with Zod runtime schema verification
- 🐳 **Docker Containerization** — Ready-to-use Dockerfiles and `docker-compose.yml` for 1-command deployment
- 🧪 **Vitest Test Suite** — Comprehensive unit testing suite covering parsing, batching, and AI mapping logic
- 🔒 **Security Best Practices** — Helmet HTTP headers, CORS origin controls, rate limiting, and safe file uploads

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
│ └───────────────────────────────────┼──────────────────────────────┘
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
| **Design System** | Resend UI Tokens, HSL Color Palettes, Vanilla CSS |
| **Tables** | @tanstack/react-table + @tanstack/react-virtual |
| **Upload** | react-dropzone |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Express.js, TypeScript |
| **CSV Engine** | PapaParse |
| **AI Processing** | Google Gemini 2.0 Flash SDK |
| **Validation** | Zod Schema Validation |
| **Testing** | Vitest |
| **DevOps** | Docker, docker-compose |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **npm** 9+
- **Google Gemini API Key** — Get one free at [ai.google.dev](https://ai.google.dev) *(Optional: rule-based fallback automatically triggers if no key is provided)*

### 1. Clone the repository

```bash
git clone https://github.com/piyusdev2006/csv_to_clean_crm_data.git
cd csv_to_clean_crm_data
```

### 2. Set up environment variables

Create a `.env` file in the root directory:

```env
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend server will run at **http://localhost:3001**

### 4. Start the Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The web application will open at **http://localhost:3000**

---

## 🔌 API Documentation

### `POST /api/import`
Uploads and parses a CSV file into PulseCRM lead format.

- **Content-Type**: `multipart/form-data`
- **Body Field**: `file` (CSV / TSV / TXT up to 10MB)

#### Example Success Response (200 OK)
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "name": "Rahul Sharma",
        "email": "rahul.sharma@gmail.com",
        "crm_status": "GOOD_LEAD_FOLLOW_UP",
        "company": "Property Investment Ad",
        "city": "Mumbai",
        "country": "India",
        "crm_note": "Interested in property investment from lead gen form",
        "data_source": "Facebook Leads",
        "mobile_without_country_code": "9876543210",
        "country_code": "+91"
      }
    ],
    "skipped": [],
    "summary": {
      "total": 1,
      "imported": 1,
      "skipped": 0
    }
  }
}
```

---

## 📁 Sample CSV Files

Try preset sample datasets provided in `sample-csvs/`:
- `facebook_leads.csv` — Facebook Lead Ads export format
- `google_ads.csv` — Google Search & Display campaign lead export
- `real_estate_crm.csv` — Real Estate CRM spreadsheet with custom columns
- `messy_spreadsheet.csv` — Semicolon-delimited spreadsheet with unstructured notes

---

## 🐳 Docker Setup

Run both Frontend and Backend with a single command:

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## 🧪 Testing

Run backend Vitest unit tests:

```bash
cd backend
npm test
```

---

## 📄 License

MIT License. Designed & Developed for PulseCRM AI.
