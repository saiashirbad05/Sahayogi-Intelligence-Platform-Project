# Sahayogi — Community Risk Intelligence Platform

> NGOs in rural India are drowning in paper surveys and delayed reports. By the time risk data reaches anyone who can act on it, the window for response has already closed. Sahayogi fixes that.

**Live app** → [sahayogi-platform-361086288497.us-central1.run.app](https://sahayogi-platform-361086288497.us-central1.run.app)  
**Demo video** → [youtu.be/GSjsHuSuTTY](https://youtu.be/GSjsHuSuTTY)  
**Trained files / reports** → [storage.googleapis.com/sahayogi-reports](https://storage.googleapis.com/sahayogi-reports)

---

## What it does

Field workers upload a CSV survey file. Gemini AI reads every row, flags bad data, and either rejects the file with specific error details or approves it for the registry. Once the data is in, Gemini generates a village-wise action plan — what to deploy, in what order, with urgency tags — in seconds.

NGO coordinators get a live risk dashboard. No more waiting for someone to manually compile a report.

It also works offline. Remote villages often have no connectivity. The PWA caches what it needs so field workers can still access reports and submit data when the internet comes back.

---

## Who it's for

- **Field workers** uploading community survey data from the ground
- **NGO coordinators** monitoring risk across multiple villages
- **District-level responders** who need prioritized action plans fast

---

## What's inside

**50,000+ verified organizations** in a searchable national registry — NGOs, NPOs, field volunteers — filterable by region, specialty, and impact rating.

**Gemini AI audit layer** that scans uploaded CSVs before anything touches the database. Bad data gets caught here, not three steps later.

**Village-wise action plans** generated from validated survey data. Not generic advice — specific interventions (flood relief kits, water purification, health camps) with timelines per village.

**Interactive India risk map** showing need scores by region so coordinators see where attention is needed at a glance.

**Field identity proofs** auto-generated for verified organizations — useful for coordination with government bodies and partner NGOs.

---

## Tech stack

| Layer | What we used |
|---|---|
| Frontend | React, TypeScript, Vite 8.5, HTML, CSS, JS |
| AI | Gemini API (audit + action plan generation) |
| Backend | Python |
| Auth | Google OAuth |
| Database | Supabase (PostgreSQL, real-time) |
| Storage | Google Cloud Storage |
| Hosting | Google Cloud Run |
| CI/CD | Cloud Build + Artifact Registry |
| Offline | Workbox service workers (PWA) |
| Motion | Framer Motion |
| Maps | React Simple Maps |

---

## Running it locally

**Prerequisites:** Node.js v18+, a Supabase project, a Gemini API key

```bash
git clone https://github.com/your-org/sahayogi-platform
cd sahayogi-platform
npm install
```

Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

```bash
npm run dev      # development server
npm run build    # production build
```

---

## Project structure

```
src/
├── components/   # UI components (exported via index.ts)
├── pages/        # Routes — Home, Dashboard, Explore, etc.
├── lib/          # Core logic — Supabase client, AI engine, image resolution
├── types/        # TypeScript interfaces for NGOs and volunteers
└── data/         # Registry datasets (50,000+ records)
```

---

## Deployment

The app runs on Google Cloud Run, built via Cloud Build and pushed to Artifact Registry. Deployment uses Kaniko with no-cache builds to avoid stale layers.

The GCS bucket at `storage.googleapis.com/sahayogi-reports` holds trained files, PDFs, and exported reports — all cached by the Workbox service worker for offline access.

---

## What's next

- Regional language support (Odia, Hindi, Bengali) for field workers
- Android app with native offline data collection and GPS-tagged submissions
- Predictive risk modeling trained on historical village survey data
- Inter-NGO resource sharing and coordination dashboard
- Government disaster management API integration
- IoT sensor feeds (flood level, air quality, soil moisture) into the risk engine

---

## Ethics

Sahayogi handles data about vulnerable communities. All data is governed by principles of privacy, accuracy, and protection of the people it's meant to serve. The platform is built for humanitarian coordination — nothing else.

---

Built for **Google Solution Challenge 2026**.  
Community first.
