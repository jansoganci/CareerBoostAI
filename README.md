# CareerBoost AI

AI-powered job matching, cover letter, and resume optimization (React + TypeScript + Gemini 1.5 Flash).

## Features

- 🎯 Smart Job Matching (CV ↔ Job Description)
- 📝 Cover Letter Generation
- 🔧 Resume Optimization (ATS-friendly)
- 💬 AI Career Advisor (chat)
- 📄 Export: PDF / DOCX
- 🌍 i18n: en, tr (+ es, de, zh, ko, ja, ar)

## Stack

- Frontend: React 18, TypeScript, Vite, Tailwind, react-i18next, zod
- AI: Google Gemini 1.5 Flash via secure proxy
- Dev Proxy: `server/dev-api.js` (Node http, in-memory rate limit)
- Prod Proxy: `api/ai/proxy.js` (Vercel Functions) + Upstash rate limit (ops.)
- Files: `pdfjs-dist` (PDF), `mammoth` (DOCX)
- Analytics: GA4 (gtag, MI: `G-R2KKQRB75Z`)
- Error monitoring: Sentry (optional)

## Project Structure

```
api/                 # Vercel Functions (production AI proxy)
server/dev-api.js    # Local dev API proxy (http://localhost:3001)
src/
  components/        # UI components
  services/          # AI services and orchestration
  utils/             # helpers (errors, analytics, file processing)
  locales/           # i18n resources
  i18n.ts            # i18n init
public/              # static assets (privacy.html, terms.html, robots.txt, sitemap.xml)
```

## Setup (Local Dev)

1) Install deps
```bash
npm install
```

2) Create `.env.local`
```env
GEMINI_API_KEY=your_gemini_api_key
# optional
RATE_LIMIT_PER_MIN=20
VITE_SENTRY_DSN=
```

3) Run
```bash
npm run dev
# Web: http://localhost:5173
# API: http://localhost:3001 (proxied via /api)
```

## Deployment (Vercel)

Set project envs:

- `GEMINI_API_KEY`
- (optional) `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `RATE_LIMIT_PER_MIN`
- (optional) `VITE_SENTRY_DSN`

Push to GitHub → Vercel deploy. Smoke test: CV/Job match/Chat/Export and 429 limit.

## Analytics

GA4 Measurement ID is embedded in `index.html` (`G-R2KKQRB75Z`). Replace if needed.

## Legal & Privacy (MVP)

- Publish: `public/privacy.html`, `public/terms.html` (and `public/imprint.html` if DE)
- Cookies/Consent: informational banner if Ads/Analytics in use
- PII logging disabled in production; CSP meta added (use real headers in prod)

## Notes

⚠️ AI content must be reviewed by the user.

🔒 Data is processed locally and sent to Gemini for analysis.

## Contributing

1) Fork repo → 2) Branch → 3) Code → 4) Test → 5) PR

## License

MIT License - see LICENSE
